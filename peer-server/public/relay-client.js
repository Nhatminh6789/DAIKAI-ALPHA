// Máy khách "relay": thay PeerJS bằng WebSocket qua máy chủ (Fly.io).
// Có cùng giao diện với PeerJS mà game đang dùng: new RelayPeer(id,url), .on/.connect/.destroy/.reconnect,
// và đối tượng kết nối có .on('open'|'data'|'close'|'error'), .send(), .close(), .open
class RelayConn{
  constructor(pe,cid,peer){this.pe=pe;this.cid=cid;this.peer=peer||'';this.open=false;this.closed=false;this.L={}}
  on(e,f){(this.L[e]=this.L[e]||[]).push(f);return this}
  emit(e,a){for(const f of (this.L[e]||[]).slice()){try{f(a)}catch(x){console.error(x)}}}
  send(m){if(this.open)this.pe.tx({t:'d',cid:this.cid,m})}
  _up(){if(this.closed||this.open)return;this.open=true;this.emit('open')}
  _down(){if(this.closed)return;this.closed=true;this.open=false;this.pe.conns.delete(this.cid);this.emit('close')}
  close(){if(this.closed)return;const had=this.cid!=null;this._down();if(had)this.pe.tx({t:'cl',cid:this.cid})}
}
class RelayPeer{
  constructor(id,url){this.id=id||null;this.url=url;this.L={};this.conns=new Map();this.pend=new Map();this.refN=0;this.dead=false;this.opened=false;this.ws=null;this.hbT=0;this.rt=0;this._open()}
  on(e,f){(this.L[e]=this.L[e]||[]).push(f);return this}
  emit(e,a){for(const f of (this.L[e]||[]).slice()){try{f(a)}catch(x){console.error(x)}}}
  tx(o){const w=this.ws;if(w&&w.readyState===1){try{w.send(JSON.stringify(o))}catch(e){}}}
  ping(){this.tx({t:'hb',ts:performance.now()})}
  _open(){if(this.dead)return;let ws;try{ws=new WebSocket(this.url)}catch(e){setTimeout(()=>this.emit('error',{type:'network'}),0);return}
    this.ws=ws;let ok=false;
    ws.onopen=()=>{ok=true;this.tx({t:'reg',id:this.id||undefined});clearInterval(this.hbT);this.hbT=setInterval(()=>this.ping(),20000)};
    ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch(e){return}this._rx(m)};
    ws.onerror=()=>{};
    ws.onclose=()=>{clearInterval(this.hbT);if(this.ws!==ws)return;
      for(const c of [...this.conns.values()])c._down();
      for(const c of [...this.pend.values()])c._down();this.pend.clear();
      if(this.dead)return;
      if(!ok&&!this.opened){this.emit('error',{type:'network'});return}
      this.emit('disconnected')}}
  _rx(m){switch(m.t){
    case 'open':this.id=m.id;this.opened=true;this.emit('open',m.id);break;
    case 'err':{if(m.ref!=null){const c=this.pend.get(m.ref);if(c){this.pend.delete(m.ref);c.closed=true}}this.emit('error',{type:m.type||'server-error'});break}
    case 'inc':{const c=new RelayConn(this,m.cid,m.from);this.conns.set(m.cid,c);this.emit('connection',c);c._up();break}
    case 'acc':{const c=this.pend.get(m.ref);if(!c)return;this.pend.delete(m.ref);c.cid=m.cid;this.conns.set(m.cid,c);c._up();break}
    case 'd':{const c=this.conns.get(m.cid);if(c)c.emit('data',m.m);break}
    case 'cl':{const c=this.conns.get(m.cid);if(c)c._down();break}
    case 'hb':this.emit('hb',performance.now()-m.ts);break}}
  connect(to){const ref=++this.refN,c=new RelayConn(this,null,to);this.pend.set(ref,c);this.tx({t:'conn',to,ref});return c}
  reconnect(){if(this.dead||(this.ws&&this.ws.readyState<2)||this.rt)return;this.rt=setTimeout(()=>{this.rt=0;this._open()},1500)}
  destroy(){if(this.dead)return;this.dead=true;clearInterval(this.hbT);clearTimeout(this.rt);for(const c of [...this.conns.values()])c.close();try{this.ws&&this.ws.close()}catch(e){}}
}
