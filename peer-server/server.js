// Máy chủ backend của game (chạy trên Fly.io): WebSocket relay + ghép đôi.
// Hai người chơi nối vào đây rồi mọi gói tin của trận đi qua máy chủ => không cần P2P/WebRTC/NAT/TURN,
// chạy được cả khi bật VPN hay mạng di động.
const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT) || 9000;
const REGION = process.env.FLY_REGION || 'local';
const ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://nhatminh6789.github.io').split(',').map(s => s.trim()).filter(Boolean);
const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;
const MAX_LINKS_PER_WS = 8;

const peers = new Map();   // id -> ws
const links = new Map();   // cid -> {a, b}
let cidN = 0;
const started = Date.now();
const stat = { sockets: 0, pairs: 0, msgs: 0 };
const log = (...a) => console.log(new Date().toISOString(), ...a);
const send = (ws, o) => { if (ws.readyState === 1) ws.send(JSON.stringify(o)); };
const rnd = () => Math.random().toString(36).slice(2, 12);

function originOk(req) {
  const o = req.headers.origin;
  if (!o) return true;
  if (ORIGINS.includes('*') || ORIGINS.includes(o)) return true;
  try { return new URL(o).host === req.headers.host; } catch (e) { return false; }
}

const PUB = path.join(__dirname, 'public');
const FILES = {
  '/test': ['test.html', 'text/html; charset=utf-8'],
  '/relay-client.js': ['relay-client.js', 'application/javascript; charset=utf-8']
};

function statsObj() {
  const slots = [], rooms = { n: 0 };
  for (const id of peers.keys()) {
    let m = /^daikai-q(\d+)$/.exec(id);
    if (m) { const s = m[1]; slots.push({ tier: Number(s.slice(0, -1)), slot: Number(s.slice(-1)) }); continue; }
    if (/^daikai-[A-Z2-9]{5}$/.test(id)) rooms.n++;
  }
  slots.sort((a, b) => a.tier - b.tier || a.slot - b.slot);
  return {
    ok: true, name: 'daikai-relay', region: REGION, uptimeSec: Math.round((Date.now() - started) / 1000),
    online: peers.size, activeMatches: links.size, waitingRooms: rooms.n, rankSlots: slots,
    totals: { sockets: stat.sockets, pairs: stat.pairs, msgs: stat.msgs }
  };
}

const server = http.createServer((req, res) => {
  const u = (req.url || '/').split('?')[0];
  if (u === '/' || u === '/health' || u === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(statsObj()));
    return;
  }
  const f = FILES[u];
  if (f) {
    try {
      const b = fs.readFileSync(path.join(PUB, f[0]));
      res.writeHead(200, { 'Content-Type': f[1], 'Cache-Control': 'no-store' });
      res.end(b);
    } catch (e) { res.writeHead(500); res.end('lỗi'); }
    return;
  }
  res.writeHead(404); res.end('not found');
});

const wss = new WebSocketServer({
  server, path: '/ws', maxPayload: 512 * 1024,
  verifyClient: info => originOk(info.req)
});

function drop(cid, ws) {
  const L = links.get(cid);
  if (!L || (L.a !== ws && L.b !== ws)) return;
  links.delete(cid);
  L.a.mine.delete(cid); L.b.mine.delete(cid);
  send(L.a === ws ? L.b : L.a, { t: 'cl', cid });
}

wss.on('connection', (ws, req) => {
  ws.alive = true; ws.id = null; ws.mine = new Set();
  stat.sockets++;
  ws.on('pong', () => { ws.alive = true; });
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;
    ws.alive = true; stat.msgs++;
    switch (m.t) {
      case 'reg': {
        if (ws.id) return;
        let id = m.id;
        if (id != null) {
          if (typeof id !== 'string' || !ID_RE.test(id)) { send(ws, { t: 'err', type: 'invalid-id' }); return; }
          if (peers.has(id)) { send(ws, { t: 'err', type: 'unavailable-id' }); return; }
        } else { do { id = 'p' + rnd(); } while (peers.has(id)); }
        ws.id = id; peers.set(id, ws);
        send(ws, { t: 'open', id });
        break;
      }
      case 'conn': {
        if (!ws.id) return;
        const to = m.to, ref = m.ref, tw = typeof to === 'string' ? peers.get(to) : null;
        if (!tw || tw === ws || ws.mine.size >= MAX_LINKS_PER_WS || tw.mine.size >= MAX_LINKS_PER_WS) { send(ws, { t: 'err', type: 'peer-unavailable', ref }); return; }
        const cid = ++cidN;
        links.set(cid, { a: ws, b: tw }); ws.mine.add(cid); tw.mine.add(cid);
        send(tw, { t: 'inc', cid, from: ws.id });
        send(ws, { t: 'acc', cid, ref });
        stat.pairs++;
        log('pair', ws.id, '->', to, '| trận đang chạy:', links.size);
        break;
      }
      case 'd': {
        const L = links.get(m.cid);
        if (!L) return;
        const o = L.a === ws ? L.b : L.b === ws ? L.a : null;
        if (o) send(o, { t: 'd', cid: m.cid, m: m.m });
        break;
      }
      case 'cl': drop(m.cid, ws); break;
      case 'hb': send(ws, { t: 'hb', ts: m.ts }); break;
    }
  });
  ws.on('close', () => {
    for (const cid of [...ws.mine]) drop(cid, ws);
    if (ws.id && peers.get(ws.id) === ws) peers.delete(ws.id);
  });
  ws.on('error', () => {});
});

setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) { ws.terminate(); continue; }
    ws.alive = false; try { ws.ping(); } catch (e) {}
  }
}, 25000);

server.listen(PORT, () => log('Relay chạy ở cổng ' + PORT + ' · vùng ' + REGION + ' · origins: ' + ORIGINS.join(',')));
