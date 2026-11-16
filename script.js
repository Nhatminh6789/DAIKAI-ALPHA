// ===== Cấu hình máy chủ ghép trận (PeerJS) =====
// Mặc định dùng máy chủ miễn phí chung của PeerJS (đặt ở Mỹ). Muốn chuyển sang máy chủ ở châu Á:
// điền host/port/path/secure của máy chủ bạn vào PEER_OPTS (xem peer-server/HUONG_DAN.md).
// Ví dụ: const PEER_OPTS={host:'daikai-peer.fly.dev',port:443,path:'/',secure:true};
// Muốn thêm máy chủ chuyển tiếp TURN: thêm config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'turn:...',username:'...',credential:'...'}]}
const PEER_OPTS={};
// Máy chủ relay (Fly.io). Điền wss://TÊN-APP.fly.dev/ws ; để trống = dùng PeerJS P2P như cũ.
// Có thể thử nhanh bằng cách mở game kèm ?relay=wss://TÊN-APP.fly.dev/ws (chỉ nhận địa chỉ *.fly.dev)
const RELAY_URL='wss://daikai-server-tendo09124567.fly.dev/ws';
const mkPeer=id=>RELAY_URL?new RelayPeer(id||null,RELAY_URL):(id?new Peer(id,PEER_OPTS):new Peer(PEER_OPTS));
const mkI=b=>{const i=new Image();i.src=b;return i};const CHS=[{k:1.0562,fy:0.4259,im:['assets/images/char_hachi_idle.png','assets/images/char_hachi_right.png','assets/images/char_hachi_left.png'].map(mkI)},{k:1.05,fy:0.4285,im:['assets/images/char_sanyo_idle.png','assets/images/char_sanyo_right.png','assets/images/char_sanyo_left.png'].map(mkI),ov:['assets/images/char_sanyo_ov_idle.png','assets/images/char_sanyo_ov_right.png','assets/images/char_sanyo_ov_left.png'].map(mkI)},{k:1.05,fy:0.4285,im:['assets/images/char_jin_idle.png','assets/images/char_jin_right.png','assets/images/char_jin_left.png'].map(mkI)}];const W=384,H=448,cv=document.getElementById('c'),ctx=cv.getContext('2d');
const EMJ=new Image();EMJ.src='assets/images/emj.png';
const LF_S=new Image(),LF_B=new Image();LF_S.src='assets/images/leaf_s.png';LF_B.src='assets/images/leaf_b.png'; // quái stage 1: lá nhỏ / lá lớn
const ITI={p:new Image(),s:new Image(),m:new Image()};ITI.p.src='assets/images/it_p.png';ITI.s.src='assets/images/it_s.png';ITI.m.src='assets/images/it_m.png';const ITH={p:22,s:22,m:28}; // vật phẩm: P ngũ giác · S tam giác · M lục giác (chiều cao vẽ)
const BGI=new Image();BGI.src='assets/images/bgi.png';
const BOSS1I=new Image();BOSS1I.src='assets/images/boss1i.png';
const BOSS1P=[0,1,2,3,4,5].map(i=>{const m=new Image();m.src='assets/images/boss1_'+i+'.png';return m}); // 0 đứng yên, 1 rẽ trái, 2 rẽ phải, 3 ziuder, 4 ziuder rẽ trái, 5 ziuder rẽ phải, 4 ziuder nghiêng trái, 5 ziuder nghiêng phải
const HAMIN=new Image();HAMIN.src='assets/images/hamin.png';
const B2P=[0,1,2,3].map(i=>{const m=new Image();m.src='assets/images/b2_'+i+'.png';return m}),B3P=[0,1,2].map(i=>{const m=new Image();m.src='assets/images/b3_'+i+'.png';return m}); // Xeno: thường/trái/phải/zilder · Hamin: thường/trái/phải
const BOSSI=new Image();BOSSI.src='assets/images/bossi.png';
const T2_B1=61,T2_END1=82,T2_B2=120,T_B1=50,T_B1_END=65,T_B2=98,BG_SPEED=1.2,BG_DARK=.38;
const STG_B64='assets/sounds/stage.m4a';
const aud=new Audio(STG_B64);aud.preload='auto';
let audN=1,sg2=0,ret2=0;const STG2='assets/sounds/stage2.mp3',STG3='assets/sounds/stage3.mp3';function setAud(n){if(audN===n)return;audN=n;aud.src=n>=3?STG3:n>=2?STG2:STG_B64;aud.load()} // n: 1 stage 1 · 2 stage 2 · 3 stage 3 · 4 PVP (stage 3 và PVP dùng stage3.mp3)
const aud2=new Audio('assets/sounds/boss_stage2.mp3');aud2.loop=true;aud2.preload='auto';
const aud3=new Audio('assets/sounds/boss_stage3.mp3');aud3.loop=true;aud3.preload='auto';let sg3=0,ret3=0;
let paused=false,pbShown=false;const pz=document.getElementById('pz'),pauseB=document.getElementById('pauseB');
function setPause(v){if(upgOn||(v&&state!=='play'))return;if(MP.on){pz.style.display=v?'flex':'none';return}paused=v;pz.style.display=v?'flex':'none'}
pauseB.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();setPause(true)});
document.getElementById('pzR').addEventListener('click',()=>setPause(false));
document.getElementById('pzS').addEventListener('click',()=>{setPause(false);start()});
document.getElementById('pzQ').addEventListener('click',()=>{setPause(false);over()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!MP.on)setPause(true)});
const FK={on:0,name:'',oe:0};let s2cg=null;let stg=1,s2t=0,s2i=0,s2bn=0,s2b1=0,s2b2=0,s2bw=0;
const CH_SPD=[.8,1.25,1],CH_HB=[.68,1.43,1];
let hbS=1,spdM=1;let zn=[],fbs=[],rk=[],ths=[],idleT=0,edgeT=0,burn=0,wet=0,icy=0,ancX=-999,ancY=-999,thCd=0;let gt=0,b1s=0,b2s=0,b1Left=0,retryA=0,b2Mana=0,toast=null,lz=[],lf=[];
const PW_LOSS=10,DB_FRAMES=30,PHASE_TIME=1800;
const BM_B64='assets/sounds/boss_phase2.mp3';
const bm=(()=>{let ctx=null,buf=null,src=null,gain=null,loading=0,susp=false,mv=1;const XF=2.0;
async function load(){if(loading)return;loading=1;try{const AC=window.AudioContext||window.webkitAudioContext;ctx=new AC();
const u=new Uint8Array(await(await fetch(BM_B64)).arrayBuffer());
const b=await new Promise((res,rej)=>{const p=ctx.decodeAudioData(u.buffer,res,rej);if(p&&p.catch)p.catch(rej)});
const sr=b.sampleRate,N=b.length,ch=b.numberOfChannels;let S=0;
outer:for(;S<N;S++)for(let c=0;c<ch;c++)if(Math.abs(b.getChannelData(c)[S])>.004)break outer;
const Xs=Math.round(XF*sr),Ls=N-S-Xs;buf=ctx.createBuffer(ch,Ls,sr);
for(let c=0;c<ch;c++){const d=b.getChannelData(c),o=buf.getChannelData(c);
for(let i=Ls-1;i>=Xs;i--)o[i]=d[S+i];
for(let i=0;i<Xs;i++){const t=i/Xs*Math.PI/2;o[i]=d[S+i]*Math.sin(t)+d[S+Ls+i]*Math.cos(t)}}
}catch(e){buf=null}}
function stopNow(){if(!src)return;try{src.stop()}catch(e){}src=null}
return{load,setVol(v){mv=v;if(gain&&src&&ctx){try{gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.setValueAtTime(.7*mv,ctx.currentTime)}catch(e){}}},
reset(){stopNow();if(ctx&&susp){susp=false;try{ctx.resume()}catch(e){}}},
resume(){if(ctx)try{ctx.resume()}catch(e){}},
sync(want,run){if(!ctx||!buf)return;
if(!run){if(!susp){susp=true;try{ctx.suspend()}catch(e){}}return}
if(susp){susp=false;try{ctx.resume()}catch(e){}}
const now=ctx.currentTime;
if(want&&!src){gain=ctx.createGain();gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.7*mv,now+.4);
src=ctx.createBufferSource();src.buffer=buf;src.loop=true;src.connect(gain);gain.connect(ctx.destination);src.start()}
else if(!want&&src){const sx=src,g=gain;src=null;try{g.gain.cancelScheduledValues(now);g.gain.setValueAtTime(g.gain.value,now);g.gain.linearRampToValueAtTime(0,now+.8)}catch(e){}setTimeout(()=>{try{sx.stop()}catch(e){}},900)}}}})();
let stgBase=.7,sg=0;
function stgVol(v){stgBase=Math.min(1,.7*v);bm.setVol(v)}
function stgClock(){if(!aud.paused&&aud.readyState>=2&&!aud.error){gt=aud.currentTime;}else gt+=1/60} // stage 3: Hamin lần 2 => nhạc lặp lại phần boss từ 2:30
function stgSync(run){const boss=!!bs&&!bs.lv&&bs.ph===2,b2=boss&&stg===2,b3=boss&&stg===3;bm.sync(boss&&!b2&&stg!==3&&mus.isOn(),run);
if(!run){if(!aud.paused)aud.pause();if(!aud2.paused)aud2.pause();if(!aud3.paused)aud3.pause();return}
if(b2){sg2=Math.min(1,sg2+1/20);aud2.muted=!mus.isOn();if(aud2.paused&&--ret2<=0){ret2=60;const p=aud2.play();if(p&&p.catch)p.catch(()=>{})}}else{sg2=Math.max(0,sg2-1/20);if(sg2===0&&!aud2.paused)aud2.pause()}
if(b3){sg3=Math.min(1,sg3+1/20);aud3.muted=!mus.isOn();if(aud3.paused&&--ret3<=0){ret3=60;const p=aud3.play();if(p&&p.catch)p.catch(()=>{})}}else{sg3=Math.max(0,sg3-1/20);if(sg3===0&&!aud3.paused)aud3.pause()}
if(!boss&&!clr){if(aud.paused&&--retryA<=0){retryA=60;try{if(Math.abs(aud.currentTime-gt)>.3)aud.currentTime=gt}catch(e){}aud.muted=!mus.isOn();const p=aud.play();if(p&&p.catch)p.catch(()=>{})}sg=Math.min(1,sg+1/20)}
else{sg=Math.max(0,sg-1/20);if(sg===0&&!aud.paused)aud.pause()}
aud.volume=Math.min(1,stgBase*sg);aud2.volume=Math.min(1,stgBase*sg2);aud3.volume=Math.min(1,stgBase*sg3)}
function spawnOK(){return gt<T_B1||(b1Left&&gt<T_B2)}
let bs=null,bossDone=0,clr=0,endT=0;
const mkBoss=ph=>({x:W/2,y:-70,t:0,hp:ph===1?200:140,max:ph===1?200:140,on:0,sp:0,ph,bar:0,bars:ph===1?1:5,inv:0,lv:0,pt:0,clean:1,txt:0,mph:0,amp:100,my:0,tx:W/2,lim:1800,sd:0,rs:12345,ci:0});
let bombQ=0;const K={shoot:0,slow:0,bomb:0},kb={l:0,r:0,u:0,d:0},dp={x:0,y:0};
const RC=new Map(),rectOf=el=>{let r=RC.get(el);if(!r){r=el.getBoundingClientRect();RC.set(el,r)}return r};
addEventListener('resize',()=>RC.clear());addEventListener('orientationchange',()=>RC.clear());
const pad=document.getElementById('dpad'),ps=[...pad.children];
function dpUpdate(e){const r=rectOf(pad),x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2),t=.28;
dp.x=Math.abs(x)>t?Math.sign(x):0;dp.y=Math.abs(y)>t?Math.sign(y):0;
ps[0].classList.toggle('on',dp.y<0);ps[1].classList.toggle('on',dp.y>0);ps[2].classList.toggle('on',dp.x<0);ps[3].classList.toggle('on',dp.x>0)}
function dpEnd(){dp.x=dp.y=0;ps.forEach(p=>p.classList.remove('on'))}
pad.addEventListener('pointerdown',e=>{RC.delete(pad);pad.setPointerCapture(e.pointerId);dpUpdate(e);e.preventDefault()});
pad.addEventListener('pointermove',e=>{if(pad.hasPointerCapture(e.pointerId))dpUpdate(e)});
['pointerup','pointercancel','lostpointercapture'].forEach(n=>pad.addEventListener(n,dpEnd));
const bt=document.getElementById('btns'),bEl={bomb:document.querySelector('[data-k=bomb]'),shoot:document.querySelector('[data-k=shoot]'),slow:document.querySelector('[data-k=slow]')},fing=new Map();
function hitB(x,y){let best=null,bd=1.05;for(const k in bEl){const r=rectOf(bEl[k]),d=Math.hypot(x-r.left-r.width/2,y-r.top-r.height/2)/(r.width/2);if(d<bd){bd=d;best=k}}return best}
function bUpdate(){const wasB=K.bomb;K.shoot=K.slow=K.bomb=0;for(const f of fing.values()){if(f.o==='shoot'){K.shoot=1;if(f.c==='slow')K.slow=1}else if(f.o==='slow')K.slow=1;else if(f.o==='bomb'&&f.c==='bomb')K.bomb=1}if(K.bomb&&!wasB&&state==='play'&&!paused)bombQ=1;for(const k in bEl)bEl[k].classList.toggle('on',!!K[k])}
bt.addEventListener('pointerdown',e=>{if(!fing.size)for(const k in bEl)RC.delete(bEl[k]);const h=hitB(e.clientX,e.clientY);if(!h)return;bt.setPointerCapture(e.pointerId);fing.set(e.pointerId,{o:h,c:h});bUpdate();e.preventDefault()});
bt.addEventListener('pointermove',e=>{const f=fing.get(e.pointerId);if(f){f.c=hitB(e.clientX,e.clientY);bUpdate()}});
['pointerup','pointercancel','lostpointercapture'].forEach(n=>bt.addEventListener(n,e=>{fing.delete(e.pointerId);bUpdate()}));
document.addEventListener('contextmenu',e=>e.preventDefault());
['gesturestart','gesturechange','gestureend'].forEach(n=>document.addEventListener(n,e=>e.preventDefault(),{passive:false}));
document.addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('selectstart',e=>e.preventDefault());
document.addEventListener('dragstart',e=>e.preventDefault());
document.addEventListener('touchstart',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
let _lt=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-_lt<350&&!(e.target.closest&&e.target.closest('button')))e.preventDefault();_lt=n},{passive:false});
addEventListener('scroll',()=>{if(scrollX||scrollY)scrollTo(0,0)});
document.addEventListener('touchmove',e=>{const t=e.target,x=t&&t.closest?t.closest('.scy'):null;if(x&&x.scrollHeight>x.clientHeight+1)return;e.preventDefault()},{passive:false});
const km={ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d'};
const ISPC=matchMedia('(hover:hover) and (pointer:fine)').matches;document.body.classList.toggle('pc',ISPC);
const KBD={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',shoot:'KeyZ',bomb:'KeyX',slow:'ShiftLeft',pause:'KeyP',n1:'Digit1',n2:'Digit2',n3:'Digit3',n4:'Digit4'},KBM={...KBD},KPLAY={tgS:0,tgW:0};
let kbCap=null;
addEventListener('keydown',e=>{if(!kbCap)return;e.stopImmediatePropagation();e.preventDefault();kbCap(e)},true);
const kcode=e=>e.code==='ShiftRight'?'ShiftLeft':e.code.replace('Numpad','Digit'),kact=e=>{const c=kcode(e);for(const a in KBM)if(KBM[a]===c)return a;return null};
const KDIR={up:'u',down:'d',left:'l',right:'r'};
addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const a=kact(e);
if(a){if(KDIR[a])kb[KDIR[a]]=1;
else if(a==='shoot'){if(!e.repeat)K.shoot=KPLAY.tgS?(K.shoot?0:1):1}
else if(a==='slow'){if(!e.repeat)K.slow=KPLAY.tgW?(K.slow?0:1):1}
else if(a==='bomb'){if(!K.bomb&&state==='play'&&!paused)bombQ=1;K.bomb=1}
else if(a==='pause'&&state==='play'&&!e.repeat)setPause(!paused)}
if(e.key==='Escape'&&state==='play'&&!e.repeat)setPause(!paused);
if(e.key==='Enter'&&state!=='play'&&stage==='menu'&&!editing&&msel.style.display!=='flex'&&!LB.open)openCsel();
if(a||e.key.startsWith('Arrow')||e.key===' '||e.key==='Enter'||e.key==='Escape')e.preventDefault()});
addEventListener('keyup',e=>{const a=kact(e);if(!a)return;if(KDIR[a])kb[KDIR[a]]=0;else if(a==='shoot'){if(!KPLAY.tgS)K.shoot=0}else if(a==='slow'){if(!KPLAY.tgW)K.slow=0}else if(a==='bomb')K.bomb=0});
addEventListener('blur',()=>{kb.l=kb.r=kb.u=kb.d=0;K.bomb=0;if(!KPLAY.tgS)K.shoot=0;if(!KPLAY.tgW)K.slow=0});
const ov=document.getElementById('ov'),msg=document.getElementById('msg');
const HBK=new Image(),HBR=new Image();HBK.src='assets/images/hbk.png';HBR.src='assets/images/hbr.png';
const WGH=new Image();WGH.src='assets/images/wing_sanyo_holo.png';const WGM=new Image();WGM.src='assets/images/wing_sanyo_metal.png';
function drawWings(c,x,y,dh,pose){if(!WGH.complete||!WGH.naturalWidth||!WGM.complete||!WGM.naturalWidth)return;
const tt=typeof t==='number'?t:0,ww=dh*1.18,wh=ww*WGH.naturalHeight/WGH.naturalWidth,fl=Math.sin(tt/9),
al=.5+.08*Math.sin(tt/5)+(tt%113<3?-.18:0);
c.save();c.translate(x,y-dh*.03);c.rotate(pose===1?.12:pose===2?-.12:0);c.scale(1+.05*fl,1+.03*fl);
c.globalAlpha=Math.max(.2,al);c.drawImage(WGH,-ww/2,-wh/2,ww,wh);
c.globalCompositeOperation='lighter';c.globalAlpha=.16+.05*Math.sin(tt/6);c.drawImage(WGH,-ww/2,-wh/2,ww,wh);
c.globalCompositeOperation='source-over';c.globalAlpha=1;c.drawImage(WGM,-ww/2,-wh/2,ww,wh);c.restore()}
const SPR_H=48,HBFY=.4249;function drawChar(c,ch,x,y,pose,ax){const S=CHS[ch],im=S.im[pose];if(!im.complete||!im.naturalWidth)return;const dh=SPR_H*S.k,dw=dh*im.naturalWidth/im.naturalHeight,X=x-dw/2,Y=y-dh*S.fy;if(ch===1)drawWings(c,x,y,dh,pose);c.drawImage(im,X,Y,dw,dh);if(ax&&S.ov&&S.ov[pose].complete)c.drawImage(S.ov[pose],X,Y,dw,dh)}
const HB_H=SPR_H,HB_A=.28;
const MAG=30,JIN_DMG=33/36,JIN_IV=60/11/6;
let CH=0,axs=[],axH=1,axT=0,axTg=0,axLast=0;let state='title',P,pb,eb,en,fx,t,score,spawnT,bombT,lastBomb=0,shotT,rc=0,RY=64,G0=10,ammo=MAG,rl=0;
let tr=[],sprayI=0,sprayT=99,mvg=0,mvB=0,spB=0,dr=0,drOff=0,dying=0,items=[],lvP=0,lvS=0;
function spread(){return mvB+spB}
function ivl(){return lvS<=50?9-3*lvS/50:6-2*(lvS-50)/50}
function pmul(){return lvP<=50?.667+.333*lvP/50:1+.5*(lvP-50)/50}
function drop(e){if(PV.on){if(e.ek){if(MP.on)mpSend({t:'q',k:e.ek,rd:PV.rd});else if(PV.qB.length<14)PV.qB.push(e.ek)}return}const mk=k=>items.push({x:e.x+(Math.random()-.5)*16,y:e.y,vy:-2-Math.random(),k}),ok=k=>(k==='p'?lvP:lvS)<100;
if(e.ty){for(let i=0;i<2;i++){if(ok('p'))mk('p');if(ok('s'))mk('s')}}
else if(Math.random()<.6){const k=Math.random()<.5?'p':'s',o=k==='p'?'s':'p';if(ok(k))mk(k);else if(ok(o))mk(o)}
}
function pickup(k){if(k==='m'){if(P.mana<P.mx)P.mana=Math.min(P.mx,P.mana+30);else score+=100}else if(k==='p'){if(lvP<100)lvP++;else score+=100}else{if(lvS<100)lvS++;else score+=100}}
function start(){K.shoot=K.slow=0;contLeft=3;ctE.style.display='none';paused=false;pz.style.display='none';menu.style.display='none';csel.style.display='none';axReset();mus.stop();state='play';ov.style.display='none';P={x:W/2,y:H-50,inv:90,mana:CH===2?60:100,mx:CH===2?60:100,soul:15,bb:JB_MAX};pb=[];tr=[];upReset();sprayI=0;sprayT=99;mvB=spB=dr=drOff=dying=0;bombQ=0;items=[];lvP=lvS=0;eb=[];en=[];fx=[];t=0;score=0;stg=1;s3reset();s3bn=stg===3?200:0;s2t=0;s2i=0;s2reset();s2bn=stg===2?150:0;spawnT=30;bombT=0;shotT=0;rc=0;ammo=MAG;rl=0;bs=null;bossDone=0;clr=0;endT=0;gt=0;b1s=0;b2s=0;b1Left=0;retryA=0;i1=0;i2=0;b1LT=0;g1=0;g2=0;b2Mana=0;toast=null;lz=[];lf=[];setAud((GM==='pvp'||GM==='mp')?4:stg);aud.loop=(GM==='pvp'||GM==='mp');aud2.pause();try{aud2.currentTime=0}catch(e){}sg2=0;aud3.pause();try{aud3.currentTime=0}catch(e){}sg3=0;try{aud.currentTime=0}catch(e){}stgVol(ST.mus);aud.muted=!mus.isOn();sg=0;bm.reset();bm.load();bm.resume();hbS=CH_HB[CH]||1;spdM=CH_SPD[CH]||1;PV.on=0;icy=0;if(FK.on&&GM==='pvp'){$('pzS').style.display='none'}if(GM==='pvp'||GM==='mp')pvInit()}
let contLeft=3;const ctE=document.getElementById('ct');
function showCont(){state='cont';paused=false;document.getElementById('ctT').innerHTML='Còn '+contLeft+' lượt hồi sinh<br>Hồi đầy mana, soul, power và speed · điểm về 0';ctE.style.display='flex'}
document.getElementById('ctY').addEventListener('click',()=>{if(state!=='cont')return;contLeft--;ctE.style.display='none';state='play';P.mana=P.mx;if(CH===2)P.soul=30;lvP=lvS=100;score=0;P.inv=150;P.x=W/2;P.y=H-50;eb=[];lz=[];lf=[];s3fl=[];dying=0;bombT=0;bombQ=0;if(bs)bs.clean=0});
document.getElementById('ctN').addEventListener('click',()=>{ctE.style.display='none';over()});
function over(){if(MP.on){if(!PV.fin){PV.msg='BẠN ĐÃ RỜI TRẬN';PV.fin=1;profRecord('online','L',PV.sp,PV.sb,MP.rn,1);mpSend({t:'quit'})}{const c0=MP.conn;setTimeout(()=>{if(MP.conn===c0)mpReset()},2500)}}else if(FK.on&&PV.on&&!PV.fin){PV.msg='BẠN ĐÃ RỜI TRẬN';PV.fin=1;profRecord('online','L',PV.sp,PV.sb,FK.name,1)}else if(GM==='camp'&&typeof profCamp==='function')profCamp();ctE.style.display='none';state='over';paused=false;pz.style.display='none';scE.textContent=PV.fin?PV.msg:(clr?'STAGE '+stg+' CLEAR!':'');menu.style.display='flex';rpDiscard();if(FK.on){FK.on=0;$('pzS').style.display=''}mus.start()}
function ebul(x,y,a,s,c,w){eb.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,c:c||0,w:w||0})}
const SPD=2.0;
function mkPath(P){const pts=P.map(q=>[q[0]*W,q[1]*H]),out=[];
for(let i=0;i<pts.length-1;i++){const a=pts[Math.max(0,i-1)],b=pts[i],c=pts[i+1],d=pts[Math.min(pts.length-1,i+2)];
for(let k=0;k<16;k++){const t=k/16,t2=t*t,t3=t2*t,f=n=>.5*(2*b[n]+(-a[n]+c[n])*t+(2*a[n]-5*b[n]+4*c[n]-d[n])*t2+(-a[n]+3*b[n]-3*c[n]+d[n])*t3);out.push([f(0),f(1)])}}
out.push(pts[pts.length-1]);const cum=[0];for(let i=1;i<out.length;i++)cum.push(cum[i-1]+Math.hypot(out[i][0]-out[i-1][0],out[i][1]-out[i-1][1]));
return{pts:out,cum,len:cum[cum.length-1]}}
function pathAt(pa,d){if(d>=pa.len)return null;const c=pa.cum;let lo=0,hi=c.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(c[m]<=d)lo=m;else hi=m}
const f=(d-c[lo])/Math.max(1e-6,c[hi]-c[lo]),a=pa.pts[lo],b=pa.pts[hi];return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]}
const secTo=(pa,test)=>{for(let i=0;i<pa.pts.length;i++)if(test(pa.pts[i]))return pa.cum[i]/SPD/60;return pa.len/SPD/60};
const P1=mkPath([[.304,-.08],[.304,.127],[.307,.374],[.325,.475],[.371,.59],[.441,.683],[.531,.748],[.83,.97],[1.15,1.1]]);
const P2=mkPath([[.808,-.08],[.808,.209],[.826,.319],[.826,.466],[.797,.577],[.732,.712],[.627,.816],[.536,.869],[.30,1],[0,1.15]]);
const P3L=[[.142,-.08],[.142,.058],[.142,.284],[.169,.363],[.2,.448],[.231,.496],[.293,.562],[.356,.599],[.444,.617],[.6,.66],[.85,.78],[1.12,.92]];
const P3a=mkPath(P3L),P3b=mkPath(P3L.map(q=>[1-q[0],q[1]]));
const P5=mkPath([[1.02,-.04],[.907,.048],[.706,.188],[.487,.402],[.252,.667],[.05,.885],[-.1,1]]);
const P6=mkPath([[.19,-.06],[.285,.118],[.397,.261],[.45,.374],[.51,.496],[.6,.626],[.772,.817],[.95,.99],[1.1,1.1]]);
function buildSC(list,abs0){const L=[],dd=a=>1+(abs0+a)/40;let cg=false,gb=null;
const S=(at,pa,fm,fa)=>L.push({at,k:'s',pa,fm,fa:fa||0,d:dd(at),gate:cg,rel:cg?at-gb:0});
const B=(at,x,y,fm,off,hold)=>L.push({at,k:'b',x,y,fm,off:off||0,hold:hold||8,d:dd(at),gate:cg,rel:cg?at-gb:0});
for(const f of list){const a=f[1];cg=f[0]>=8&&f[0]<=10; if(cg&&gb===null)gb=a;
if(f[0]===1||f[0]===2){const pa=f[0]===1?P1:P2,n=7,gap=.5;for(let i=0;i<n;i++)S(a+i*gap,pa,'s');
B(a+(n-1)*gap+secTo(pa,q=>q[1]>=H/2),f[0]===1?.71:.41,f[0]===1?.21:.276,'t')}
else if(f[0]===3){const fa=P3a.cum[P3a.pts.findIndex(q=>Math.abs(q[0]-W/2)<50)];for(let i=0;i<6;i++){S(a+i*.55,P3a,'m',fa);S(a+i*.55,P3b,'m',fa)}}
else if(f[0]===4){B(a,.116,.27,'r',0,9);B(a,.53,.28,'t',0,9);B(a,.93,.27,'r',54,9)}
else if(f[0]===5||f[0]===6){const pa=f[0]===5?P5:P6;for(let b=0;b<3;b++)for(let i=0;i<4;i++)S(a+b*2.2+i*.45,pa,'s')}
else if(f[0]===8){for(let i=0;i<5;i++){S(a+i*.45,P5,'s');S(a+.2+i*.45,P6,'s')}}
else if(f[0]===9){const fa=P3a.cum[P3a.pts.findIndex(q=>Math.abs(q[0]-W/2)<50)];for(let i=0;i<4;i++){S(a+i*.5,P3a,'m',fa);S(a+i*.5,P3b,'m',fa)}}
else if(f[0]===10){for(let i=0;i<5;i++){S(a+i*.45,P1,'s');S(a+.2+i*.45,P2,'s')}}
else if(f[0]===7){B(a,.128,.273,'r',0,9);B(a,.80,.268,'r',36,9);B(a,.521,.602,'r',72,9)}}
return L.sort((x,y)=>x.at-y.at)}
const SC1=buildSC([[1,2],[2,14],[3,26],[4,38],[10,41],[9,44],[8,46.5]],0),SC2=buildSC([[5,1],[6,12],[7,23],[9,27],[8,31]],T_B1_END);
let i1=0,i2=0,b1LT=0,g1=0,g2=0;const noBig=()=>!en.some(e=>e.ty===1&&e.hp>0&&!e.gone);
function spawnEv(v){const d=v.d;
if(v.k==='s'){const pa=v.pa;en.push({x:pa.pts[0][0],y:pa.pts[0][1],t:0,hp:8,ty:0,pa,dist:0,fm:v.fm,fa:v.fa,d,ba:1.5708,ph:v.at*3.7})}
else en.push({x:v.x*W,y:-24,t:0,hp:14,ty:1,yt:v.y*H,hold:v.hold*60,hf:0,st:0,fm:v.fm,off:v.off,d,ba:1.5708,ph:v.at*2.3})}
const ES2={};ES2.fire=new Image();ES2.fire.src='assets/images/es2_fire.png';ES2.thunder=new Image();ES2.thunder.src='assets/images/es2_thunder.png';ES2.earth=new Image();ES2.earth.src='assets/images/es2_earth.png';ES2.water=new Image();ES2.water.src='assets/images/es2_water.png';
const BG2=new Image();BG2.src='assets/images/bg2.png';
const mir=L=>L.map(q=>[1-q[0],q[1]]);
const L_F=[[.164,-.08],[.17,.11],[.19,.18],[.26,.285],[.34,.366],[.46,.384],[.7,.4],[1.12,.45]];
const L_E=[[.778,-.08],[.787,.21],[.811,.307],[.811,.44],[.756,.563],[.62,.643],[.39,.667],[-.12,.67]];
const L_T=[[1.1,0],[.872,.069],[.731,.155],[.627,.224],[.522,.304],[.45,.384],[.25,.6],[-.12,.8]];
const L_W=[[-.06,.25],[.134,.401],[.274,.562],[.392,.677],[.457,.757],[.535,.854],[.627,.94],[.75,1.12]];
const L_A=[[.089,1.12],[.084,.506],[.14,.387],[.205,.312],[.279,.258],[.391,.228],[.54,.224],[.624,.242],[.726,.307],[.81,.484],[.821,.603],[.8,1.12]];
const PF=mkPath(L_F),PFm=mkPath(mir(L_F)),PE=mkPath(L_E),PEm=mkPath(mir(L_E)),PT=mkPath(L_T),PTm=mkPath(mir(L_T)),PW=mkPath(L_W),PWm=mkPath(mir(L_W)),PA=mkPath(L_A),PAm=mkPath(mir(L_A));
const VX=[.117,.475,.825].map(x=>mkPath([[x,-.08],[x,.3],[x,.7],[x,1.12]]));
const SC_S2=(()=>{const L=[],A=(at,ek,o)=>L.push(Object.assign({at,ek},o));
const g=(at,ek,pa,n,gap)=>{for(let i=0;i<n;i++)A(at+i*(gap||.7),ek,{pa})};
const vx=(at,n,gap)=>{for(let i=0;i<n;i++)VX.forEach((p,j)=>A(at+i*(gap||1.3)+j*.35,'water',{pa:p}))};
const WV=[a=>{g(a,'fire',PF,4,1);g(a+3.5,'earth',PE,4,1)},
a=>{g(a,'thunder',PT,3,1.5);g(a+.5,'water',PW,4,1.2)},
a=>vx(a,3,1.8),
a=>{g(a,'earth',PA,4,1.2);g(a+.6,'earth',PAm,4,1.2)},
a=>{g(a,'fire',PF,3,1.1);g(a+.5,'fire',PFm,3,1.1);g(a+4,'thunder',PT,3,1.5)},
a=>{g(a,'earth',PE,3,1.1);g(a+.5,'earth',PEm,3,1.1);g(a+2.5,'water',PWm,3,1.2)},
a=>{g(a,'fire',PF,3,1);g(a+.6,'earth',PE,3,1);g(a+1.2,'thunder',PTm,3,1.4);g(a+1.8,'water',PW,3,1)}];
WV.forEach((f,i)=>f(2+i*8.5));[3,5,6,4].forEach((k,i)=>WV[k](85+i*8.5));
return L.sort((x,y)=>x.at-y.at)})();
const S2_END=SC_S2[SC_S2.length-1].at+2;
function spawnS2(v){const k=v.ek,e={t:0,ek:k,d:1.3,ba:1.5708,ph:v.at*3.1,off:0,st:0,hf:0,ty:0};
if(v.pa)Object.assign(e,{pa:v.pa,dist:0,sp:.85,x:v.pa.pts[0][0],y:v.pa.pts[0][1],hp:k==='earth'?10:8});
else if(k==='water')Object.assign(e,{x:v.x*W,y:-24,hp:10});
else Object.assign(e,{x:v.x*W,y:-24,yt:v.y*H,hp:14,hold:v.hold*60});
en.push(e)}
function mkPuddle(x,y){const w=zn.filter(z=>z.k==='w');if(w.length>=14)zn.splice(zn.indexOf(w[0]),1);zn.push({k:'w',x,y,r:34,t:0,life:420})}

// ===== STAGE 3 (DEMO): QUỶ XẠ — cánh vỗ (nội suy spline giữa 4 khung vẽ tay), căng cung, bắn tên =====
const AR_K=[[[-0.967,-0.286,-4.548,-1.031,-6.605,0.265,0.167,2.468,0.075,0.02,-0.065],[1.138,0.881,3.941,-1.128,6.808,0.929,0.896,2.954,-0.07,-0.082,0.056]],[[-0.956,-0.44,-4.929,-2.104,-7.022,-0.941,0.028,1.386,0.05,0.04,-0.049],[1.281,0.079,3.983,-3.249,7.687,-3.607,0.959,1.958,-0.014,-0.1,0.034]],[[-0.005,0.067,-2.177,-4.193,-4.436,-4.144,-0.459,-0.056,0.03,-0.021,-0.02],[0.756,-0.731,2.143,-4.806,3.579,-5.089,1.137,1.539,-0.09,-0.021,0.051]],[[-0.764,-0.449,-4.408,-1.859,-6.467,-0.893,0.107,2.244,0.096,0.011,-0.055],[0.979,0.976,4.1,-0.75,6.698,1.61,0.789,2.83,-0.073,-0.084,0.052]]];
const AR_SEQ=[2,1,0,3,0,1],AR_BE=[[-2.9,1.6,1.9,3.075],[-2.35,1.525,1.45,2.725],[-2.3,0.75,1.675,2.175],[-3.025,1.0,1.525,3.125]],AR_O=new Array(11).fill(0); // AR_SEQ: đỉnh cánh -> giữa -> ngang -> hạ thấp -> ngang -> giữa
const AR_BODY=new Image();AR_BODY.src='assets/images/archer_body.png';const AR_ARW=new Image();AR_ARW.src='assets/images/archer_arrow.png';
const AR_RG=6,AR_CY=270,AR_LIFE=1100,AR_NOCK=60,AR_DRAW=70,AR_HOLD=160,AR_LOCK=190,AR_REL=205,AR_RECOV=24,AR_FLAP=.42; // AR_FLAP = tốc độ vỗ cánh (đơn vị khung/tick) — vỗ cánh chạy ĐỘC LẬP với animation kéo cung
// // nhịp (tick @60fps): 0-70 chờ (ẢNH 1: tên đặt sẵn) · 70→160 kéo dây (ẢNH 1→2→3) · 160→205 giữ căng + tia báo (ẢNH 3, khóa hướng ở 190) · 205 THẢ (ẢNH 4) rồi hồi về ẢNH 1 · AR_CY=chu kỳ
let s3t=0,s3bn=0;
// ===== STAGE 3: lịch ra quái + Hamin (mid-boss rồi boss) =====
let s3ph=0,s3i=0,s3fl=[],s3buff=0,s3cap=0; // s3ph: 0 trước Hamin lần 1 · 1 Hamin lần 1 · 2 giữa màn · 3 Hamin lần 2 · s3i = con trỏ lịch · s3fl = ngọn lửa của phù thuỷ quỷ
// LỊCH STAGE 3 ĐO THEO NHẠC (giây của bài stage3.mp3, = gt): 0:00-1:19 quái · 1:20-1:40 Hamin lần 1 · 1:41-2:29 quái · 2:30 Hamin lần 2 (nhạc phần boss lặp lại từ 2:30)
const S3_T1=80,S3_E1=100,S3_T2=150,S3_WARN=3;
// ===== STAGE 3: đường đi + vị trí quái lấy từ 17 ảnh phác thảo (toạ độ px của màn 384x448) =====
function mkPx(a){return mkPath(a.filter((q,i)=>i%3===0||i===a.length-1).map(q=>[q[0]/W,q[1]/H]))}
const S3PR={"arch":[[43.4,484.7],[42.2,476.8],[40.9,468.9],[39.7,461.0],[38.4,453.1],[37.2,445.2],[35.9,437.3],[34.7,429.4],[32.4,421.7],[30.6,413.9],[30.1,405.8],[29.7,397.8],[29.7,389.7],[29.7,381.6],[29.7,373.5],[29.7,365.5],[29.7,357.4],[29.7,349.3],[30.1,341.3],[30.6,333.2],[31.8,325.3],[33.0,317.3],[33.6,309.3],[34.0,301.2],[34.4,293.2],[35.2,285.1],[35.2,277.1],[35.8,269.0],[36.7,261.0],[37.2,253.0],[38.9,245.1],[40.6,237.2],[42.4,229.4],[43.3,221.3],[43.9,213.3],[43.9,205.2],[43.9,197.2],[44.2,189.1],[45.3,181.1],[47.8,173.5],[51.4,166.3],[55.0,159.1],[58.7,151.9],[62.8,145.0],[66.6,137.9],[70.3,130.7],[75.2,124.3],[81.3,119.1],[87.6,114.0],[93.6,108.7],[99.9,103.6],[106.4,98.8],[113.0,94.3],[119.6,89.6],[126.6,85.5],[133.5,81.4],[140.3,77.0],[147.3,73.1],[154.9,70.4],[162.7,68.2],[170.6,66.7],[178.6,65.8],[186.7,65.6],[194.7,65.6],[202.8,65.6],[210.9,65.6],[218.9,66.0],[226.9,67.1],[234.6,69.5],[242.0,72.6],[249.4,75.9],[256.5,79.7],[263.6,83.5],[270.9,87.1],[278.1,90.7],[285.4,94.1],[292.7,97.5],[299.0,102.5],[303.7,108.9],[306.9,116.4],[309.9,123.9],[313.5,131.0],[317.0,138.3],[320.5,145.6],[323.8,152.9],[326.8,160.4],[329.7,168.0],[331.9,175.7],[334.0,183.5],[336.0,191.3],[337.8,199.2],[339.3,207.1],[340.8,215.0],[342.1,223.0],[343.1,231.0],[343.9,239.0],[344.3,247.0],[344.8,255.1],[345.2,263.1],[345.9,271.2],[347.2,279.1],[349.0,287.0],[350.6,294.9],[351.9,302.8],[352.8,310.8],[352.8,318.9],[352.8,327.0],[352.8,335.1],[352.8,343.1],[352.8,351.2],[352.8,359.3],[352.8,367.3],[352.8,375.4],[352.8,383.5],[352.8,391.6],[353.1,399.6],[353.9,407.6],[353.9,415.7],[353.9,423.8],[353.7,431.8],[353.9,439.8],[354.0,447.8],[354.2,455.8],[354.3,463.8],[354.5,471.8],[354.6,479.8],[354.8,487.8]],"wave":[[-36.2,182.5],[-30.2,177.3],[-24.1,172.1],[-18.0,166.8],[-12.0,161.6],[-5.9,156.4],[0.2,151.2],[5.8,145.4],[11.9,140.1],[18.1,134.9],[24.7,130.1],[31.2,125.2],[38.1,121.1],[45.3,117.2],[52.5,113.5],[59.8,110.0],[67.6,108.0],[75.6,106.5],[83.7,105.5],[91.8,105.2],[99.9,105.1],[108.0,105.6],[116.0,106.8],[123.9,108.4],[131.8,110.4],[139.4,113.1],[147.3,115.0],[155.1,117.1],[162.9,119.3],[170.6,121.8],[178.1,125.0],[185.6,128.1],[192.9,131.5],[200.0,135.4],[207.1,139.4],[214.3,143.2],[221.4,147.0],[228.4,151.2],[235.2,155.6],[242.0,160.0],[249.0,164.1],[256.0,168.1],[262.9,172.4],[270.1,176.1],[277.3,179.8],[284.8,182.9],[292.9,184.0],[301.0,184.0],[308.9,182.7],[316.1,178.9],[322.6,174.0],[329.0,169.0],[335.3,163.9],[341.4,158.6],[347.4,153.1],[353.4,147.7],[359.3,142.1],[364.9,136.3],[370.2,130.1],[374.7,123.4],[378.4,116.2],[382.6,109.3],[387.0,102.6],[391.4,95.9],[395.8,89.2],[400.2,82.5],[404.6,75.8],[409.0,69.1]],"w1":[[-40.3,150.5],[-33.6,146.3],[-26.8,142.0],[-20.0,137.7],[-13.3,133.4],[-6.5,129.2],[0.3,124.9],[6.9,120.3],[13.6,115.8],[20.3,111.2],[27.6,107.6],[34.6,103.6],[41.5,99.3],[48.7,95.7],[56.7,94.5],[64.9,94.5],[73.0,94.5],[81.1,94.9],[89.1,95.9],[96.8,98.5],[104.1,102.0],[111.4,105.4],[118.5,109.3],[125.5,113.4],[132.6,117.3],[139.8,121.0],[146.8,125.1],[153.7,129.4],[160.5,133.8],[167.6,137.7],[174.3,142.2],[180.7,147.3],[187.5,151.7],[194.4,155.8],[201.4,159.9],[208.5,163.9],[215.8,167.5],[223.2,170.8],[230.9,172.9],[239.0,173.4],[247.1,173.4],[255.2,173.4],[263.3,173.4],[271.4,172.9],[279.5,172.2],[287.6,171.3],[295.6,170.0],[303.0,166.9],[308.3,160.8],[313.1,154.3],[317.5,147.5],[322.3,140.9],[326.8,134.2],[331.0,127.3],[335.1,120.3],[339.1,113.2],[343.5,106.4],[348.1,99.7],[352.6,93.0],[357.3,86.4],[362.1,79.8],[367.3,73.6],[372.9,67.7],[378.7,62.0],[383.5,55.7],[388.8,49.7],[394.2,43.7],[399.5,37.7],[404.8,31.7],[410.1,25.7],[415.4,19.7]],"w2":[[408.0,142.0],[403.9,148.9],[399.8,155.8],[395.8,162.7],[391.7,169.6],[387.6,176.4],[383.5,183.3],[380.1,190.6],[375.9,197.4],[371.5,204.2],[367.2,211.0],[362.8,217.8],[358.4,224.6],[353.6,231.1],[348.2,237.1],[342.3,242.5],[336.0,247.5],[329.3,252.2],[322.4,256.3],[315.3,260.0],[307.8,263.0],[300.1,265.5],[292.4,267.8],[284.5,269.7],[276.6,270.8],[268.5,271.0],[260.4,271.0],[252.3,271.0],[244.3,270.3],[236.3,269.7],[228.3,268.7],[220.7,265.9],[213.4,262.4],[206.5,258.3],[200.1,253.3],[193.8,248.3],[187.7,243.0],[181.8,237.6],[175.8,232.1],[169.7,226.8],[163.2,222.0],[156.5,217.5],[149.5,213.6],[142.3,209.8],[135.1,206.3],[127.7,203.1],[120.1,200.4],[112.2,198.8],[104.2,198.6],[96.1,198.3],[88.0,198.3],[80.0,199.1],[72.1,200.7],[64.3,202.9],[56.8,205.6],[49.4,208.9],[42.1,212.3],[34.9,216.1],[27.7,219.7],[20.5,223.2],[13.4,227.2],[6.5,231.3],[0.2,236.2],[-6.7,240.3],[-13.6,244.4],[-20.5,248.5],[-27.3,252.6],[-34.2,256.7],[-41.1,260.8]],"u":[[59.0,-44.5],[58.1,-36.6],[57.2,-28.6],[56.3,-20.7],[55.4,-12.7],[54.5,-4.8],[53.6,3.2],[52.7,11.1],[51.8,19.1],[50.9,27.0],[50.0,35.0],[49.1,42.9],[48.2,50.9],[46.8,58.7],[46.0,66.7],[45.1,74.6],[44.7,82.6],[44.2,90.6],[43.8,98.6],[43.7,106.6],[43.7,114.6],[43.7,122.6],[43.7,130.6],[43.7,138.6],[43.7,146.6],[43.7,154.6],[43.7,162.6],[43.7,170.6],[43.7,178.6],[43.7,186.6],[44.1,194.6],[46.0,202.4],[48.6,209.9],[51.4,217.4],[54.4,224.8],[57.1,232.4],[60.2,239.7],[63.7,246.9],[67.0,254.2],[70.6,261.3],[73.5,268.7],[77.1,275.9],[80.0,283.3],[83.4,290.6],[86.7,297.9],[91.1,304.6],[95.6,311.2],[101.1,316.9],[106.4,322.9],[111.8,328.8],[117.4,334.5],[123.1,340.2],[129.1,345.5],[135.1,350.6],[142.1,354.6],[149.8,356.6],[157.7,357.7],[165.7,357.7],[173.7,357.7],[181.7,357.7],[189.7,357.7],[197.7,357.7],[205.7,357.2],[213.5,355.6],[221.3,353.9],[229.1,351.8],[236.8,349.7],[244.3,346.9],[251.8,344.2],[258.7,340.3],[264.9,335.3],[271.3,330.6],[277.2,325.2],[282.5,319.2],[287.4,312.9],[291.8,306.2],[296.6,299.8],[300.9,293.1],[304.4,285.9],[307.9,278.7],[311.2,271.4],[314.3,264.1],[316.6,256.4],[319.4,248.9],[321.3,241.2],[323.5,233.5],[325.9,225.9],[327.4,218.0],[329.2,210.2],[330.3,202.3],[331.8,194.5],[333.5,186.7],[335.0,178.8],[335.9,170.9],[336.4,162.9],[336.6,154.9],[336.6,146.9],[336.6,138.9],[336.6,130.9],[336.6,122.9],[336.6,114.9],[336.6,106.9],[336.6,98.9],[336.6,90.9],[336.6,82.9],[336.6,74.9],[336.6,66.9],[337.6,59.1],[337.9,51.1],[338.2,43.1],[338.4,35.1],[338.7,27.1],[339.0,19.1],[339.2,11.1],[339.5,3.1],[339.8,-4.9],[340.0,-12.9],[340.3,-20.9],[340.6,-28.9],[340.8,-36.9],[341.1,-44.9]],"d1":[[-22.6,90.7],[-16.9,96.3],[-11.2,101.9],[-5.5,107.5],[0.2,113.1],[5.9,118.7],[11.6,124.3],[15.9,128.5],[20.2,132.7],[24.6,136.9],[28.8,141.1],[33.0,145.5],[37.0,149.9],[41.0,154.4],[44.8,159.1],[48.4,163.9],[52.0,168.7],[55.5,173.6],[59.0,178.5],[62.5,183.4],[66.1,188.2],[69.8,192.9],[73.7,197.5],[78.2,201.5],[83.0,205.1],[87.9,208.5],[92.8,212.0]],"d2":[[397.8,106.8],[391.1,111.2],[384.4,115.6],[377.7,120.0],[371.1,124.4],[364.4,128.8],[357.7,133.2],[352.0,135.7],[347.1,139.4],[342.1,143.0],[337.2,146.7],[332.2,150.4],[327.3,154.2],[322.6,158.2],[318.2,162.4],[314.0,167.0],[309.8,171.5],[305.6,176.0],[301.4,180.6],[297.0,184.9],[292.5,189.1],[288.1,193.5]],"x1":[[99.9,-11.1],[99.3,-3.2],[98.8,4.8],[98.2,12.8],[97.6,20.8],[97.0,28.7],[96.5,36.7],[95.9,44.7],[95.3,52.7],[94.7,60.7],[94.2,68.6],[93.6,76.6],[93.0,84.6],[92.4,92.6],[91.9,100.6],[90.8,108.6],[90.7,116.7],[90.2,124.7],[89.5,132.8],[89.4,140.9],[89.4,149.0],[89.4,157.1],[89.5,165.2],[91.3,173.0],[95.3,180.0],[100.6,186.1],[106.8,191.4],[113.0,196.5],[119.6,201.2],[126.4,205.7],[132.8,210.6],[139.4,215.3],[146.5,219.1],[153.9,222.4],[161.1,226.0],[168.5,229.3],[176.2,232.0],[183.8,234.6],[191.5,237.2],[199.1,239.9],[206.8,242.5],[214.5,245.1],[222.0,248.0],[229.2,251.6],[236.3,255.5],[243.1,259.9],[249.8,264.4],[256.0,269.7],[261.7,275.4],[267.1,281.4],[272.9,287.1],[279.1,292.2],[284.7,298.1],[289.1,304.9],[291.8,312.5],[295.0,319.9],[298.8,327.1],[302.4,334.3],[304.8,342.0],[306.6,349.9],[308.7,357.7],[311.4,365.3],[313.5,373.2],[314.4,381.2],[314.7,389.3],[314.7,397.4],[314.7,405.5],[314.7,413.6],[315.3,421.6],[316.5,429.6],[318.0,437.6],[320.4,445.3],[323.0,452.9],[325.4,460.7],[327.4,468.5],[327.9,476.5],[323.5,483.0],[323.6,491.0],[323.7,499.0],[323.8,507.0],[323.9,515.0]],"x2":[[243.6,-35.6],[245.4,-27.8],[247.2,-20.0],[249.0,-12.2],[250.8,-4.4],[252.6,3.4],[254.3,11.2],[256.1,19.0],[257.9,26.8],[259.7,34.6],[261.5,42.4],[263.3,50.2],[265.1,58.0],[266.9,65.8],[268.6,73.6],[271.0,81.3],[272.8,89.1],[274.8,96.9],[275.8,104.9],[276.1,113.0],[276.6,121.0],[277.0,129.1],[277.2,137.1],[276.6,145.1],[273.8,152.6],[269.1,159.2],[264.0,165.5],[258.4,171.2],[252.9,177.1],[247.5,183.1],[242.2,189.2],[236.6,194.9],[230.8,200.5],[224.8,205.8],[219.2,211.6],[213.5,217.3],[207.2,222.4],[200.8,227.3],[194.4,232.1],[188.0,237.0],[181.5,241.9],[175.1,246.7],[168.5,251.3],[161.9,255.9],[155.5,260.8],[149.2,265.8],[143.0,271.0],[137.0,276.4],[131.7,282.4],[126.4,288.5],[121.2,294.7],[116.9,301.5],[112.4,308.1],[108.1,315.0],[104.0,321.9],[100.4,329.1],[97.4,336.6],[94.4,344.1],[92.1,351.8],[90.7,359.7],[89.4,367.7],[88.5,375.7],[88.0,383.7],[87.4,391.7],[86.8,399.8],[86.0,407.8],[84.6,415.7],[83.7,423.7],[82.3,431.6],[81.6,439.6],[81.6,447.7],[81.6,455.8],[81.6,463.8],[81.8,471.9],[81.8,479.9],[81.8,487.9],[81.9,495.9],[81.9,503.9]]};
const S3PS={"a2":[[127.0,131.2],[265.7,125.9],[76.0,191.7],[190.4,200.1],[309.1,201.1],[116.0,278.8],[255.0,274.8]],"w4":[[139.5,119.1],[199.8,118.9],[270.1,120.1]],"b8":[[74.7,73.7],[199.2,58.3],[319.3,60.3],[131.7,163.2],[263.3,172.6]],"a8":[[131.3,50.6],[255.7,50.8],[67.1,164.6],[200.1,164.8],[316.6,155.5]],"w8":[[58.6,258.1],[129.6,257.4],[263.9,260.3],[319.0,259.0]],"a9":[[181.6,135.5],[281.4,211.7],[90.4,239.8]],"w10":[[139.6,85.8],[263.4,83.4],[196.9,90.2],[160.9,171.6],[239.3,164.8]],"a10":[[102.4,166.1],[299.6,167.8],[193.1,238.3]]};
const S3P={};for(const k in S3PR)S3P[k]=mkPx(S3PR[k]);
// nhóm: p = chạy theo đường (n con, cách nhau gap tick, sp = tốc độ, f1 = điểm bắn shotgun của quỷ bom, dvE/dv = cứ dvE con thì 1 con lao xuống ở dv) · pos = đứng ở các vị trí
const S3_GA=[{at:2,k:'b',p:'arch',n:8,gap:26,sp:1.15,f1:.5,dvE:4,dv:.72},{at:22,k:'a',pos:'a2',life:760},{at:44,k:'b',p:'wave',n:9,gap:24,sp:1.15,f1:.45,dvE:4,dv:.72},{at:62,k:'w',pos:'w4',life:800},{at:62.6,k:'a',p:'d1',n:1,gap:1,sp:1.2},{at:62.6,k:'a',p:'d2',n:1,gap:1,sp:1.2}];
const S3_GB=[{at:102,k:'w',p:'w1',n:5,gap:44,sp:1},{at:102.4,k:'w',p:'w2',n:5,gap:44,sp:1},{at:113,k:'b',pos:'b8'},{at:113.4,k:'a',pos:'a8',life:700},{at:113.8,k:'w',pos:'w8',life:700},{at:125,k:'b',p:'x1',n:6,gap:30,sp:1.15,f1:.35,dvE:3,dv:.6},{at:125.5,k:'b',p:'x2',n:6,gap:30,sp:1.15,f1:.35,dvE:3,dv:.6},{at:126,k:'a',pos:'a9',life:700},{at:137,k:'b',p:'u',n:7,gap:28,sp:1.2,f1:.3,dvE:3,dv:.6},{at:137.5,k:'w',pos:'w10',life:560},{at:138,k:'a',pos:'a10',life:560}];
function buildQ(G){const q=[];for(const g of G){if(g.p){const pa=S3P[g.p];for(let i=0;i<g.n;i++)q.push({at:g.at+i*g.gap/60,k:g.k,pa,sp:g.sp,f1:g.f1,dv:(g.dvE&&i%g.dvE===g.dvE-1)?g.dv:0,x:pa.pts[0][0],y:pa.pts[0][1]})}else S3PS[g.pos].forEach((p,i)=>q.push({at:g.at+i*.25,k:g.k,x:p[0],y:p[1],life:g.life}))}return q.sort((a,b)=>a.at-b.at)}
const S3_A=buildQ(S3_GA),S3_B=buildQ(S3_GB);
function s3spawn(v){const ph=v.at*1.7;
if(v.k==='b'){if(v.pa)spawnBomber(v.x,v.y,ph,{st:4,pa:v.pa,dist:0,psp:v.sp,f1:v.f1,dv:v.dv});else spawnBomber(v.x,v.y,ph)}
else if(v.k==='w'){if(v.pa)spawnWitch(v.x,v.y,ph,{st:4,pa:v.pa,dist:0,psp:v.sp,nf:1,x:v.x,y:v.y});else spawnWitch(v.x,v.y,ph,{home:1,hx:v.x,hy:v.y,life:v.life||720})}
else{if(v.pa)spawnArcher(v.x,v.y,ph,{st:5,pa:v.pa,dist:0,psp:v.sp,life:900,x:v.x,y:v.y});else spawnArcher(v.x,v.y,ph,{home:1,hx:v.x,hy:v.y,life:v.life||760})}}
const arCR=(a,b,c,d,t)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
function arWing(s,u){u=((u%6)+6)%6;const i=Math.floor(u),t=u-i,a=AR_K[AR_SEQ[(i+5)%6]][s],b=AR_K[AR_SEQ[i]][s],c=AR_K[AR_SEQ[(i+1)%6]][s],d=AR_K[AR_SEQ[(i+2)%6]][s];for(let j=0;j<11;j++)AR_O[j]=arCR(a[j],b[j],c[j],d[j],t)}
function spawnArcher(x,yt,ph,o){const e={t:0,ek:'archer',hp:18,x,y:-46,yt,ph,st:0,fu:Math.random()*6,cyc:0,pull:0,ka:1,aim:1.5708,fl:0,d:1.3,n:0,b1:0,b2:0,bwt:0,bob:0,wp:{k:'cyc',u:0},rel:0,cc:0,tx:x,ty:yt};en.push(e);if(o)Object.assign(e,o);return e}
// ===== NỀN STAGE 3: rừng xanh nhạt (lặp) -> cổng + nhà Hamin (1 lần) -> hành lang đỏ hồng (lặp vô tận). Hamin lần 1 rời đi thì chờ nền rừng lặp tới mép rồi cổng trôi vào =====
const BG3F=new Image(),BG3G=new Image(),BG3H=new Image();BG3F.src='assets/images/bg3_forest.png';BG3G.src='assets/images/bg3_gate.png';BG3H.src='assets/images/bg3_hall.png';
const BG3_GH=896; // chiều cao ảnh cổng (px game) — mép dưới ảnh cổng khớp mép rừng, mép trên khớp mép hành lang
let s3scf=0,s3g0=-1,s3arm=0; // s3scf = quãng cuộn nền · s3g0 = mốc cuộn lúc cổng bắt đầu vào (-1 = chưa) · s3arm = đã tới lúc cho cổng vào, chờ rừng lặp tới mép
function drawBG3(){const sc=Math.floor(s3scf),o=sc%H,gt0=s3g0>=0?sc-s3g0:-1,yt=gt0-BG3_GH; // gt0 = y mép dưới ảnh cổng · yt = y mép trên (hành lang nằm phía trên yt)
if(!(s3g0>=0&&yt>=H)){ctx.drawImage(BG3F,0,o-H,W,H);ctx.drawImage(BG3F,0,o,W,H)}
if(s3g0>=0&&gt0>0&&yt<H&&BG3G.complete&&BG3G.naturalWidth)ctx.drawImage(BG3G,0,yt,W,BG3_GH);
if(s3g0>=0&&yt>0&&BG3H.complete&&BG3H.naturalWidth){const oh=((yt%H)+H)%H;ctx.save();ctx.beginPath();ctx.rect(0,0,W,Math.min(H,yt));ctx.clip();ctx.drawImage(BG3H,0,oh-H,W,H);ctx.drawImage(BG3H,0,oh,W,H);ctx.restore()}}
function s3reset(){s3buff=0;s3cap=0;s3scf=0;s3g0=-1;s3arm=0;s3t=0;s3ph=0;s3i=0;s3fl=[];s3fx=[]}
function mkB3(ph){return{x:W/2,y:-70,t:0,hp:ph===1?S3_P1HP:PH_HP3[0],max:ph===1?S3_P1HP:PH_HP3[0],on:0,sp:0,ph,bar:0,bars:ph===1?1:6,inv:0,lv:0,pt:0,clean:1,txt:0,mph:0,amp:100,my:0,tx:W/2,lim:ph===1?1800:PH_T3[0],sd:0,rs:12345,ci:0}}
function s3boss(ph){for(const e of en)for(let i=0;i<6;i++)fx.push({x:e.x,y:e.y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,l:25,c:'#ffa040'});en=[];eb=[];lz=[];s3fl=[];s3buff=0;s3cap=0;bs=mkB3(ph);s3ph=ph===1?1:3;if(ph===2){try{aud3.currentTime=0}catch(e){}sg3=0}}
function s3warn(){return !bs&&!clr&&((s3ph===0&&gt>=S3_T1-S3_WARN)||(s3ph===2&&gt>=S3_T2-S3_WARN))}
function s3upd(){s3t++;{const pf=Math.floor(s3scf/H);s3scf+=BG_SPEED;if(s3arm&&s3g0<0&&Math.floor(s3scf/H)>pf){s3g0=Math.floor(s3scf/H)*H;s3arm=0}}if(s3bn>0)s3bn--;for(const f of s3fx)f.t++;s3fx=s3fx.filter(f=>f.t<22);
if(!bs&&s3ph!==3){if(s3ph===1){s3ph=2;s3i=0;s3arm=1} // Hamin lần 1 đã rời đi / bị hạ => sang đoạn giữa màn
if(s3ph===0||s3ph===2){const L=s3ph===0?S3_A:S3_B;
while(s3i<L.length&&L[s3i].at<=gt&&gt<(s3ph===0?S3_T1:S3_T2)-S3_WARN)s3spawn(L[s3i++]);
if(s3ph===0&&gt>=S3_T1)s3boss(1);else if(s3ph===2&&gt>=S3_T2)s3boss(2)}}
flameUpd()}
const arEase=x=>x<=0?0:x>=1?1:x*x*(3-2*x),arLerp=(a,b,t)=>a+(b-a)*t;
// 4 tư thế vẽ tay: 0 = tên đặt sẵn trên cung · 1 = kéo vừa lực · 2 = kéo căng · 3 = thả tên.  Cánh + thân + dây cung đổi THEO ĐÚNG THỨ TỰ này
function arWingSeq(s,q){q=Math.max(0,Math.min(3,q));const i=Math.min(2,Math.floor(q)),t=q-i,a=AR_K[Math.max(0,i-1)][s],b=AR_K[i][s],c=AR_K[i+1][s],d=AR_K[Math.min(3,i+2)][s];for(let j=0;j<11;j++)AR_O[j]=arCR(a[j],b[j],c[j],d[j],t)}
function arWingLin(s,a,b,w){const A=AR_K[a][s],B=AR_K[b][s];for(let j=0;j<11;j++)AR_O[j]=A[j]+(B[j]-A[j])*w}
function arPull(e){if(e.rel>0){const t=18-e.rel;return t<3?1-t/3*1.35:-.35*Math.cos((t-3)*.8)*(e.rel/15)}return e.pull}
function arGeo(e){const G=AR_RG,b1=AR_BE[e.b1],b2=AR_BE[e.b2],w=e.bwt||0,sg=e.fl?-1:1,ax=arLerp(b1[0],b2[0],w)*G,ay=arLerp(b1[1],b2[1],w)*G,bx=arLerp(b1[2],b2[2],w)*G,by=arLerp(b1[3],b2[3],w)*G,mx=(ax+bx)/2,my=(ay+by)/2,dx=sg*Math.cos(e.aim),dy=Math.sin(e.aim),pl=arPull(e)*1.15*G,nx=mx-dx*pl,ny=my-dy*pl,L=3.9*G;
return{G,sg,ax,ay,bx,by,nx,ny,dx,dy,L,hx:e.x,hy:e.y-1.7*G+e.bob*G}}
// ===== QUỶ XẠ v2: vào là bắn ngay (đã căng cung, không tia báo) · tên nhanh · bắn xong đổi chỗ =====
const AR_SPD=7.6,AR_SHOW=26,AR_MIN=84,AR_REDRAW=26,AR_MOVE=.11,AR_RUN=6; // AR_SPD=tốc độ tên (cũ 4.4) · AR_MIN=số tick tối thiểu giữa 2 phát (84=1.4s) · AR_REDRAW=tick kéo cung lại · AR_MOVE/AR_RUN=độ mượt/tốc độ tối đa khi đổi chỗ
function arDrawn(e){e.b1=e.b2=2;e.bwt=0;e.pull=1+.02*Math.sin(e.t*.9);e.ka=1;e.wp={k:'seq',q:2+.02*Math.sin(e.t*.7)}}
function arAim(e){e.aim=Math.atan2(P.y-(e.y+22),P.x-e.x);if(Math.abs(P.x-e.x)>12)e.fl=P.x>e.x?1:0}
function arPick(e){if(e.home){e.tx=Math.max(34,Math.min(W-34,e.hx+(Math.random()-.5)*90));e.ty=Math.max(40,e.hy+(Math.random()-.5)*50);return}let tx=e.x,ty=e.y;for(let i=0;i<8;i++){tx=40+Math.random()*(W-80);ty=56+Math.random()*80;if(Math.abs(tx-e.x)>=100)break}e.tx=tx;e.ty=ty}
function arShoot(e){e.pull=1;e.b1=e.b2=2;e.bwt=0;e.rel=0;
const g=arGeo(e),hx=g.hx+g.sg*(g.nx+g.dx*g.L),hy=g.hy+g.ny+g.dy*g.L,vol=(s3buff||++e.n%3===0)?[-.2,0,.2]:[0];
for(const o of vol){const a=e.aim+o;eb.push({x:hx,y:hy,vx:Math.cos(a)*AR_SPD,vy:Math.sin(a)*AR_SPD,c:-1,w:0,ar:1,k:1})}
for(let q=0;q<7;q++)fx.push({x:hx,y:hy,vx:Math.cos(e.aim)*(1+Math.random()*2)+(Math.random()-.5)*2,vy:Math.sin(e.aim)*(1+Math.random()*2)+(Math.random()-.5)*2,l:11,c:'#fff'});
e.rel=18;e.cyc=-1;e.st=1;arPick(e)}
function mvArcher(e){
if(e.rel>0)e.rel--;
e.fu=(e.fu+(e.st===1?AR_FLAP:AR_FLAP*1.3))%6;e.wp={k:'cyc',u:e.fu};
if(e.st===0){                                                             // bay vào: ĐÃ căng cung sẵn, vừa lọt màn hình là bắn luôn
e.y+=(e.yt-e.y)*.05+.7;e.bob=.07*Math.cos(e.fu/6*6.2832);arAim(e);arDrawn(e);
if(e.y>=(e.home?e.yt-6:AR_SHOW))arShoot(e)}
else if(e.st===5){e.fu=(e.fu+AR_FLAP*1.3)%6;e.bob=.07*Math.cos(e.fu/6*6.2832);arAim(e);arDrawn(e);e.dist+=SPD*e.psp;const q=pathAt(e.pa,e.dist);if(q){e.x=q[0];e.y=q[1]}else{e.st=1;e.cyc=AR_MIN-34;e.home=1;e.hx=e.x;e.hy=e.y;e.tx=e.x;e.ty=e.y}}
else if(e.st===1){
e.x+=Math.max(-AR_RUN,Math.min(AR_RUN,(e.tx-e.x)*AR_MOVE));e.y+=Math.max(-AR_RUN,Math.min(AR_RUN,(e.ty-e.y)*AR_MOVE));e.x=Math.max(30,Math.min(W-30,e.x));
const tr=++e.cyc,dist=Math.hypot(e.tx-e.x,e.ty-e.y);e.cc=tr;
let b1=0,b2=0,bw=0,pull=0,bob=.07*Math.cos(e.fu/6*6.2832),wp;
const ka=tr<22?0:tr<34?arEase((tr-22)/12):1;                              // tên mới đặt lên cung sau khi hồi xong
if(tr<3){wp={k:'lin',a:2,b:3,w:arEase(tr/3)};b1=b2=tr<1?2:3}              // vừa thả: cánh + thân bật sang tư thế thả
else if(tr<10){wp={k:'lin',a:3,b:3,w:0};b1=b2=3}
else if(tr<10+AR_RECOV){const w=arEase((tr-10)/AR_RECOV);wp={k:'lin',a:3,b:0,w};b1=3;b2=0;bw=w;bob=-.08*(1-w)}   // hồi về tư thế 1 (vừa hồi vừa lướt sang chỗ mới)
else if(tr<10+AR_RECOV+AR_REDRAW){arAim(e);const p=arEase((tr-10-AR_RECOV)/AR_REDRAW),q=2*p;pull=p;wp={k:'seq',q};   // kéo cung lại ngay trên đường di chuyển
if(q<1){b1=0;b2=1;bw=arEase((q-.35)/.3)}else{b1=1;b2=2;bw=arEase((q-1.35)/.3)}}
else{arAim(e);pull=1+.02*Math.sin(tr*.9);wp={k:'seq',q:2+.02*Math.sin(tr*.7)};b1=b2=2;   // đã căng cung, tới chỗ mới là bắn (không tia báo)
if(tr>=AR_MIN&&(dist<10||tr>=AR_MIN+45)){e.wp=wp;arShoot(e);return}}
e.wp=wp;e.b1=b1;e.b2=b2;e.bwt=bw;e.pull=pull;e.ka=ka;e.bob=bob;
if(!e.keep&&e.t>(e.life||AR_LIFE))e.st=2}
else{e.b1=e.b2=0;e.bwt=0;e.pull=0;e.ka=1;e.bob=.07*Math.cos(e.fu/6*6.2832);e.y-=3.2;e.rel=0;if(e.y<-70)e.gone=1}}
function drawArcher(e){
const g=arGeo(e),G=g.G,S=G/40,sg=g.sg,c=e.cc||0,wp=e.wp;
ctx.save();ctx.translate(g.hx,g.hy);if(e.fl)ctx.scale(-1,1);
ctx.lineJoin='round';ctx.lineWidth=Math.max(1,.1*G);ctx.strokeStyle='#111';ctx.fillStyle='rgba(255,255,255,.88)';
for(let s=0;s<2;s++){if(wp.k==='cyc')arWing(s,wp.u);else if(wp.k==='seq')arWingSeq(s,wp.q);else arWingLin(s,wp.a,wp.b,wp.w);
const p=AR_O;let ax=p[0]*G,ay=p[1]*G;ctx.beginPath();ctx.moveTo(ax,ay);
for(let q=0;q<3;q++){const bx=p[2*q+2]*G,by=p[2*q+3]*G,tx=bx-ax,ty=by-ay,L=Math.hypot(tx,ty)||1,bb=p[8+q]*L*2;ctx.quadraticCurveTo((ax+bx)/2-ty/L*bb,(ay+by)/2+tx/L*bb,bx,by);ax=bx;ay=by}
ctx.closePath();ctx.fill();ctx.stroke()}
if(AR_BODY.complete&&AR_BODY.naturalWidth){const dw=(i,al)=>{ctx.globalAlpha=al;ctx.drawImage(AR_BODY,i*260,0,260,360,-130*S,-90*S,260*S,360*S)};
if(e.b1===e.b2||!e.bwt)dw(e.b1,1);else{dw(e.b1,1-e.bwt);dw(e.b2,e.bwt)}ctx.globalAlpha=1}
ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(g.ax,g.ay);ctx.lineTo(g.nx,g.ny);ctx.lineTo(g.bx,g.by);ctx.stroke();
if(e.ka>0&&AR_ARW.complete&&AR_ARW.naturalWidth){const L=g.L,h=L*AR_ARW.naturalHeight/AR_ARW.naturalWidth;ctx.save();ctx.globalAlpha=e.ka;ctx.translate(g.nx,g.ny);ctx.rotate(Math.atan2(g.dy,g.dx));ctx.strokeStyle='#fff';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(L,0);ctx.stroke();ctx.drawImage(AR_ARW,0,-h/2,L,h);ctx.restore()}
ctx.restore()}
function drawArrowB(b){const L=24,h=L*AR_ARW.naturalHeight/AR_ARW.naturalWidth||2;ctx.save();if(b.ill)ctx.globalAlpha=(b.y<60?1:Math.max(.05,1-(b.y-60)/300))*(Math.sin(t*.18+b.ph)>-.2?1:.12);ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));ctx.strokeStyle='#fff';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-L,0);ctx.lineTo(0,0);ctx.stroke();if(AR_ARW.complete&&AR_ARW.naturalWidth)ctx.drawImage(AR_ARW,-L,-h/2,L,h);ctx.restore()}

// ===== QUỶ BOM (stage 3 demo): bắn đạn đơn 4s/viên x4 -> lao vào người chơi rồi nổ; chết cũng nổ =====
const BM_IMG=new Image();BM_IMG.src='assets/images/bomber.png';
const BM_SHOT=120,BM_N=3,BM_FIRST=70,BM_WAIT=45,BM_CHARGE=40,BM_HP=14,BM_FRAG=7; // BM_SHOT=240 tick = 4s giữa 2 viên · BM_FRAG = số mảnh đạn khi nổ
let s3fx=[];
function spawnBomber(x,yt,ph,o){const e={t:0,ek:'bomber',hp:BM_HP,x,y:-40,yt,ph,st:0,sh:0,hc:0,d:1.3,ang:0,sp:0,ft:0,pop:0};en.push(e);if(o)Object.assign(e,o);return e}
function boomB(e){const a0=Math.random()*6.2832;
for(let i=0;i<BM_FRAG;i++)ebul(e.x,e.y,a0+i*6.2832/BM_FRAG+(Math.random()-.5)*.35,2.1+Math.random()*1,0);
s3fx.push({x:e.x,y:e.y,t:0});
for(let i=0;i<18;i++){const a=Math.random()*6.2832,v=1+Math.random()*3.5;fx.push({x:e.x,y:e.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:22,c:i%2?'#ffb020':'#ff5a30'})}
if(P.inv<=0&&bombT<=0&&dying<=0&&Math.hypot(P.x-e.x,P.y-e.y)<30)hit()}
const BM_PEL=7,BM_SPREAD=.8; // quỷ bom: bắn shotgun — BM_PEL viên toả trong góc BM_SPREAD (rad), tốc độ mỗi viên hơi lệch nhau
function bmShotgun(e){const a0=Math.atan2(P.y-e.y,P.x-e.x);for(let i=0;i<BM_PEL;i++){const o=(i/(BM_PEL-1)-.5)*BM_SPREAD+(Math.random()-.5)*.1;ebul(e.x,e.y+6,a0+o,2.3+Math.random()*1.1,1)}
for(let q=0;q<6;q++){const a=a0+(Math.random()-.5)*.9,v=1+Math.random()*2;fx.push({x:e.x,y:e.y+6,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:10,c:'#ffd27a'})}}
function mvBomber(e){
if(e.pop>0)e.pop--;
if(e.st===4){e.dist+=SPD*e.psp;const q=pathAt(e.pa,e.dist);if(!q){e.gone=1;return}e.x=q[0];e.y=q[1];const f=e.dist/e.pa.len;if(e.f1&&!e.fd&&f>=e.f1){e.fd=1;bmShotgun(e);e.pop=10}if(e.dv&&f>=e.dv){e.st=2;e.ft=BM_CHARGE-22}return}
if(e.st===0){e.y+=(e.yt-e.y)*.06+.6;if(e.yt-e.y<2){e.y=e.yt;e.st=1;e.hc=0}}
else if(e.st===1){e.x+=Math.sin(e.t*.03+e.ph)*.7;e.x=Math.max(26,Math.min(W-26,e.x));e.y+=Math.sin(e.t*.06+e.ph)*.2;e.hc++;
if(e.sh<BM_N&&e.hc===BM_FIRST+e.sh*BM_SHOT){bmShotgun(e);e.sh++;e.pop=10}
if(e.sh>=BM_N&&e.hc>BM_FIRST+(BM_N-1)*BM_SHOT+BM_WAIT){e.st=2;e.ft=0}}
else if(e.st===2){e.ft++;e.x+=(Math.random()-.5)*1.6;e.y+=(Math.random()-.5)*1.2;                       // dồn lực: rung + ngòi cháy mạnh
if(e.ft>=BM_CHARGE){e.ang=Math.atan2(P.y-e.y,P.x-e.x);e.sp=1.2;e.st=3;e.ft=0}}
else{e.ft++;e.sp=Math.min(6.2,e.sp+.16);const ta=Math.atan2(P.y-e.y,P.x-e.x);let d=ta-e.ang;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;e.ang+=Math.max(-.035,Math.min(.035,d)); // lao + đuổi nhẹ
e.x+=Math.cos(e.ang)*e.sp;e.y+=Math.sin(e.ang)*e.sp;
if(Math.hypot(P.x-e.x,P.y-e.y)<17||e.y>H-8||e.ft>170||e.x<-8||e.x>W+8){e.sd=1;e.hp=0}}}                  // tự nổ (không cho điểm/rơi đồ)
function drawBomber(e){
if(!BM_IMG.complete||!BM_IMG.naturalWidth)return;
const Wd=44*(1+(e.pop>0?e.pop*.012:0)),Hd=Wd*BM_IMG.naturalHeight/BM_IMG.naturalWidth,cx=.4616*Wd,cy=.614*Hd,ch=e.st===2,dv=e.st===3;
if(dv){for(let i=3;i>=1;i--){ctx.save();ctx.globalAlpha=.12*(4-i);ctx.translate(e.x-Math.cos(e.ang)*e.sp*i*2.2,e.y-Math.sin(e.ang)*e.sp*i*2.2);ctx.drawImage(BM_IMG,-cx,-cy,Wd,Hd);ctx.restore()}}
if(ch||dv){ctx.save();ctx.globalAlpha=(.18+.17*Math.sin(e.t*(ch?.9:.6)))*(ch?1:.8);ctx.fillStyle='#ff6a3a';ctx.beginPath();ctx.arc(e.x,e.y,Wd*(ch?.62+e.ft/BM_CHARGE*.15:.6),0,6.2832);ctx.fill();ctx.restore()}
ctx.save();ctx.translate(e.x,e.y);ctx.rotate(dv?Math.cos(e.ang)*.18:Math.sin(e.t*.07+e.ph)*.07);ctx.drawImage(BM_IMG,-cx,-cy,Wd,Hd);
for(let i=0;i<2;i++){const px=(i?302:33)/320*Wd-cx,py=(i?18:27.5)/320*Wd-cy,f=.5+.5*Math.sin(e.t*(ch?1.3:.5)+i*2);ctx.fillStyle='rgba(255,235,130,'+(.35+.65*f)+')';ctx.beginPath();ctx.arc(px,py,(ch?2.8:1.8)*(.7+f*.6),0,6.2832);ctx.fill()}
ctx.restore()}
function drawS3hud(){drawFlames();for(const f of s3fx){const k=f.t/22;ctx.save();ctx.globalAlpha=1-k;ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.arc(f.x,f.y,6+f.t*1.6,0,6.2832);ctx.fill();ctx.globalAlpha=(1-k)*.9;ctx.strokeStyle='#ff6a30';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,10+f.t*2.6,0,6.2832);ctx.stroke();ctx.restore()}
if(s3bn>0){ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,s3bn/30,(200-s3bn)/20));ctx.textAlign='center';ctx.font='bold 30px sans-serif';ctx.lineWidth=4;ctx.strokeStyle='#000b';ctx.fillStyle='#fff';ctx.strokeText('STAGE 3',W/2,H/2-60);ctx.fillText('STAGE 3',W/2,H/2-60);ctx.restore()}}
// ===== PHÙ THUỶ QUỶ (stage 3): lơ lửng trên cao, niệm chú tạo ngọn lửa — lửa lơ lửng trôi NGẪU NHIÊN khắp map; phù thuỷ chết thì lửa tàn nhanh =====
const WT_IMG=new Image();WT_IMG.src='assets/images/witch.png';
const WT_HP=24,WT_FIRST=45,WT_GAP=170,WT_N=2,WT_STAY=840,WT_CAST=34; // WT_GAP = tick giữa 2 lần niệm · WT_N = số ngọn lửa mỗi lần · WT_STAY = tick ở lại rồi bay đi
const FL_LIFE=480,FL_IGN=26,FL_SPD=1.35,FL_MAX=12,FL_R=6; // FL_LIFE = tuổi thọ lửa · FL_IGN = tick "nhóm lửa" (chưa gây sát thương) · FL_SPD = tốc độ trôi · FL_MAX = tối đa lửa cùng lúc · FL_R = bán kính trúng đòn
const FL_SPR=(()=>{const c=document.createElement('canvas');c.width=40;c.height=56;const x=c.getContext('2d');
const tear=()=>{x.beginPath();x.moveTo(20,2);x.bezierCurveTo(24,15,36,26,36,39);x.bezierCurveTo(36,50,29,55,20,55);x.bezierCurveTo(11,55,4,50,4,39);x.bezierCurveTo(4,26,16,15,20,2);x.closePath()};
tear();const g=x.createRadialGradient(20,42,2,20,40,20);g.addColorStop(0,'#ffe9a0');g.addColorStop(.45,'#ff8a1f');g.addColorStop(1,'#e0261a');x.fillStyle=g;x.fill();x.lineWidth=2;x.strokeStyle='#4a0a14';x.stroke();
x.save();x.translate(20,43);x.scale(.5,.5);x.translate(-20,-43);tear();x.fillStyle='#fff2b8';x.fill();x.restore();return c})();
function spawnWitch(x,yt,ph,o){const e={t:0,ek:'witch',hp:WT_HP,x,y:-40,yt,ty:yt,tx:x,ph,st:0,hc:0,cast:0,d:1.3};en.push(e);if(o)Object.assign(e,o);return e}
function flPick(f){f.tx=rf(18,W-18);f.ty=rf(30,H-30);f.wt=70+Math.random()*70|0}
function spawnFlame(e,ox){if(s3fl.length>=(s3cap||FL_MAX))s3fl.shift();const f={x:e.x+ox,y:e.y+10,vx:ox*.03,vy:.5,t:0,life:FL_LIFE+(Math.random()*80|0),sd:Math.random()*6.2832,o:e};flPick(f);s3fl.push(f)}
function witchCast(e){{const n=e.nf||(s3buff?5:WT_N);for(let i=0;i<n;i++)spawnFlame(e,(i-(n-1)/2)*26)}for(let q=0;q<10;q++){const a=Math.random()*6.2832,v=.8+Math.random()*2;fx.push({x:e.x,y:e.y+8,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:16,c:q&1?'#ff8a2a':'#ffd27a'})}}
function witchDie(e){for(const f of s3fl)if(f.o===e)f.life=Math.min(f.life,f.t+150);for(let i=0;i<14;i++){const a=Math.random()*6.2832,v=1+Math.random()*3;fx.push({x:e.x,y:e.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:24,c:i%2?'#ff3b1f':'#ff9a2a'})}}
function mvWitch(e){if(e.cast>0){e.cast--;if(e.cast===WT_CAST-16)witchCast(e)}
if(e.t%9===0)fx.push({x:e.x+(Math.random()-.5)*14,y:e.y+10,vx:(Math.random()-.5)*.6,vy:-.8,l:18,c:'#ff8a2a'});
if(e.st===4){e.dist+=SPD*e.psp;const q=pathAt(e.pa,e.dist);if(!q){e.gone=1;return}e.x=q[0];e.y=q[1];e.hc++;if(e.hc%80===40&&e.y>10&&e.y<H-60)e.cast=WT_CAST;return}
const WL=e.keep?1e9:(e.life||WT_STAY);
if(e.st===0){e.y+=(e.yt-e.y)*.06+.6;if(e.yt-e.y<2){e.y=e.yt;e.st=1;e.hc=0}}
else if(e.st===1){e.hc++;if(e.hc%160===1){if(e.home){e.tx=Math.max(34,Math.min(W-34,e.hx+(Math.random()-.5)*60));e.ty=e.hy+(Math.random()-.5)*36}else{e.tx=40+Math.random()*(W-80);e.ty=58+Math.random()*64}}
e.x+=Math.max(-1.1,Math.min(1.1,(e.tx-e.x)*.02));e.y+=Math.max(-.8,Math.min(.8,(e.ty-e.y)*.02));e.x=Math.max(26,Math.min(W-26,e.x));
if(e.hc>=WT_FIRST&&(e.hc-WT_FIRST)%(s3buff?130:WT_GAP)===0&&e.hc<WL-30)e.cast=WT_CAST;
if(e.hc>=WL)e.st=2}
else{e.y-=2.4;if(e.y<-60)e.gone=1}}
function drawWitch(e){if(!WT_IMG.complete||!WT_IMG.naturalWidth)return;
const hh=46,ww=hh*WT_IMG.naturalWidth/WT_IMG.naturalHeight,c=e.cast>0?Math.sin(Math.PI*(1-e.cast/WT_CAST)):0,bob=Math.sin(e.t*.06+e.ph)*2.2;
if(c>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.4*c;ctx.fillStyle='#ff4a1a';ctx.beginPath();ctx.arc(e.x,e.y+bob,hh*(.5+.25*c),0,6.2832);ctx.fill();ctx.restore()}
ctx.save();ctx.translate(e.x,e.y+bob);ctx.rotate(Math.sin(e.t*.04+e.ph)*.06);const s=1+.1*c;ctx.scale(s,s);ctx.drawImage(WT_IMG,-ww/2,-hh/2-3*c,ww,hh);ctx.restore()}
function flameUpd(){for(const f of s3fl){f.t++;
if(f.t>FL_IGN){if(--f.wt<=0||Math.hypot(f.tx-f.x,f.ty-f.y)<14)flPick(f);const dx=f.tx-f.x,dy=f.ty-f.y,d=Math.hypot(dx,dy)||1,sp=FL_SPD*(.75+.25*Math.sin(f.t*.05+f.sd));f.vx+=(dx/d*sp-f.vx)*.035;f.vy+=(dy/d*sp-f.vy)*.035}
else{f.vx*=.92;f.vy*=.92}
f.x=Math.max(8,Math.min(W-8,f.x+f.vx));f.y=Math.max(8,Math.min(H-8,f.y+f.vy));
if(f.t>FL_IGN&&f.t<f.life-14&&Math.hypot(P.x-f.x,P.y-f.y)<FL_R*hbS+2)hit();
if(f.t%7===0)fx.push({x:f.x+(Math.random()-.5)*8,y:f.y-4,vx:(Math.random()-.5)*.5,vy:-.9,l:14,c:'#ff9a2a'})}
s3fl=s3fl.filter(f=>f.t<f.life)}
function drawFlames(){for(const f of s3fl){const k=f.t<FL_IGN?f.t/FL_IGN:1,fd=Math.max(0,Math.min(1,(f.life-f.t)/40))*(f.t<FL_IGN?.55:1),fl=1+.08*Math.sin(f.t*.45+f.sd),s=.62*k*fl;
ctx.save();ctx.translate(f.x,f.y);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.3*fd;ctx.fillStyle='#ff6a1a';ctx.beginPath();ctx.arc(0,0,17*k*fl,0,6.2832);ctx.fill();
ctx.globalCompositeOperation='source-over';ctx.globalAlpha=fd;ctx.rotate(.1*Math.sin(f.t*.13+f.sd*2));ctx.drawImage(FL_SPR,-20*s,-40*s,40*s,56*s);ctx.restore()}}
function mvS2(e){const k=e.ek;if(k==='archer'){mvArcher(e);return}if(k==='bomber'){mvBomber(e);return}if(k==='witch'){mvWitch(e);return}
if(e.pa){e.dist+=SPD*(e.sp||1);const q=pathAt(e.pa,e.dist);if(!q){e.gone=1;return}e.x=q[0];e.y=q[1]}
else if(k==='water'){
if(e.st===0){e.y+=2.6;if(e.y>=54){e.y=54;e.st=1}}
else if(e.st===1){e.x+=Math.sin(e.t*.9)*.8;e.hf++;if(!PV.on&&(e.hf===6||e.hf===30)){const a0=Math.atan2(P.y-e.y,P.x-e.x);for(let q=-1;q<=1;q++)ebul(e.x,e.y,a0+q*.22,2.3,1)}
if(e.hf>=(PV.on?26:54)){e.tx=P.x;e.ty=Math.min(H-24,P.y);const a=Math.atan2(e.ty-e.y,e.tx-e.x);e.vx=Math.cos(a)*6;e.vy=Math.sin(a)*6;e.st=2}}
else{e.x+=e.vx;e.y+=e.vy;if(Math.hypot(e.tx-e.x,e.ty-e.y)<=6||e.y>H+20||e.x<-30||e.x>W+30){if(e.y<=H)mkPuddle(e.tx,e.ty);e.gone=1}}}
else{
if(e.st===0){e.y+=3.2;if(e.y>=e.yt){e.y=e.yt;e.st=1}}
else if(e.st===1){if(++e.hf>=e.hold)e.st=2}
else{e.y-=3.4;if(e.y<-45)e.gone=1}}}
function fireS2(e){const k=e.ek,u=e.t-11;
if(k==='water'){if(e.pa&&u>=20&&(u-20)%80===0){const a0=Math.atan2(P.y-e.y,P.x-e.x);for(let q=-1;q<=1;q++)ebul(e.x,e.y,a0+q*.22,2.3,1)}}
else if(k==='fire'){if(u>=24&&(u-24)%140===0){const tx=Math.max(24,Math.min(W-24,P.x)),ty=Math.min(H-30,P.y),a=Math.atan2(ty-e.y,tx-e.x);fbs.push({x:e.x,y:e.y,vx:Math.cos(a)*2.7,vy:Math.sin(a)*2.7,tx,ty})}}
else if(k==='earth'){if(u>=20&&(u-20)%150===0)mkRock(e.x,e.y+10,Math.atan2(P.y-e.y,P.x-e.x),1.5,17)}
else if(k==='thunder'){if(e.pa){if(u>=20&&(u-20)%120===0)lz.push({x:e.x,y:e.y,a:Math.atan2(P.y-e.y,P.x-e.x),tel:46,on:14,w:9,t:0,aim:1,lock:40,cx:e.x,cy:e.y,off:0});return}if(e.st!==1)return;if(e.hf%110===(e.x<W/2?20:75))lz.push({x:e.x,y:e.y,a:Math.atan2(P.y-e.y,P.x-e.x),tel:46,on:14,w:9,t:0,aim:1,lock:40,cx:e.x,cy:e.y,off:0})}
}
function mkRock(x,y,a,s,r){const p=[];for(let i=0;i<8;i++)p.push(.78+Math.random()*.3);rk.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r,a:Math.random()*6,va:(Math.random()-.5)*.05,p})}
function shatter(r){r.dead=1;if(r.bb){mkPuddle(r.x,r.y);for(let k=0;k<10;k++)fx.push({x:r.x,y:r.y,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,l:16,c:'#9fd4ff'});return}for(let i=0;i<9;i++){const a=Math.random()*6.2832,sp=1.3+Math.random()*1.5;mkRock(r.x,r.y,a,sp,4.5+Math.random()*1.5);rk[rk.length-1].f=1}for(let k=0;k<8;k++)fx.push({x:r.x,y:r.y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,l:14,c:'#a8734f'})}
function s2reset(){s2cg=null;s2b1=0;s2b2=0;s2bw=0;zn=[];fbs=[];rk=[];ths=[];idleT=0;edgeT=0;burn=0;wet=0;ancX=-999;ancY=-999;thCd=0}
function s2upd(){
if(s2cg){const c=s2cg,ins=P.x>=c.x&&P.x<=c.x+c.w&&P.y>=c.y&&P.y<=c.y+c.h;if(bombT<=0&&c.was&&!ins){P.x=Math.max(c.x+8,Math.min(c.x+c.w-8,P.x));P.y=Math.max(c.y+8,Math.min(c.y+c.h-8,P.y))}else c.was=ins}
for(const f of fbs){f.x+=f.vx;f.y+=f.vy;const ph=Math.hypot(P.x-f.x,P.y-f.y)<10*hbS,ar=Math.hypot(f.tx-f.x,f.ty-f.y)<=3;
if(ph)hit();if(ph||ar){f.done=1;zn.push({k:'f',x:f.x,y:f.y,r:30,t:0,life:360})}else if(f.x<-12||f.x>W+12||f.y>H+12)f.done=1}
fbs=fbs.filter(f=>!f.done);
let inF=0,inW=0;for(const z of zn){z.t++;const d=Math.hypot(P.x-z.x,P.y-z.y);if(z.k==='f'){if(z.t>20&&d<z.r-3)inF=1}else if(d<z.r)inW=1}
zn=zn.filter(z=>z.t<z.life);wet=inW;
if(inF&&P.inv<=0&&bombT<=0&&dying<=0){if(++burn>=36){burn=0;hit()}}else burn=Math.max(0,burn-2);
for(const r of rk){if(r.dead)continue;r.x+=r.vx;r.y+=r.vy;r.a+=r.va;if(Math.hypot(P.x-r.x,P.y-r.y)<r.r+3*hbS)hit()}
rk=rk.filter(r=>!r.dead&&r.x>-40&&r.x<W+40&&r.y>-40&&r.y<H+40);
const th=en.some(e=>e.ek==='thunder'&&e.hp>0&&e.y>10);
if(!th){idleT=0;edgeT=0;ancX=-999}
else{if(thCd>0)thCd--;
if(Math.hypot(P.x-ancX,P.y-ancY)>14){ancX=P.x;ancY=P.y;idleT=0}else idleT++;
if(idleT>=180&&thCd<=0){ths.push({x:P.x,y:P.y,t:0,tel:0,on:10});idleT=0;ancX=-999;thCd=90}
const bad=P.x<24||P.x>W-24||P.y<70;edgeT=bad?edgeT+1:Math.max(0,edgeT-2);
if(edgeT>=60&&thCd<=0){ths.push({x:P.x,y:P.y,t:0,tel:0,on:10});thCd=120;edgeT=30}}
for(const s of ths){s.t++;if(s.t>=s.tel&&s.t<s.tel+s.on&&Math.hypot(P.x-s.x,P.y-s.y)<26)hit()}
ths=ths.filter(s=>s.t<s.tel+s.on+8)}
function drawS2g(){for(const z of zn){const f=Math.min(1,z.t/20,(z.life-z.t)/40);ctx.save();
if(z.k==='f'){ctx.globalAlpha=f*.6;const g=ctx.createRadialGradient(z.x,z.y,2,z.x,z.y,z.r);g.addColorStop(0,'#ffd040');g.addColorStop(.6,'#ff5a14');g.addColorStop(1,'#a01800');ctx.fillStyle=g;ctx.beginPath();ctx.arc(z.x,z.y,z.r+Math.sin(t/4+z.x)*2,0,7);ctx.fill();
if(z.t<=20){ctx.globalAlpha=.6;ctx.strokeStyle='#ff9a30';ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.stroke()}}
else{ctx.globalAlpha=f*.5;ctx.fillStyle='#2a7bff';ctx.beginPath();ctx.ellipse(z.x,z.y,z.r,z.r*.8,0,0,7);ctx.fill();ctx.globalAlpha=f*.8;ctx.strokeStyle='#9fd4ff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(z.x,z.y,z.r*(.55+.1*Math.sin(t/12+z.y)),z.r*.45,0,0,7);ctx.stroke()}
ctx.restore()}}
function drawS2f(){
if(s2cg){const c=s2cg;ctx.save();ctx.shadowColor='#ffd400';ctx.shadowBlur=12;ctx.strokeStyle='#ffd91a';ctx.lineWidth=4;ctx.strokeRect(c.x,c.y,c.w,c.h);ctx.restore()}
for(const f of fbs){ctx.save();ctx.globalAlpha=.4;ctx.strokeStyle='#ff9a30';ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(f.tx,f.ty,30,0,7);ctx.stroke();ctx.restore();
ctx.fillStyle='#ff5a14';ctx.beginPath();ctx.arc(f.x,f.y,7,0,7);ctx.fill();ctx.fillStyle='#ffd040';ctx.beginPath();ctx.arc(f.x,f.y,3.8,0,7);ctx.fill()}
for(const r of rk){if(r.bb){ctx.save();ctx.strokeStyle='#8fd8ff';ctx.lineWidth=3;ctx.fillStyle='#4aa8ff44';ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,7);ctx.fill();ctx.stroke();ctx.restore();continue}ctx.save();ctx.translate(r.x,r.y);ctx.rotate(r.a);ctx.beginPath();r.p.forEach((q,i)=>{const an=i/r.p.length*6.2832;ctx.lineTo(Math.cos(an)*r.r*q,Math.sin(an)*r.r*q)});ctx.closePath();ctx.fillStyle=r.f?'#a8734f':'#6b4a3a';ctx.fill();ctx.strokeStyle='#2a1a12';ctx.lineWidth=2.5;ctx.stroke();
ctx.fillStyle='#8a6450';ctx.beginPath();ctx.moveTo(-r.r*.5,-r.r*.4);ctx.lineTo(r.r*.1,-r.r*.6);ctx.lineTo(r.r*.2,-r.r*.1);ctx.lineTo(-r.r*.4,0);ctx.closePath();ctx.fill();ctx.restore()}
for(const s of ths){if(s.t<s.tel){const fl=(s.t>s.tel-20&&(s.t>>1)&1);ctx.save();ctx.globalAlpha=.35+(fl?.4:0);ctx.strokeStyle='#ffe14d';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(s.x,0);ctx.lineTo(s.x,s.y);ctx.stroke();ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(s.x,s.y,26,0,7);ctx.stroke();ctx.restore()}
else{const f=1-Math.max(0,s.t-s.tel-s.on)/8;ctx.save();ctx.globalAlpha=f;ctx.strokeStyle='#fffbd0';ctx.lineWidth=7;ctx.shadowColor='#ffe14d';ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(s.x+3,0);for(let y=14;y<s.y;y+=16)ctx.lineTo(s.x+((y*7)%13)-6,y);ctx.lineTo(s.x,s.y);ctx.stroke();ctx.lineWidth=2.5;ctx.strokeStyle='#fff';ctx.stroke();ctx.fillStyle='#ffe14d55';ctx.beginPath();ctx.arc(s.x,s.y,26,0,7);ctx.fill();ctx.restore()}}
if(burn>0){ctx.fillStyle='#ff300045';ctx.beginPath();ctx.arc(P.x,P.y,12+burn/5,0,7);ctx.fill()}
if(wet){ctx.strokeStyle='#7fc4ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.x,P.y,13,0,7);ctx.stroke()}if(icy){ctx.strokeStyle='#6ff3ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.x,P.y,15,0,7);ctx.stroke()}}
function startS2(){stg=2;s2t=0;s2i=0;s2reset();s2bn=150;en=[];eb=[];lz=[];lf=[];bs=null;clr=0;endT=0;dying=0;bombT=0;P.inv=Math.max(P.inv,180);P.x=W/2;P.y=H-50;
gt=0;sg=0;retryA=0;setAud(2);try{aud.currentTime=0}catch(e){}}
function startS3(){stg=3;s2reset();s3reset();s3bn=200;en=[];eb=[];lz=[];lf=[];bs=null;clr=0;endT=0;dying=0;bombT=0;P.inv=Math.max(P.inv,180);P.x=W/2;P.y=H-50;
aud3.pause();try{aud3.currentTime=0}catch(e){}sg3=0;gt=0;sg=0;retryA=0;b1Left=0;setAud(3);aud.loop=false;try{aud.currentTime=0}catch(e){}}
function moveEnemy(e){if(e.ek){mvS2(e);return}
if(e.pa){e.dist+=SPD;const q=pathAt(e.pa,e.dist);if(!q){e.gone=1;return}e.x=q[0];e.y=q[1]}
else if(e.st===0){e.y+=2.2;if(e.y>=e.yt){e.y=e.yt;e.st=1}}
else if(e.st===1){if(++e.hf>=e.hold)e.st=2}
else{e.y-=2.2;if(e.y<-30)e.gone=1}}
const PH_HP=[140,220,140,250,320],PH_T=[1800,2400,1800,2400,3000];
const PH_HP1=[140,220,140,250],PH_T1=[1800,2400,1800,2400];
// ===== STAGE 3 · HAMIN =====
const S3_P1HP=260,PH_HP3=[200,280,200,300,220,400],PH_T3=[1800,2400,1800,2400,1800,3000]; // phase 1: máu chỉnh để người chơi diệt trong ~15-20s · phase 2: 6 thanh (lẻ = spell)
// Phase 1 (ảnh 5-6): tia laser toả quanh boss rồi biến mất · boss lướt sang trái/phải mới bắn các dàn đạn vòng cung (từng viên bi)
function s3p1(b,a){b.x+=Math.max(-2.2,Math.min(2.2,(b.tx-b.x)*.06));b.my+=1/55;b.y=95+Math.sin(b.my)*6;
if(b.t<=40)return;const u=b.t-41,C=360,k=u%C,cy=Math.floor(u/C);
const ray=o=>{for(let i=0;i<22;i++)lz.push({x:b.x,y:b.y,a:o+i*Math.PI*2/22,tel:56,on:18,w:7,t:0})};
if(k===0)b.tx=W/2;
if(k===70)ray(cy*.07);
if(k===150)ray(cy*.07+Math.PI/22);
if(k===230)b.tx=(cy&1)?297:87;
if(k>=238&&k<=298&&(k-238)%20===0){const j=(k-238)/20,o=(j&1)*.5;for(let i=0;i<26;i++)ebul(b.x,b.y,Math.PI/2-1.31+(i+o)*2.62/26,1.9,j&1?1:2)}}
function s3minions(){const nw=en.filter(e=>e.ek==='witch'&&e.keep).length,na=en.filter(e=>e.ek==='archer'&&e.keep).length;
for(let i=nw;i<2;i++){const x=i?W-80:80;spawnWitch(x,140,i,{keep:1,home:1,hx:x,hy:140})}
for(let i=na;i<2;i++){const x=i?W-130:130;spawnArcher(x,215,i,{keep:1,home:1,hx:x,hy:215})}}
function s3p2(b,a){const rnd=()=>{b.rs=(b.rs*1664525+1013904223)>>>0;return b.rs/4294967296};
const bar=b.bar;s3buff=bar===5;s3cap=bar===3?26:bar===5?32:0;
b.x+=Math.max(-2.2,Math.min(2.2,(b.tx-b.x)*.06));b.my+=1/55;b.y=95+Math.sin(b.my)*6;
if(b.t<=40)return;const u=b.t-41;
const L=(x,y,ang,tel,on,w,o)=>lz.push(Object.assign({x,y,a:ang,tel,on,w,t:0},o||{}));
const arrow=(x,y,sp,ill)=>{const e={x,y,vx:0,vy:sp,c:-1,w:0,ar:1,k:.3};if(ill){e.ill=1;e.ph=rnd()*6}eb.push(e)};
if(bar===0){ // chiêu 1: 2 laser chữ V khép dần thành 2 laser song song + các vòm đạn bi
const C=420,k=u%C,cy=Math.floor(u/C);
if(k===0){b.tx=W/2;for(const s of[-1,1])L(b.x,b.y,Math.PI/2-s*.95,44,150,12,{s,x0:b.x,fn:l=>{const q=Math.max(0,Math.min(1,(l.t-l.tel)/80)),e=q*q*(3-2*q);l.a=Math.PI/2-l.s*.95*(1-e);l.x=l.x0+l.s*34*e}})}
if(k>=190)b.tx=W/2+Math.sin(u/80)*70;
if(k>=60&&k<=300&&(k-60)%40===0){const j=(k-60)/40,n=18,o=(j&1)*.5,c0=Math.PI/2+Math.sin(j*1.7+cy)*.35;for(let i=0;i<n;i++)ebul(b.x,b.y,c0-1.25+(i+o)*2.5/(n-1),1.7+(j&1)*.2,j&1?1:2)}}
else if(bar===1){ // zilder 1: dãy laser ngang dài + mưa đạn rơi nhanh
const C=560,k=u%C;b.tx=W/2+Math.sin(u/120)*60;
if(k<150&&k%30===0)L(0,420-k/30*60,0,44,330,9);
if(k>=30&&k<=440&&k%5===0)ebul(rnd()*W,-6,Math.PI/2+(rnd()-.5)*.12,2.7+rnd()*.8,Math.floor(rnd()*3))}
else if(bar===2){ // chiêu 2: 4 luồng đạn xoắn ốc chuyển động liên tục, đổi chiều xoáy
b.tx=W/2+Math.sin(u/150)*80;const dir=(Math.floor(u/300)&1)?-1:1;
if(u%4===0){b.sp+=.11*dir;for(let i=0;i<4;i++)ebul(b.x,b.y,b.sp+i*Math.PI/2,1.9,i&1?1:2)}
if(u%75===40)for(let q=-1;q<=1;q++)ebul(b.x,b.y,a+q*.16,2.4,0)}
else if(bar===3){ // zilder 2: mưa tên + nhiều hòn lửa trôi ngẫu nhiên khắp map
b.tx=W/2+Math.sin(u/130)*100;
if(u%16===0&&s3fl.length<26){let x,y,n=0;do{x=30+rnd()*(W-60);y=40+rnd()*(H-140)}while(Math.hypot(x-P.x,y-P.y)<80&&++n<8);spawnFlame({x,y:y-10},0)}
if(u%7===0)arrow(rnd()*W,-8,3.2+rnd()*.8)}
else if(bar===4){ // chiêu 3: ảo ảnh tên — nhấp nháy, càng xuống rìa dưới càng trong suốt
b.tx=W/2+Math.sin(u/160)*60;const R=50,j=Math.floor(u/R);
if(u%R===0){b.gl=b.gl==null?6:Math.max(1,Math.min(12,b.gl+Math.round((rnd()-.5)*4)));const lane=(j&1)?1:1.5;for(let c=0;c<14;c++){if(Math.abs(c-b.gl)<lane)continue;arrow(14+c*28+(j&1)*14,-8,2.6,1)}}
if(u%130===70)for(let q=-1;q<=1;q++){const e={x:b.x,y:b.y+10,vx:Math.cos(a+q*.2)*2.4,vy:Math.sin(a+q*.2)*2.4,c:-1,w:0,ar:1,k:.3,ill:1,ph:rnd()*6};eb.push(e)}}
else{ // zilder 3: laser toả tròn + đạn xếp dọc theo laser + mưa tên; phù thuỷ (5 lửa) & xạ quỷ (3 tên) được buff
b.tx=W/2+Math.sin(u/140)*80;
if(u===1||u%480===240)s3minions();
const C=300,k=u%C,cy=Math.floor(u/C),n=12;
if(k===0||k===150){const o=(k?Math.PI/n:0)+cy*.11;b.ro=o;b.ox=b.x;b.oy=b.y;for(let i=0;i<n;i++)L(b.ox,b.oy,o+i*Math.PI*2/n,56,26,8)}
if(((k>=56&&k<=86)||(k>=206&&k<=236))&&k%6===2){for(let i=0;i<n;i++)ebul(b.ox,b.oy,b.ro+i*Math.PI*2/n,2.4,i&1?1:2)}
if(u%16===0)arrow(rnd()*W,-8,3)}}

function spellOf(b){return b.ph===2&&(stg===3?(b.bar&1)===1:stg===2?((b.bar&1)===1||b.bar===4):b.bar===1)}
function boss2(b,a){
const rnd=()=>{b.rs=(b.rs*1664525+1013904223)>>>0;return b.rs/4294967296};
b.x+=Math.max(-2.2,Math.min(2.2,(b.tx-b.x)*.06));b.my+=1/55;b.y=95+Math.sin(b.my)*6;
if(b.t<=40)return;const u=b.t-41,bar=b.bar;
const L=(x,y,ang,tel,on,w,o)=>lz.push(Object.assign({x,y,a:ang,tel,on,w,t:0},o||{}));
if(bar===0){b.tx=W/2;
if(u%90===0){const o=((u/90)&1)*Math.PI/24;for(let i=0;i<24;i++)ebul(b.x,b.y,o+i*Math.PI/12,1.5,i&1)}
if(u%45===22){for(let q=-1;q<=1;q++)ebul(b.x,b.y,a+q*.13,2.3,2)}}
else if(bar===2){const C=500,k=u%C,cy=Math.floor(u/C),lean=(cy&1?1:-1)*.085,ang=Math.atan2(1,lean);
if(k===0){b.safe=[[1,4,7],[2,5,8],[0,3,6],[1,5,8]][cy%4];for(let i=0;i<8;i++)L(29+i*46,b.y+14,ang,70,100,11)}
if(k>=20&&k<=110&&k%9===2){for(let j=0;j<9;j++){if(b.safe.includes(j))continue;ebul(j===0?14:j===8?368:52+46*(j-1),b.y+16,ang,2.4,j&1?1:2)}}
if(k>=200&&k<450){const r=Math.floor((k-200)/50),kk=(k-200)%50,dir=r&1?1:-1;
if(kk===0)b.tx=dir>0?W*.72:W*.28;
if(kk<32&&kk%2===0)ebul(b.x,b.y+8,Math.PI/2+dir*(-.75+1.5*(kk/2)/15),1.9,r%3)}
if(k===450)b.tx=[.5,.25,.75,.35,.65][cy%5]*W}
else if(bar===1){const C=300,k=u%C,cy=Math.floor(u/C);
if(k===0){b.tx=b.x;for(const o of[-38,0,38])L(b.x,b.y,a,62,45,9,{aim:1,lock:44,cx:b.x,cy:b.y,off:o})}
if(k===110||k===150||k===190){const am=Math.atan2(P.y-b.y,P.x-b.x);for(let i=0;i<18;i++)ebul(b.x,b.y,am+(rnd()-.5)*1,1.1+rnd()*2,Math.floor(rnd()*3),(rnd()-.5)*.03)}
if(k===240)b.tx=[.3,.7,.5,.2,.8][cy%5]*W}
else{const r=b.hp/b.max,sg=r>.66?0:r>.33?1:2;
b.tx=W/2+Math.sin(u/(110-sg*18))*(90+sg*14);
if(u%(sg?6:8)===0){b.sp+=.19+sg*.04;ebul(b.x,b.y,b.sp,1.6+sg*.12,2);ebul(b.x,b.y,b.sp+Math.PI,1.6+sg*.12,2);
if(sg>=1){b.cs=(b.cs||0)-(.15+sg*.03);ebul(b.x,b.y,b.cs,1.5,1)}}
if(u%(sg?60:75)===30){const n=sg?3:2;for(let q=-n;q<=n;q++)ebul(b.x,b.y,a+q*.17,2.3+sg*.15,0)}
if(u%(sg===2?42:sg?58:75)===0){const xs=[.46,.68,.38,.28,.78,.55,.2,.62],x=xs[b.ci%8]*W;lf.push({x,bx:x,y:-34,t:0,ph:b.ci*1.7});b.ci++}
if(u%(sg===2?210:sg?250:280)===100){const px=Math.max(34,Math.min(W-34,P.x));L(px-62,b.y+14,Math.PI/2,60,50,10);L(px+62,b.y+14,Math.PI/2,60,50,10);
if(sg>=1)L(b.x,b.y,a,70,40,9,{aim:1,lock:60,cx:b.x,cy:b.y,off:0})}
if(sg>=1&&u%160===80){const n=26,w=((Math.floor(u/160)&1)?1:-1)*.005;for(let i=0;i<n;i++)ebul(b.x,b.y,i*Math.PI*2/n,1.5,1,w)}
if(sg===2&&u%430===200){const d=(Math.floor(u/430)&1)?-1:1;for(let i=0;i<9;i++)L(b.x,b.y,Math.PI/2+d*(-.8+i*.2),46+i*7,26,8)}
if(sg===2&&u%8===0)ebul(rnd()*W,-6,Math.PI/2,1.7+rnd()*.7,0)}}

const rf=(a,b)=>a+Math.random()*(b-a);
const U_L=mkPath([[.08,.19],[.06,.36],[.06,.56],[.1,.65],[.15,.72],[.2,.79],[.29,.82],[.4,.82]]),U_R=mkPath([[.83,.05],[.86,.15],[.86,.32],[.86,.45],[.82,.57],[.74,.7],[.6,.77],[.4,.81]]);
const S5R=mkPath([[.32,-.02],[.32,.197],[.356,.258],[.418,.319],[.48,.373],[.551,.455],[.604,.563],[.636,.678],[.64,.743],[.645,1.1]]),S5G=mkPath([[.62,-.02],[.618,.17],[.596,.237],[.533,.319],[.48,.377],[.4,.455],[.329,.529],[.289,.61],[.289,.736],[.289,1.1]]);
function pbul(pa,c,sp){eb.push({x:pa.pts[0][0],y:pa.pts[0][1],vx:0,vy:0,c,w:0,pa,dist:0,sp})}
function boss1s(b,a){b.mph+=1/90;b.my+=1/55;b.x=W/2+Math.sin(b.mph)*90;b.y=95+Math.sin(b.my)*10;if(b.t<=40)return;
const u=b.t-41,k=u%300,cy=Math.floor(u/300)%4;
if(k<150){if(k%20===0)lz.push({x:rf(24,W-24),y:0,a:Math.PI/2,tel:34,on:12,w:10,t:0});
if(k%75===40)lz.push({x:b.x,y:b.y,a,tel:50,on:12,w:9,t:0,aim:1,lock:36,cx:b.x,cy:b.y,off:0})}
else{const j=k-150;
if(cy===0){if(j<90&&j%6===0){pbul(S5R,0,2.3);pbul(S5G,1,2.3)}}
else if(cy===1){if(j<90&&j%8===0){pbul(U_L,3,1.8);pbul(U_R,3,1.8)}
if(j%14===0){for(const x of[.35,.55])ebul(x*W,-6,Math.PI/2,2,1);for(const x of[.23,.45,.64])ebul(x*W,-6,Math.PI/2,2.2,4)}}
else if(cy===2){if(j<90&&j%5===0){ebul(.08*W,-6,Math.atan2(.9*H,.77*W),2.6,0);ebul(.94*W,-6,Math.atan2(.85*H,-.8*W),2.6,0)}}
else{if(j%10===0){const x=rf(14,W-14),c=Math.random()<.5?0:1,sp=rf(2,3);for(let q=0;q<3;q++)ebul(x,-6-q*8,Math.PI/2,sp,c)}}}}
function boss3(b,a){const rnd=Math.random;b.mv=Math.max(-3,Math.min(3,(b.mv||0)*.72+(b.tx-b.x)*.02));b.x+=b.mv;b.my+=1/55;b.y=95+Math.sin(b.my)*6+Math.sin(b.my*2.3)*2;
if(b.t<=40)return;const u=b.t-41,bar=b.bar;
if(bar===0){b.tx=W/2+Math.sin(u/90)*80;
if(u%80===0){const n=30,o=(Math.floor(u/80)&1)*Math.PI/n;for(let i=0;i<n;i++)ebul(b.x,b.y,o+i*2*Math.PI/n,1.4,0)}
if(u%45===22){for(let q=-2;q<=2;q++)for(let j=0;j<4;j++)ebul(b.x,b.y,a+q*.1,2.6+j*.45,0)}}
else if(bar===1){b.tx=W/2+Math.sin(u/120)*90;
if(u%12===0)mkRock(rf(10,W-10),-10,Math.PI/2+(rnd()-.5)*.12,rf(1.5,2.7),rf(9,13));
if(u%120===60)mkRock(b.x,b.y+10,a,1.8,14)}
else if(bar===2){b.tx=W/2+Math.sin(u/100)*100;
if(u%70===0)rk.push({x:rf(30,W-30),y:b.y+20,vx:(rnd()-.5)*.7,vy:rf(.7,1.2),r:rf(13,22),a:0,va:0,p:[],bb:1});
if(u%50===25)for(let q=-1;q<=1;q++)ebul(b.x,b.y,a+q*.3,3.2,1)}
else if(bar===3){b.tx=W/2+Math.sin(u/110)*70;
if(u%170===20)for(const o of[-38,0,38])lz.push({x:b.x,y:b.y,a,tel:62,on:45,w:9,t:0,aim:1,lock:44,cx:b.x,cy:b.y,off:o});
if(u%90===45)lz.push({x:rf(24,W-24),y:0,a:Math.PI/2,tel:34,on:12,w:10,t:0});
if(u%80===40){for(const sp of[1.2,1.6,2.0,2.4])for(let i=-9;i<=9;i++)ebul(b.x,b.y,a+i*.1,sp,2)}}
else{b.tx=W/2;
if(u===0){s2cg={x:44,y:190,w:296,h:244,t:0,was:true,zap:0};P.x=W/2;P.y=H-70;P.inv=Math.max(P.inv,120)}
if(u%130===20)for(let i=0;i<14;i++){ebul(b.x,b.y,-Math.PI/2+(rnd()-.5)*1.6,rf(2.2,3.1),0);eb[eb.length-1].g=.06}
if(u%110===60)mkRock(b.x,b.y+10,a,1.7,13);
if(u%70===35)for(let q=-2;q<=2;q++)ebul(b.x,b.y,a+q*.16,3.2,1);
if(u>0&&u%(b.hp<b.max*.5?75:105)===40)ths.push({x:P.x,y:P.y,t:0,tel:42,on:10});
if(s2cg){if(s2cg.was)s2cg.zap=0;else if(bombT<=0&&!s2cg.zap){s2cg.zap=1;P.inv=0;ths.push({x:P.x,y:P.y,t:0,tel:0,on:10})}}}}
function enemyFire(e){if(e.ek){fireS2(e);return}const d=e.d,u=e.t-11;
if(e.ty===0){if(e.fm==='m'&&e.dist<e.fa)return;
if(u%45===0)ebul(e.x,e.y,Math.atan2(P.y-e.y,P.x-e.x),2+d*.2,2)}
else if(e.fm==='r'){const w=u+e.off;
if(w>=0&&w%108===0){const o=(Math.floor(w/108)%2)*Math.PI/18;for(let i=0;i<18;i++)ebul(e.x,e.y,o+i*Math.PI/9,1.5+d*.15,2)}}
else{const k=u%130;
if(k===0)e.ba=Math.atan2(P.y-e.y,P.x-e.x);
if(k%8===0&&k<=32){const sp=2+d*.2;for(let q=-1;q<=1;q++)ebul(e.x,e.y,e.ba+q*.3,sp,2)}}}

// ===== NÂNG CẤP SAU MỖI STAGE: nòng súng phụ (g) + flying sentry (s), mỗi ô 4 cấp =====
// cấp -> danh sách đơn vị: 0 = bản nhỏ (đạn nhỏ, bắn chậm) · 1 = hoàn chỉnh (dame + tốc bắn ngang nòng chính)
// Lv1 [nhỏ] · Lv2 [đủ] · Lv3 [đủ, nhỏ] · Lv4 [đủ, đủ]
let UP={g:0,s:0},sbl=[],gcd=[0,0],scd=[0,0],sen=[{x:0,y:0,on:0},{x:0,y:0,on:0}],upgOn=0,upgCb=null,upgSel='';
const SENI=new Image();SENI.src='assets/images/sentry.png';
const UP_SMALL_D=.4,UP_SMALL_IV=2.4,UP_BV=11;
const UP_TXT={g:['+1 nòng súng nhỏ (đạn nhỏ, tốc bắn chậm)','Nòng súng 1 hoàn chỉnh: sát thương & tốc bắn ngang nòng chính','+1 nòng súng nhỏ thứ hai','Nòng súng 2 hoàn chỉnh'],s:['+1 chiến cơ phụ (đạn nhỏ, tốc bắn chậm, tự ngắm)','Chiến cơ phụ 1 hoàn chỉnh: sát thương & tốc bắn ngang nòng chính','+1 chiến cơ phụ bên cạnh bạn','Chiến cơ phụ 2 hoàn chỉnh']};
function upUnits(l){return l<1?[]:l===1?[0]:l===2?[1]:l===3?[1,0]:[1,1]}
function upReset(){UP.g=UP.s=0;sbl=[];gcd=[0,0];scd=[0,0];sen[0].on=sen[1].on=0}
function subBase(){return{d:(K.slow?9:6)*pmul()*(CH===2?JIN_DMG:1),iv:ivl()*(K.slow?1.5:1)*(CH===2?JIN_IV*(P.soul>=30?.5:1):1)}}
function subShoot(x,y,tier,vx,vy,base){sbl.push({x,y,vx,vy,f:tier,d:tier?base.d:base.d*UP_SMALL_D})}
function subTarget(x,y){let best=null,bd=1e9;for(const e of en){if(e.hp<=0||e.gone||e.y>=y-4||e.y<-6)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;best=e}}
if(bs&&bs.on&&!bs.inv&&!bs.lv&&bs.hp>0&&bs.y<y-4){const d=Math.hypot(bs.x-x,bs.y-y);if(d<bd){bd=d;best=bs}}return best}
function subUpd(){if(!P)return;const gu=upUnits(UP.g),su=upUnits(UP.s);
if(!gu.length&&!su.length&&!sbl.length)return;
const base=subBase(),slow=(wet&&t%20<11)||(icy&&(t&1)),can=K.shoot&&(CH===1||rl<=0);
for(let i=0;i<2;i++){
 if(i<gu.length){if(gcd[i]>0&&!slow)gcd[i]--;
  if(can&&gcd[i]<=0){gcd[i]=base.iv*(gu[i]?1:UP_SMALL_IV);subShoot(P.x+(i?11:-11),P.y-12,gu[i],0,-UP_BV,base)}}
 const s=sen[i];
 if(i<su.length){const tx=Math.max(10,Math.min(W-10,P.x+(i?1:-1)*(K.slow?22:38))),ty=Math.min(H-12,P.y+8);
  if(!s.on){s.on=1;s.x=P.x;s.y=P.y+10}s.x+=(tx-s.x)*.18;s.y+=(ty-s.y)*.18;
  if(scd[i]>0&&!slow)scd[i]--;
  if(can&&scd[i]<=0){scd[i]=base.iv*(su[i]?1:UP_SMALL_IV);
   const tg=subTarget(s.x,s.y);let vx=0,vy=-UP_BV;
   if(tg){const a=Math.max(-.65,Math.min(.65,Math.atan2(tg.x-s.x,s.y-tg.y)));vx=Math.sin(a)*UP_BV;vy=-Math.cos(a)*UP_BV}
   subShoot(s.x,s.y-12,su[i],vx,vy,base)}}
 else s.on=0}
for(const b of sbl){b.x+=b.vx;b.y+=b.vy;
 for(const e of en){if(e.hp<=0||e.gone)continue;const r=e.ty?18:14;
  if(Math.abs(b.x-e.x)<r&&Math.abs(b.y-e.y)<r){e.hp-=b.d;score+=10;b.dead=1;for(let k=0;k<2;k++)fx.push({x:b.x,y:b.y,vx:(Math.random()-.5)*3,vy:Math.random()*2,l:10,c:CH===2?'#8ffff0':'#ffb'});break}}
 if(!b.dead&&bs&&bs.on&&!bs.inv&&!bs.lv&&bs.hp>0&&Math.abs(b.x-bs.x)<22&&Math.abs(b.y-bs.y)<26){bs.hp-=b.d;score+=10;b.dead=1}
 if(!b.dead&&!PV.on)for(const r of rk){if(r.f||r.dead)continue;if(Math.hypot(b.x-r.x,b.y-r.y)<r.r+4){shatter(r);b.dead=1;break}}}
sbl=sbl.filter(b=>!b.dead&&b.y>-12&&b.x>-12&&b.x<W+12)}
function drawUp(){if(!P||state!=='play')return;
ctx.save();ctx.lineCap='round';
for(const b of sbl){const L=b.f?12:7;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx/UP_BV*L,b.y-b.vy/UP_BV*L);
 ctx.strokeStyle=CH===2?'#2fe6d088':'#ffa83088';ctx.lineWidth=b.f?5:3.4;ctx.stroke();ctx.strokeStyle=CH===2?'#d8fffb':'#fff6c8';ctx.lineWidth=b.f?2:1.3;ctx.stroke()}
const gu=upUnits(UP.g),su=upUnits(UP.s);
for(let i=0;i<gu.length;i++){const x=P.x+(i?11:-11),y=P.y-4,w=gu[i]?5:3,h=gu[i]?15:10;
 ctx.fillStyle='#7d828c';ctx.fillRect(x-w/2,y-h,w,h);ctx.fillStyle=gu[i]?'#ffd24d':'#c9ccd3';ctx.fillRect(x-w/2,y-h,w,2.5)}
for(let i=0;i<su.length;i++){const s=sen[i];if(!s.on)continue;const bob=Math.sin(t/12+i*2)*2,h=su[i]?26:20,w=h*54/120;
 if(SENI.complete&&SENI.naturalWidth)ctx.drawImage(SENI,s.x-w/2,s.y+bob-h/2,w,h);
 else{ctx.fillStyle='#f33';ctx.beginPath();ctx.moveTo(s.x,s.y-h/2);ctx.lineTo(s.x+w/2,s.y+h/2);ctx.lineTo(s.x-w/2,s.y+h/2);ctx.fill()}}
ctx.restore()}
// --- màn chọn nâng cấp ---
function upgRender(){const E=id=>document.getElementById(id);
for(const k of['g','s']){const c=E(k==='g'?'upG':'upS'),l=UP[k],mx=l>=4;
 c.classList.toggle('max',mx);c.classList.toggle('sel',upgSel===k);
 c.querySelector('.pips').innerHTML=[0,1,2,3].map(i=>'<i class="'+(i<l?'on':i===l&&upgSel===k?'nx':'')+'"></i>').join('');
 c.querySelector('.lv').textContent=mx?'MAX':'Lv '+l+(upgSel===k?' › '+(l+1):'')}
const d=E('upDesc');d.textContent=upgSel?'Lv '+(UP[upgSel]+1)+': '+UP_TXT[upgSel][UP[upgSel]]:'Chọn 1 nâng cấp';
E('upOk').disabled=!upgSel}
function upgOpen(cb){upgCb=cb;upgSel='';upgOn=1;paused=true;K.shoot=K.slow=0;kb.l=kb.r=kb.u=kb.d=0;
document.getElementById('upChar').src=['assets/images/char_hachi_idle.png','assets/images/char_sanyo_idle.png','assets/images/char_jin_idle.png'][CH]||'';
document.getElementById('upStg').textContent='STAGE '+stg+' CLEAR';
upgRender();document.getElementById('upg').style.display='flex'}
function upgPick(k){if(UP[k]>=4)return;upgSel=upgSel===k?'':k;upgRender()}
function upgOk(){if(!upgSel)return;UP[upgSel]++;const cb=upgCb;upgCb=null;upgOn=0;paused=false;document.getElementById('upg').style.display='none';if(cb)cb()}
document.getElementById('upG').addEventListener('click',()=>upgPick('g'));
document.getElementById('upS').addEventListener('click',()=>upgPick('s'));
document.getElementById('upOk').addEventListener('click',upgOk);
function bomb(){if(PV.on&&PV.ph!=='fight'){bombQ=0;return}if(bombT>0)return;if(CH===2){if(PV.on){if(P.bb<JB_COST)return;P.bb-=JB_COST}else{if(P.soul<13)return;P.soul-=13}}else{if(P.mana<15)return;P.mana-=15}if(bs)bs.clean=0;dying=0;bombT=110;P.inv=Math.max(P.inv,150)}
function die(){if(PV.on){pvEnd(0);return}if(P.mana<20){if(contLeft>0)showCont();else over();return}P.mana-=20;lvP=Math.max(0,lvP-PW_LOSS);lvS=Math.max(0,lvS-PW_LOSS);if(bs)bs.clean=0;P.inv=150;eb=[];fbs=[];rk=[];P.x=W/2;P.y=H-50}
function hit(){if(P.inv>0||bombT>0||dying>0)return;if(CH===2?(PV.on?P.bb<JB_COST:P.soul<13):P.mana<15){die();return}dying=DB_FRAMES}
const AX_MAX=6,AX_R=330,AX_LIFE=300,AX_DMG=7,AX_BOSS=.7,AX_CD=29,AX_V=7.5,AX_RESET=180;
const AXI=new Image();AXI.src='assets/images/axi.png';
const AXH=28,AXW=AXH*.4832,AXFX=.4875;
function axReset(){axs=[];axH=1;axT=0;axTg=0;axLast=0}
function axTargets(){const L=[];for(const e of en)if(e.hp>0&&e.y<P.y-8&&e.y>-8&&e.x>-8&&e.x<W+8)L.push(e);
if(bs&&bs.on&&!bs.inv&&!bs.lv&&bs.hp>0&&bs.y<P.y)L.push(bs);
L.sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));return L}
function axThrow(){const a=-Math.PI/2;
axs.push({x:P.x,y:P.y-10,a,ph:0,d:0,age:0,hit:0,rs:3,rot:Math.random()*6,tg:null,hs:new Set(),drop:0});axH--;sfx.swing()}
function axHit(a,o,d){o.hp-=d;a.hs.add(o);score+=10;
for(let k=0;k<5;k++)fx.push({x:a.x,y:a.y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,l:12,c:'#cf6'});
axLast=t;if(!a.hit){a.hit=1;if(!a.drop&&axH+axs.length<AX_MAX)axH++}}
function axUpd(){const sm=1+lvS/100*.9,dm=AX_DMG*pmul();
if(axT>0)axT--;
if(axH+axs.length>1&&t-axLast>AX_RESET){
let keep=0;for(const a of axs){if(keep<1)keep++;else{a.drop=1;if(a.ph===0){a.ph=1;a.hs.clear()}}}
axH=keep?0:1;axLast=t}
if(K.shoot&&axH>0&&axT<=0){axThrow();axT=AX_CD}
for(const a of axs){a.age++;a.rot+=.5;
if(a.ph===0){const v=(AX_V-4.2*Math.min(1,a.d/AX_R))*sm;
a.x+=Math.cos(a.a)*v;a.y+=Math.sin(a.a)*v;a.d+=v;
if(a.d>=AX_R||a.x<-20||a.x>W+20||a.y<-20){a.ph=1;a.hs.clear()}}
else{a.rs=Math.min(11,a.rs+.5);const v=a.rs*sm,dx=P.x-a.x,dy=P.y-a.y,dd=Math.hypot(dx,dy);
if(dd<=v+10){a.done=1;if(!a.drop)axH++}else{a.x+=dx/dd*v;a.y+=dy/dd*v}}
if(!a.done){
if(!PV.on)for(const r of rk.slice()){if(r.f||r.dead)continue;const dx=a.x-r.x,dy=a.y-r.y,rr=r.r+12;if(dx*dx+dy*dy<rr*rr)shatter(r)}
for(const e of en){if(e.hp<=0||a.hs.has(e))continue;const dx=a.x-e.x,dy=a.y-e.y,r=e.ty?27:23;if(dx*dx+dy*dy<r*r)axHit(a,e,dm)}
if(bs&&bs.on&&!bs.inv&&!bs.lv&&bs.hp>0&&!a.hs.has(bs)){const dx=a.x-bs.x,dy=a.y-bs.y;if(dx*dx+dy*dy<1296)axHit(a,bs,dm*AX_BOSS)}
if(!a.hit&&a.age>=AX_LIFE){a.done=1;if(!a.drop)axH++;for(let k=0;k<6;k++)fx.push({x:a.x,y:a.y,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,l:14,c:'#9f6'})}}
}
axs=axs.filter(a=>!a.done)}
function drawAxeH(x,y,sc){const hh=AXH*sc,ww=AXW*sc;ctx.drawImage(AXI,x-AXFX*ww,y-.8*hh,ww,hh)}
function drawAxe(x,y,rot,sc,glow){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(sc,sc);ctx.drawImage(AXI,-AXW/2,-AXH*.42,AXW,AXH);ctx.restore()}
const AXHUD=new Image();AXHUD.src='assets/images/axhud.jpg';
function axPips(){
const tot=axH+axs.length,sz=24,x=8,y=H-sz-12;
if(AXHUD.complete&&AXHUD.naturalWidth)ctx.drawImage(AXHUD,x,y,sz,sz);
ctx.textAlign='left';ctx.textBaseline='middle';ctx.font='bold 20px sans-serif';
const tx=x+sz+5,ty=y+sz/2+1;
ctx.fillStyle=tot>1?'#e63323':'#222';ctx.fillText('x'+tot,tx,ty);ctx.textBaseline='alphabetic';
const f=tot>1?Math.max(0,1-(t-axLast)/AX_RESET):0;
ctx.fillStyle='#00000030';ctx.fillRect(x,y+sz+2,sz,3);
if(f>0){ctx.fillStyle=f<.33?'#e63323':'#7dff1a';ctx.fillRect(x,y+sz+2,sz*f,3)}}
const PV={on:0,fin:0,msg:'',qB:[],qP:[],sch:[],cdP:{},cdB:{},loP:[],loB:[]};
const MP={rn:'Đối thủ',rtt:-1,jit:0,rate:0,nS:0,on:0,host:0,peer:null,conn:null,open:0,code:'',ready:0,rready:0,rch:0,rq:0,lastRx:0,grp:[],f:0},EK=['fire','earth','water','thunder'],RKP=[1,.9,1.05,.85,1,.95,1.1,.9];
const PV_ITEMS=[{k:'flash',n:'Flash',cd:2100,g:'h',m:1},{k:'smoke',n:'Smoke',cd:1860,g:'h'},{k:'molly',n:'Molly',cd:2100,g:'d',m:1},{k:'nade',n:'Nade',cd:1770,g:'d'},{k:'ice',n:'Băng',cd:2040,g:'h',m:1},{k:'thunder',n:'Sét',cd:2700,g:'d',m:1}]; // cd sau khi ném: flash 35s, smoke 31s, molly 35s, nade 29.5s, bom băng 34s, bom sét 45s · g: d = sát thương (nade/molly/sét), h = quấy rối (băng/flash/smoke) · m = chủ lực
const PV_DMG=['molly','thunder'],PV_HAR=['flash','ice']; // chủ lực sát thương / quấy rối
// TÚI ĐỒ PVP: đúng 4 món = 2 sát thương + 2 quấy rối, tối đa 2 chủ lực => luôn có Nade + Smoke, cộng 1 chủ lực sát thương (Molly|Sét) và 1 chủ lực quấy rối (Flash|Băng)
let PV_LO=(()=>{try{const o=JSON.parse(localStorage.getItem('dk_lo')||'{}');return{d:PV_DMG.includes(o.d)?o.d:'molly',h:PV_HAR.includes(o.h)?o.h:'flash'}}catch(e){return{d:'molly',h:'flash'}}})();
const pvLoList=lo=>[lo.h,lo.d,'nade','smoke']; // thứ tự ô: 1 chủ lực quấy rối · 2 chủ lực sát thương · 3 Nade · 4 Smoke
const pvLoOk=l=>{if(!Array.isArray(l)||l.length!==4||new Set(l).size!==4)return false;const it=l.map(k=>PV_ITEMS.find(x=>x.k===k));if(it.some(x=>!x))return false;return it.filter(x=>x.g==='d').length===2&&it.filter(x=>x.g==='h').length===2&&it.filter(x=>x.m).length<=2};
const pvRandLo=()=>pvLoList({h:PV_HAR[Math.random()*2|0],d:PV_DMG[Math.random()*2|0]});
const pvDirs=l=>[['up',l[0],'↑'],['right',l[1],'→'],['down',l[2],'↓'],['left',l[3],'←']]; // bánh xe 4 ô (mỗi ô 90°)
let PV_DIRS=pvDirs(pvLoList(PV_LO));
const AC_Y=120;
let rlM=60;
const JB_MAX=3,JB_COST=1,JB_REGEN=1/1800;
const PV_LOCK=600,RS_T=210,PV_HP=60,PV_READY=180,PV_WIN=7,PV_SD=10800,PV_SDLEN=1800; // MR7: ai chạm 7 trước thắng, không giới hạn round; sudden death sau 3p
const MO_LIFE=360,FL_STUN=132; // molly 6s, flash choáng tối đa 2.2s
const IC_W=170,IC_H=110,IC_LIFE=420,TH_LIFE=300; // bom băng: vùng chữ nhật 170×110 tồn tại 7s, làm chậm 50% · bom sét: mây đen đánh liên tục 5s
const iceX=x=>Math.max(IC_W/2,Math.min(W-IC_W/2,x)),iceY=y=>Math.max(IC_H/2+8,Math.min(H-IC_H/2-4,y));
const inIce=(z,x,y)=>Math.abs(x-z.x)<z.w/2&&Math.abs(y-z.y)<z.h/2;
const moGaps=y=>{let q=(Math.round(y)*9301+49297)%233280;const r=()=>(q=(q*9301+49297)%233280)/233280,a=44+r()*110,b=230+r()*110;return[[a-16,a+16],[b-16,b+16]]};
const moOn=(w,x)=>{const g=w.gp||(w.gp=moGaps(w.y));return!(x>=g[0][0]&&x<=g[0][1])&&!(x>=g[1][0]&&x<=g[1][1])}; // true = x đang nằm dưới lửa (ngoài khe hở)
const pvCan=(o,k)=>{const cd=o==='p'?PV.cdP:PV.cdB,lo=o==='p'?PV.loP:PV.loB;return lo.includes(k)&&cd[k]<=0};
let pvPr=[],pvSm=[],pvMo=[],pvSh=[],pvFl=[],pvIc=[],pvTs=null,pvBp=0,pvKey='',BF=null;
const PV_PATHS=()=>[P1,P2,P3a,P3b,P5,P6];
const pvZero=lo=>{const o={};for(const k of lo)o[k]=PV_ITEMS.find(x=>x.k===k).m?PV_LOCK:0;return o}; // đầu round: Nade + Smoke dùng được ngay, chủ lực (Flash/Băng, Molly/Sét) phải chờ 10s mới được dùng
const pvTh=document.getElementById('pvThrow'),pvRad=document.getElementById('pvRad'),bfC=document.getElementById('pvC'),bx=bfC.getContext('2d');
document.body.appendChild(bfC);document.body.appendChild(pvTh);document.body.appendChild(pvRad);
const NI_SRC={"smoke": "assets/images/smoke.png", "molly": "assets/images/molly.png", "nade": "assets/images/nade.png", "flash": "assets/images/flash.png", "ice": "assets/images/ice.png", "thunder": "assets/images/thunder.png"},NI={};for(const k in NI_SRC){NI[k]=new Image();NI[k].src=NI_SRC[k]} // ảnh 4 quả lựu (bánh xe + hoạt ảnh ném)
function pvIcon(c,k,x,y,sz,rot){const im=NI[k];if(!im||!im.complete||!im.naturalWidth)return false;c.save();c.translate(x,y);c.rotate(rot);c.drawImage(im,-sz/2,-sz/2,sz,sz);c.restore();return true}
function pvBuildRad(){pvRad.innerHTML=PV_DIRS.map(d=>'<div class="rd" data-d="'+d[0]+'"><img class="ic2" alt="" src="'+NI_SRC[d[1]]+'"><b></b><i></i></div>').join('')}pvBuildRad();
let thId=null,thX=0,thY=0,thSel=-1,thSw=0,thTm=0,pvSelK='nade';
function pvRadSel(i){thSel=i;pvRad.querySelectorAll('.rd').forEach((d,n)=>d.classList.toggle('sel',n===i))}
pvTh.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(thId!==null)return;thId=e.pointerId;thX=e.clientX;thY=e.clientY;try{pvTh.setPointerCapture(e.pointerId)}catch(_){}
const r=pvTh.getBoundingClientRect(),m=innerHeight*.18;pvRad.style.left=Math.max(m,Math.min(innerWidth-m,r.left+r.width/2))+'px';pvRad.style.top=Math.max(m,Math.min(innerHeight-m,r.top+r.height/2))+'px';
pvKey='';pvUI();pvRadSel(-1);thSw=0;pvTh.classList.add('hold');clearTimeout(thTm);thTm=setTimeout(()=>{if(thId!==null)pvRad.classList.add('on')},160)});
pvTh.addEventListener('pointermove',e=>{if(e.pointerId!==thId)return;const dx=e.clientX-thX,dy=e.clientY-thY;if(Math.hypot(dx,dy)<14){pvRadSel(-1);return}
thSw=1;pvRad.classList.add('on');pvRadSel(((Math.round((Math.atan2(dy,dx)*180/Math.PI+90)/90)%4)+4)%4)});
const thEnd=(e,fire)=>{if(e.pointerId!==thId)return;thId=null;clearTimeout(thTm);pvRad.classList.remove('on');pvTh.classList.remove('hold');if(fire){if(thSel>=0){pvSelK=PV_DIRS[thSel][1];pvKey=''}else if(!thSw)pvThrow('p',pvSelK)}pvRadSel(-1);pvUI()};
pvTh.addEventListener('pointerup',e=>thEnd(e,true));pvTh.addEventListener('pointercancel',e=>thEnd(e,false));
addEventListener('keydown',e=>{if(!PV.on||state!=='play'||paused||e.repeat)return;const i=['n1','n2','n3','n4'].indexOf(kact(e));if(i>=0&&PV.loP[i]){pvSelK=PV.loP[i];pvKey='';pvThrow('p',pvSelK);pvUI()}},true);
setInterval(()=>{const pl=PV.on&&state==='play';if(editing&&!pl){bx.fillStyle='#10182a';bx.fillRect(0,0,W,H);bx.fillStyle='#fff';bx.font='bold 38px sans-serif';bx.textAlign='center';bx.fillText('SÂN ĐỊCH',W/2,H/2)}pvTh.style.display=pl?'flex':'none';bfC.style.display=pl?'block':'none';try{pvUiUpd()}catch(_){}},150);
function pvUI(){const key=PV.ph+'|'+pvSelK+'|'+PV.loP.join()+'|'+PV.loP.map(k=>Math.ceil(PV.cdP[k]/60)).join();if(key===pvKey)return;pvKey=key;
pvRad.querySelectorAll('.rd').forEach((d,i)=>{const k=PV_DIRS[i][1],c=PV.cdP[k];d.classList.toggle('cd',!pvCan('p',k));d.classList.toggle('cur',k===pvSelK);d.querySelector('b').textContent=PV_DIRS[i][2]+' '+PV_ITEMS.find(x=>x.k===k).n;d.querySelector('i').textContent=c>0?Math.ceil(c/60)+'s':'SẴN SÀNG'});
const sc=PV.cdP[pvSelK],ic=pvTh.querySelector('.ic');if(ic.dataset.k!==pvSelK){ic.dataset.k=pvSelK;ic.src=NI_SRC[pvSelK]}
pvTh.querySelector('small').textContent=PV_ITEMS.find(x=>x.k===pvSelK).n+(sc>0?' '+Math.ceil(sc/60)+'s':'');pvTh.classList.toggle('cd',!pvCan('p',pvSelK));
pvTh.querySelector('.dots').innerHTML=PV.loP.map(k=>'<u class="'+(pvCan('p',k)?'r':'')+'"></u>').join('')}
function pvInit(){rpStart();Object.assign(PV,{on:1,fin:0,msg:'',rd:0,sp:0,sb:0,ph:'ready',pt:PV_READY,ft:0,fb:0,sd:0,note:'',noteT:0,sm:0,bs:0,sc0:0,botCh:Math.random()*3|0});
stg=2;s2i=SC_S2.length;s2t=-1e9;s2bn=0;lvP=lvS=50;pvKey='';pvRound()}
function pvRound(){bombQ=0;lastBomb=K.bomb;PV.rP=PV.sp|0;PV.rB=PV.sb|0;PV.rd++;PV.ph='ready';PV.pt=PV_READY;PV.ft=0;PV.sd=0;PV.qB=[];PV.qP=[];PV.sch=[];PV.gt=100;PV.loP=pvLoList(PV_LO);PV.loB=(MP.on&&pvLoOk(MP.rlo))?MP.rlo.slice():pvRandLo();PV_DIRS=pvDirs(PV.loP);pvBuildRad();PV.cdP=pvZero(PV.loP);PV.cdB=pvZero(PV.loB);pvSelK='nade';PV.bs=0;PV.sc0=score;
eb=[];en=[];pb=[];tr=[];lz=[];lf=[];fbs=[];rk=[];zn=[];ths=[];items=[];fx=[];s2reset();pvPr=[];pvSm=[];pvMo=[];pvSh=[];pvFl=[];pvIc=[];pvTs=null;icy=0;
P.x=W/2;P.y=H-50;P.inv=0;P.mana=P.mx=PV_HP;P.stun=0;P.soul=15;P.bb=JB_MAX;dying=0;bombT=0;ammo=MAG;rl=0;pvBp=0;PV.sm=0;
bfInit();pvKey='';pvUI()}
function pvEnd(win,quiet){if(PV.ph==='end')return;PV.ph='end';PV.bt=RS_T;PV.win=win;if(win)PV.sp++;else PV.sb++;if(MP.on&&!win&&!quiet)mpSend({t:'dead',rd:PV.rd});eb=[];fbs=[];rk=[];pvKey=''}
function pvNext(){if(PV.sp>=PV_WIN||PV.sb>=PV_WIN){PV.msg=(PV.sp>PV.sb?'BẠN THẮNG ':PV.sp<PV.sb?'BẠN THUA ':'HÒA ')+PV.sp+' : '+PV.sb;PV.fin=1;profRecord(MP.on||FK.on?'online':'bot',PV.sp>PV.sb?'W':PV.sp<PV.sb?'L':'D',PV.sp,PV.sb,MP.on?MP.rn:FK.on?FK.name:'BOT');over();PV.on=0;return}
pvRound()}
function pvGroup(){const r=Math.random();let k,n,pi=Math.floor(Math.random()*6),x=.12+Math.random()*.55;
if(r<.65){k=r<.35?'fire':'earth';n=3+Math.floor(Math.random()*2)}else if(r<.88){k='water';n=2}else{k='thunder';n=1;x=.15+Math.random()*.7}
if(k==='thunder'&&(en.filter(e=>e.ek==='thunder').length>=2||BF.en.filter(e=>e.k==='thunder').length>=2)){k='fire';n=3}
for(let i=0;i<n;i++){const d=k==='water'?42*i:30*i,xx=k==='water'?x+i*.15:x;PV.sch.push({t:PV.ft+d,k,pi,x:xx});if(MP.on)MP.grp.push({t:PV.ft+d,k,pi,x:xx});else BF.sch.push({t:BF.t+d,k,pi,x:xx})}if(MP.on&&MP.grp.length){mpSend({t:'grp',rd:PV.rd,l:MP.grp});MP.grp=[]}}
function pvSpawnMain(k,pi,x){const th=en.filter(e=>e.ek==='thunder').length;
if(k==='thunder'&&th>=2)k='fire';
if(k==='fire'||k==='earth')spawnS2({at:Math.random()*50,ek:k,pa:PV_PATHS()[pi==null?Math.floor(Math.random()*6):pi]});
else if(k==='water')spawnS2({at:Math.random()*50,ek:'water',x:x==null?.12+Math.random()*.76:x});
else spawnS2({at:Math.random()*50,ek:'thunder',x:x==null?.15+Math.random()*.7:x,y:.17,hold:7})}
function pvThrow(own,k){const cd=own==='p'?PV.cdP:PV.cdB;if(PV.ph!=='fight'||!pvCan(own,k))return;
if(own==='p'){if(P.stun>0)return;cd[k]=PV_ITEMS.find(x=>x.k===k).cd;{const L=PV.loP,n=L.indexOf(k),N=L.length;for(let i=1;i<N;i++){const nk=L[(n+i)%N];if(pvCan('p',nk)){pvSelK=nk;break}}} pvKey='';const b=BF.sh;BF.pr.push({k,own,x:b.x,y:b.y,t:0,T:34});if(MP.on)mpSend({t:'th',k,rd:PV.rd})}
else{if(BF.sh.stun>0)return;cd[k]=PV_ITEMS.find(x=>x.k===k).cd;const tx=Math.max(12,Math.min(W-12,P.x)),ty=Math.max(24,Math.min(H-14,P.y));pvPr.push({k,own,x:tx,y:-12,x0:tx,y0:-12,tx,ty,t:0,T:34})}}
function pvDet(q){const R=120;
if(q.k==='flash'){pvFl.push({x:q.x,y:q.y,t:0});const d=Math.hypot(P.x-q.x,P.y-q.y);if(d<R)P.stun=Math.max(P.stun||0,Math.max(14,Math.round(FL_STUN*(1-d/R))))}
else if(q.k==='smoke')pvSm.push({x:q.x,y:q.y,r:100,t:0,life:480});
else if(q.k==='molly')pvMo.push({y:Math.round(Math.max(24,Math.min(H-14,q.y))),t:0,life:MO_LIFE});
else if(q.k==='ice')pvIc.push({x:iceX(q.x),y:iceY(q.y),w:IC_W,h:IC_H,t:0,life:IC_LIFE});
else if(q.k==='thunder')pvTs={t:0,life:TH_LIFE,st:[]};
else{for(let i=0;i<22;i++){const a=i/22*6.2832;pvSh.push({x:q.x,y:q.y,vx:Math.cos(a)*2.4,vy:Math.sin(a)*2.4,l:75})}for(let i=0;i<8;i++)fx.push({x:q.x,y:q.y,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,l:20,c:'#ffd24d'})}}
function bfInit(){BF={sh:{x:W/2,y:H-50,stun:0,inv:0,mana:PV_HP,slow:0,tx:W/2,ty:H-50,bp:0,fb2:0},en:[],eb:[],sd:[],mo:[],sm:[],pu:[],ice:[],ts:null,fl:[],pr:[],fb:[],rk:[],zn:[],sch:[],t:0,ic:150,tg:null,flash:0,tr:[],ch:PV.botCh|0}}
function bfSpawn(k,x,pi){const e={k,t:0,st:0,hf:0,hp:k==='thunder'?14:k==='water'?10:k==='earth'?10:8};
if(k==='fire'||k==='earth'){const pa=PV_PATHS()[pi==null?Math.floor(Math.random()*6):pi];e.pa=pa;e.dist=0;e.x=pa.pts[0][0];e.y=pa.pts[0][1]}
else{e.x=(x==null?(k==='water'?.12+Math.random()*.76:.15+Math.random()*.7):x)*W;e.y=-24}
BF.en.push(e)}
function bfAim(e,n,sp,spd,r,col){const B=BF,a=Math.atan2(B.sh.y-e.y,B.sh.x-e.x);for(let i=0;i<n;i++){const an=a+(i-(n-1)/2)*sp;B.eb.push({x:e.x,y:e.y,vx:Math.cos(an)*spd,vy:Math.sin(an)*spd,r,col})}}
function bfHit(){const B=BF,s=B.sh;if(s.inv>0)return;
if(s.mana>=15&&Math.random()>.12){s.mana-=15;s.inv=150;B.eb=[];B.sd=[];B.fb=[];B.rk=[];B.en=[];B.zn=[];B.pu=[]}else pvEnd(1)}
function bfDet(q){const B=BF,s=B.sh;
if(q.k==='flash'){B.flash=14;const d=Math.hypot(s.x-q.x,s.y-q.y);if(d<120)s.stun=Math.max(s.stun,Math.max(14,Math.round(FL_STUN*(1-d/120))))}
else if(q.k==='smoke')B.sm.push({x:q.x,y:q.y,r:100,t:0,life:480});
else if(q.k==='molly')B.mo.push({y:Math.round(Math.max(24,Math.min(H-14,q.y))),t:0,life:MO_LIFE});
else if(q.k==='ice')B.ice.push({x:iceX(q.x),y:iceY(q.y),w:IC_W,h:IC_H,t:0,life:IC_LIFE});
else if(q.k==='thunder')B.ts={t:0,life:TH_LIFE,st:[]};
else if(q.k==='nade')for(let i=0;i<22;i++){const a=i/22*6.2832;B.sd.push({x:q.x,y:q.y,vx:Math.cos(a)*2.4,vy:Math.sin(a)*2.4,l:75})}}
function bfStep(){const B=BF,s=B.sh;B.t++;
for(const j of B.sch)if(j.t<=B.t){bfSpawn(j.k,j.x,j.pi);j.d=1}B.sch=B.sch.filter(j=>!j.d);
if(PV.qB.length&&B.t%45===0)bfSpawn(PV.qB.shift());
for(const e of B.en){e.t++;const k=e.k,u=e.t-11;
if(e.pa){e.dist+=SPD;const q=pathAt(e.pa,e.dist);if(!q){e.gone=1;continue}e.x=q[0];e.y=q[1];
if(e.y>0&&e.t>10&&e.y<H-110){
if(k==='fire'&&u>=24&&(u-24)%140===0){const tx=Math.max(24,Math.min(W-24,s.x)),ty=Math.min(H-30,s.y),a=Math.atan2(ty-e.y,tx-e.x);B.fb.push({x:e.x,y:e.y,vx:Math.cos(a)*2.7,vy:Math.sin(a)*2.7,tx,ty})}
else if(k==='earth'&&u>=20&&(u-20)%150===0){const a=Math.atan2(s.y-e.y,s.x-e.x),pp=[];for(let i=0;i<8;i++)pp.push(.78+Math.random()*.3);B.rk.push({x:e.x,y:e.y+10,vx:Math.cos(a)*1.5,vy:Math.sin(a)*1.5,r:17,a:Math.random()*6,va:(Math.random()-.5)*.05,p:pp})}}}
else if(k==='water'){if(e.st===0){e.y+=2.6;if(e.y>=54){e.y=54;e.st=1}}
else if(e.st===1){e.x+=Math.sin(e.t*.9)*.8;if(++e.hf>=26){e.tx=s.x;e.ty=Math.min(H-24,s.y);const a=Math.atan2(e.ty-e.y,e.tx-e.x);e.vx=Math.cos(a)*6;e.vy=Math.sin(a)*6;e.st=2}}
else{e.x+=e.vx;e.y+=e.vy;if(Math.hypot(e.tx-e.x,e.ty-e.y)<=6||e.y>H+20||e.x<-30||e.x>W+30){if(e.y<=H){const w=B.pu;if(w.length>=14)w.shift();w.push({x:e.tx,y:e.ty,r:34,t:0,life:420})}e.gone=1}}}
else{if(e.st===0){e.y+=3.2;if(e.y>=76){e.y=76;e.st=1}}else if(e.st===1){e.hf++;if(e.hf%110===20)bfAim(e,1,0,3.2,3.5,'#ffe14d');if(e.hf>=420)e.st=2}else{e.y-=3.4;if(e.y<-45)e.gone=1}}
if(e.y>H+30)e.gone=1}
const sm=B.sm.some(m=>m.t>10&&Math.hypot(s.x-m.x,s.y-m.y)<m.r*.85);
let tg=null;if(!sm)for(const e of B.en)if(!e.gone&&e.hp>0&&e.y<s.y-20&&e.y>-8&&(!tg||e.y>tg.y))tg=e;B.tg=tg;
if(s.stun>0)s.stun--;if(s.inv>0)s.inv--;
const slow=B.pu.some(p=>Math.hypot(s.x-p.x,s.y-p.y)<p.r)||B.ice.some(z=>inIce(z,s.x,s.y));s.slow=slow;
if(B.t%3===0&&s.stun<=0&&!sm){let tX=s.x,tY=s.y,bc=1e9;
for(let dy=-30;dy<=30;dy+=30)for(let dx=-72;dx<=72;dx+=12){const x=Math.max(14,Math.min(W-14,s.x+dx)),y=Math.max(H-140,Math.min(H-24,s.y+dy));
let c=Math.abs(dx)*.05+Math.abs(dy)*.04+Math.abs(x-W/2)*.004+Math.abs(y-(H-50))*.02;if(tg)c+=Math.abs(x-tg.x)*.06;
for(const b of B.eb)for(let f=6;f<=36;f+=6)if(Math.hypot(b.x+b.vx*f-x,b.y+b.vy*f-y)<b.r+16)c+=(60/f)*(b.r>6?2:1);
for(const f of B.fb)for(let g=6;g<=36;g+=6)if(Math.hypot(f.x+f.vx*g-x,f.y+f.vy*g-y)<26)c+=60/g;
for(const r of B.rk)for(let g=6;g<=36;g+=6)if(Math.hypot(r.x+r.vx*g-x,r.y+r.vy*g-y)<r.r+16)c+=120/g;
for(const z of B.zn)if(Math.hypot(x-z.x,y-z.y)<z.r+6)c+=25;
for(const m of B.mo){const ug=moOn(m,x);if(ug&&Math.abs(y-m.y)<14)c+=60;if((s.y-m.y)*(y-m.y)<0&&(ug||moOn(m,s.x)))c+=90}
if(B.ts)for(const k of B.ts.st)if(k.t<k.T+2&&Math.hypot(x-k.x,y-k.y)<36)c+=150;
for(const q of B.pr){if(q.k==='molly'){if(Math.abs(y-q.y)<24)c+=14}else if(q.k!=='smoke'&&Math.hypot(x-q.x,y-q.y)<45)c+=14}
for(const e of B.en)if(e.k==='water'&&e.st===2&&Math.hypot(x-e.tx,y-e.ty)<30)c+=8;
if(c<bc){bc=c;tX=x;tY=y}}s.tx=tX;s.ty=tY}
if(s.stun<=0){const sp2=slow?1.45:3.2;{const dx0=Math.max(-sp2,Math.min(sp2,s.tx-s.x));s.x+=dx0;s.ln=(s.ln||0)+(Math.sign(Math.round(dx0*10)/10)-(s.ln||0))*.34}s.y+=Math.max(-sp2,Math.min(sp2,s.ty-s.y));
if(tg&&Math.abs(s.x-tg.x)<12&&B.t%7===0&&!(slow&&B.t%20<11)){tg.hp-=4}}
for(const q of B.tr)q.a++;B.tr=B.tr.filter(q=>(q.a+1)*110-36<q.D);if(tg&&s.stun<=0&&B.t%5===0&&PV.ph==='fight'){const al=Math.abs(s.x-tg.x)<12,ox=s.x,oy=s.y-10,ex=al?tg.x:s.x,ey=al?tg.y+14:-10;B.tr.push({x0:ox,y0:oy,x1:ex,y1:ey,a:0,D:Math.max(1,Math.hypot(ex-ox,ey-oy))})}
for(const e of B.en)if(e.hp<=0&&!e.gone){e.gone=1;PV.bs+=200;if(PV.qP.length<14)PV.qP.push(e.k)}
B.en=B.en.filter(e=>!e.gone);
if(s.inv<=0)for(const e of B.en){if(Math.hypot(s.x-e.x,s.y-e.y)<(e.k==='thunder'?18:14)+3){bfHit();break}}
for(const b of B.eb){b.x+=b.vx;b.y+=b.vy;const bd=Math.hypot(b.x-s.x,b.y-s.y);if(bd<b.r+2.5&&s.inv<=0){b.dead=1;bfHit()}else if(!b.gz&&PV.ph==='fight'&&bd<b.r+16.5){b.gz=1}}
B.eb=B.eb.filter(b=>!b.dead&&b.x>-12&&b.x<W+12&&b.y>-12&&b.y<H+12);
for(const f of B.fb){f.x+=f.vx;f.y+=f.vy;const ph=Math.hypot(s.x-f.x,s.y-f.y)<10,ar=Math.hypot(f.tx-f.x,f.ty-f.y)<=3;if(ph)bfHit();if(ph||ar){f.done=1;B.zn.push({x:f.x,y:f.y,r:30,t:0,life:360})}else if(f.x<-12||f.x>W+12||f.y>H+12)f.done=1}
B.fb=B.fb.filter(f=>!f.done);
let inF=0;for(const z of B.zn){z.t++;if(z.t>20&&Math.hypot(s.x-z.x,s.y-z.y)<z.r-3)inF=1}B.zn=B.zn.filter(z=>z.t<z.life);
if(inF&&s.inv<=0){if(++s.fb2>=36){s.fb2=0;bfHit()}}else s.fb2=Math.max(0,s.fb2-2);
for(const r of B.rk){r.x+=r.vx;r.y+=r.vy;r.a+=r.va;if(Math.hypot(s.x-r.x,s.y-r.y)<r.r+3)bfHit()}
B.rk=B.rk.filter(r=>r.x>-40&&r.x<W+40&&r.y>-40&&r.y<H+40);
for(const q of B.pr){q.t++;if(q.t>=q.T){q.done=1;bfDet(q)}}B.pr=B.pr.filter(q=>!q.done);
for(const m of B.sm)m.t++;B.sm=B.sm.filter(m=>m.t<m.life);
for(const p of B.pu)p.t++;B.pu=B.pu.filter(p=>p.t<p.life);
for(const z of B.ice)z.t++;B.ice=B.ice.filter(z=>z.t<z.life);
if(B.ts){const ts=B.ts;ts.t++;if(ts.t>=40&&ts.t<ts.life-20&&(ts.t-40)%40===0)ts.st.push({x:Math.max(14,Math.min(W-14,s.x+(Math.random()-.5)*16)),y:Math.max(24,Math.min(H-14,s.y+(Math.random()-.5)*16)),t:0,T:26});for(const k of ts.st){k.t++;if(k.t===k.T&&s.inv<=0&&Math.hypot(s.x-k.x,s.y-k.y)<24)bfHit()}ts.st=ts.st.filter(k=>k.t<k.T+14);if(ts.t>=ts.life&&!ts.st.length)B.ts=null}
let on=0;for(const m of B.mo){m.t++;if(Math.abs(s.y-m.y)<10&&moOn(m,s.x))on=1}B.mo=B.mo.filter(m=>m.t<m.life);
if(on&&s.inv<=0){s.bp+=10;if(s.bp>=30){s.bp=0;bfHit()}}else s.bp=Math.max(0,s.bp-2);
for(const d of B.sd){d.x+=d.vx;d.y+=d.vy;d.l--;if(Math.hypot(d.x-s.x,d.y-s.y)<9&&s.inv<=0){d.l=0;bfHit()}}B.sd=B.sd.filter(d=>d.l>0);
if(B.flash>0)B.flash--;
if(--B.ic<=0){B.ic=90+Math.random()*90;const ready=PV_ITEMS.filter(it=>pvCan('b',it.k)).map(it=>it.k);if(ready.length&&s.stun<=0)pvThrow('b',ready[Math.floor(Math.random()*ready.length)])}}
function pvSmoke(c,m){const f=Math.min(1,m.t/15,(m.life-m.t)/40),g=c.createRadialGradient(m.x,m.y,m.r*.15,m.x,m.y,m.r);g.addColorStop(0,'rgba(176,176,182,'+f+')');g.addColorStop(.82,'rgba(170,170,176,'+.99*f+')');g.addColorStop(1,'rgba(165,165,170,0)');c.fillStyle=g;c.beginPath();c.arc(m.x,m.y,m.r,0,7);c.fill()}
function pvRing(c,k,cx,cy,f){if(k==='molly'){c.moveTo(0,cy);c.lineTo(W,cy)}else if(k==='ice'){c.rect(iceX(cx)-IC_W/2,iceY(cy)-IC_H/2,IC_W,IC_H)}else c.arc(cx,cy,(k==='smoke'?100:40)*(1-f)+8,0,7)}
function pvIceDraw(c,z){const f=Math.min(1,z.t/15,(z.life-z.t)/30);if(f<=0)return;const x=z.x-z.w/2,y=z.y-z.h/2;c.save();c.globalAlpha=f;c.fillStyle='rgba(140,225,255,.36)';c.fillRect(x,y,z.w,z.h);c.beginPath();c.rect(x,y,z.w,z.h);c.clip();c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1.2;c.beginPath();for(let i=-z.h;i<z.w;i+=24){c.moveTo(x+i,y+z.h);c.lineTo(x+i+z.h,y)}c.stroke();c.restore();c.save();c.globalAlpha=f;c.strokeStyle='#6ff3ff';c.lineWidth=3;c.strokeRect(x+1.5,y+1.5,z.w-3,z.h-3);c.restore()}
function pvStormDraw(c,s){if(!s)return;const f=Math.min(1,s.t/20,(s.life+24-s.t)/30);if(f<=0)return;c.save();c.globalAlpha=f;
for(let i=0;i<4;i++){const cx=W*(.14+.24*i)+Math.sin(s.t*.03+i*1.7)*10,cy=22+Math.sin(s.t*.05+i)*3;c.fillStyle=i%2?'#2a2e3a':'#353a48';for(const q of[[-26,4,20],[0,-5,26],[26,4,20],[-11,11,18],[14,11,18]]){c.beginPath();c.arc(cx+q[0],cy+q[1],q[2],0,7);c.fill()}}
for(const k of s.st){if(k.t<k.T){const p=k.t/k.T;c.globalAlpha=f*(.35+.5*p);c.strokeStyle='#ffe14d';c.lineWidth=2.5;c.beginPath();c.arc(k.x,k.y,24,0,7);c.stroke();c.fillStyle='rgba(255,225,77,'+(.12+.2*p)+')';c.beginPath();c.arc(k.x,k.y,24*p,0,7);c.fill()}
else{const a=1-(k.t-k.T)/14;c.globalAlpha=Math.max(0,a);c.strokeStyle='#fff';c.lineWidth=5;c.beginPath();c.moveTo(k.x,36);for(let y=36,i=0;y<k.y;y+=26,i++)c.lineTo(k.x+((i*37+Math.round(k.x))%17-8)*(1-y/k.y*.6),Math.min(k.y,y+26));c.lineTo(k.x,k.y);c.stroke();c.strokeStyle='#ffe14d';c.lineWidth=2;c.stroke();c.fillStyle='rgba(255,240,140,'+.5*a+')';c.beginPath();c.arc(k.x,k.y,26,0,7);c.fill()}}
c.restore()}
function pvWall(c,w,tt){const f=Math.min(1,w.t/15,(w.life-w.t)/30);c.save();c.globalAlpha=f*.9;const g=c.createLinearGradient(0,w.y-12,0,w.y+12);g.addColorStop(0,'rgba(160,24,0,0)');g.addColorStop(.5,'rgba(255,122,26,.92)');g.addColorStop(1,'rgba(160,24,0,0)');c.fillStyle=g;{const gp=w.gp||(w.gp=moGaps(w.y));for(const q of[[0,gp[0][0]],[gp[0][1],gp[1][0]],[gp[1][1],W]])c.fillRect(q[0],w.y-12,q[1]-q[0],24)}
for(let x=6;x<W;x+=14){if(!moOn(w,x))continue;c.fillStyle='#ffd040';c.beginPath();c.ellipse(x,w.y+Math.sin(tt/3+x*.3)*3,5,3.5,0,0,7);c.fill()}c.restore()}
function bfDraw(){if(!BF)return;const B=BF,s=B.sh,c=bx;c.clearRect(0,0,W,H);
if(BG2.complete&&BG2.naturalWidth){const o=Math.floor(B.t*BG_SPEED)%H;c.drawImage(BG2,0,o-H,W,H);c.drawImage(BG2,0,o,W,H)}else{c.fillStyle='#111';c.fillRect(0,0,W,H)}
c.fillStyle='rgba(0,0,0,.12)';c.fillRect(0,0,W,H);
for(const z of B.zn){const f=Math.min(1,z.t/20,(z.life-z.t)/40);c.globalAlpha=f*.6;const g=c.createRadialGradient(z.x,z.y,2,z.x,z.y,z.r);g.addColorStop(0,'#ffd040');g.addColorStop(.6,'#ff5a14');g.addColorStop(1,'#a01800');c.fillStyle=g;c.beginPath();c.arc(z.x,z.y,z.r,0,7);c.fill();c.globalAlpha=1}
for(const p of B.pu){const f=Math.min(1,p.t/20,(p.life-p.t)/40);c.globalAlpha=f*.55;c.fillStyle='#2a7bff';c.beginPath();c.ellipse(p.x,p.y,p.r,p.r*.8,0,0,7);c.fill();c.globalAlpha=1}
for(const z of B.ice)pvIceDraw(c,z);
for(const w of B.mo)pvWall(c,w,B.t);
for(const e of B.en){const im=ES2[e.k];if(im&&im.complete)c.drawImage(im,e.x-18,e.y-18,36,36)}
for(const r of B.rk){c.save();c.translate(r.x,r.y);c.rotate(r.a);c.beginPath();r.p.forEach((q,i)=>{const an=i/r.p.length*6.2832;c.lineTo(Math.cos(an)*r.r*q,Math.sin(an)*r.r*q)});c.closePath();c.fillStyle='#6b4a3a';c.fill();c.strokeStyle='#2a1a12';c.lineWidth=2.5;c.stroke();c.restore()}
for(const f of B.fb){c.fillStyle='#ff5a14';c.beginPath();c.arc(f.x,f.y,7,0,7);c.fill();c.fillStyle='#ffd040';c.beginPath();c.arc(f.x,f.y,3.8,0,7);c.fill()}
for(const b of B.eb){c.fillStyle=b.col;c.beginPath();c.arc(b.x,b.y,b.r,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(b.x,b.y,b.r*.5,0,7);c.fill()}
for(const d of B.sd){c.fillStyle='#8dff6a';c.beginPath();c.moveTo(d.x,d.y-4);c.lineTo(d.x+3,d.y);c.lineTo(d.x,d.y+4);c.lineTo(d.x-3,d.y);c.fill()}
for(const q of B.pr){const f=q.t/q.T;c.strokeStyle='#fff';c.lineWidth=2;c.globalAlpha=.6;c.beginPath();pvRing(c,q.k,q.x,q.y,f);c.stroke();c.globalAlpha=1;if(!pvIcon(c,q.k,q.x,q.y-60*(1-f),26,q.t*.3)){c.fillStyle={flash:'#fff',smoke:'#aaa',molly:'#ff8a2a',nade:'#5aa84a',ice:'#6ff3ff',thunder:'#ffe14d'}[q.k];c.beginPath();c.arc(q.x,q.y-60*(1-f),5,0,7);c.fill()}}
{const jn=(MP.on?MP.rch:B.ch)===2;c.save();c.lineCap='round';for(const q of B.tr||[]){const dx=(q.x1-q.x0)/q.D,dy=(q.y1-q.y0)/q.D,hd=Math.min(q.D,(q.a+1)*110),td=Math.max(0,Math.min(q.D,(q.a+1)*110-36));c.beginPath();c.moveTo(q.x0+dx*td,q.y0+dy*td);c.lineTo(q.x0+dx*hd,q.y0+dy*hd);c.strokeStyle=jn?'#2fe6d066':'#ffa83066';c.lineWidth=4;c.stroke();c.strokeStyle=jn?'#d8fffb':'#fff6c8';c.lineWidth=1.6;c.stroke()}c.restore()}
if(B.pb){c.fillStyle='#d6ecff';for(let i=0;i<B.pb.length;i+=2)c.fillRect(B.pb[i]-1,B.pb[i+1]-5,2,8)}
if(s.bp>0){c.fillStyle='#ff300045';c.beginPath();c.arc(s.x,s.y,12+s.bp/3,0,7);c.fill()}
if(s.fb2>0){c.fillStyle='#ff300045';c.beginPath();c.arc(s.x,s.y,12+s.fb2/5,0,7);c.fill()}
if(!(s.inv>0&&(B.t>>2)%2))drawChar(c,MP.on?MP.rch:B.ch,s.x,s.y,s.stun>0?0:s.ln>.5?1:s.ln<-.5?2:0,0)
if(HBR.complete&&HBR.naturalWidth){const hh=HB_H,ww=hh*0.45333,hx=s.x-0.4941*ww,hy=s.y-0.4248*hh;c.save();c.globalAlpha=HB_A;c.drawImage(HBK,hx,hy,ww,hh);c.restore();c.drawImage(HBR,hx,hy,ww,hh)}
if(s.inv>100){c.strokeStyle='#ffe14d';c.lineWidth=4;c.beginPath();c.arc(s.x,s.y,(150-s.inv)*4,0,7);c.stroke()}
if(s.stun>0){c.fillStyle='#ffe14d';c.font='bold 16px sans-serif';c.textAlign='center';c.fillText('✦ ✦',s.x,s.y-30)}
pvStormDraw(c,B.ts);
for(const m of B.sm)pvSmoke(c,m);
if(B.flash>0){c.globalAlpha=B.flash/14;c.fillStyle='#fff';c.fillRect(0,0,W,H);c.globalAlpha=1}
}
function step(){if(!PV.on)return stepBase();
if(PV.ph==='end'){bombQ=0;lastBomb=K.bomb;t++;for(const f of fx){f.x+=f.vx;f.y+=f.vy;f.l--}fx=fx.filter(f=>f.l>0);if(PV.noteT>0)PV.noteT--;if(--PV.bt<=0)pvNext();return}
const ks=K.shoot,sd=dp.x,sy=dp.y,sk=[kb.l,kb.r,kb.u,kb.d];
if(PV.ph!=='fight'||P.stun>0)K.shoot=0;
if(P.stun>0){dp.x=dp.y=0;kb.l=kb.r=kb.u=kb.d=0}
stepBase();
K.shoot=ks;dp.x=sd;dp.y=sy;[kb.l,kb.r,kb.u,kb.d]=sk;
pvTick()}
function pvTick(){if(!PV.on)return;if(P.stun>0)P.stun--;if(PV.noteT>0)PV.noteT--;if(MP.on&&++MP.f%3===0)mpSnap();
if(PV.ph==='ready'){if(--PV.pt<=0){PV.ph='fight';PV.ft=0;PV.fb=60}pvUI();return}
PV.ft++;if(PV.fb>0)PV.fb--;
for(const k in PV.cdP){if(PV.cdP[k]>0)PV.cdP[k]--;if(PV.cdB[k]>0)PV.cdB[k]--}
if(PV.ft===PV_SD){PV.sd=1;PV.note='SUDDEN DEATH! KHÔNG CÒN BOMB';PV.noteT=180;P.mana=0;P.bb=0;BF.sh.mana=0}
if((!MP.on||MP.host)&&--PV.gt<=0){PV.gt=(PV.sd?.5:1)*Math.max(110,190-PV.rd*6)+Math.random()*30;pvGroup()}
for(const j of PV.sch)if(j.t<=PV.ft){pvSpawnMain(j.k,j.pi,j.x);j.d=1}PV.sch=PV.sch.filter(j=>!j.d);
if(PV.qP.length&&PV.ft%45===0)pvSpawnMain(PV.qP.shift());
for(const q of pvPr){q.t++;const f=q.t/q.T;q.x=q.x0+(q.tx-q.x0)*f;q.y=q.y0+(q.ty-q.y0)*f;if(q.t>=q.T){q.done=1;q.y=q.ty;pvDet(q)}}pvPr=pvPr.filter(q=>!q.done);
for(const s of pvSm)s.t++;pvSm=pvSm.filter(s=>s.t<s.life);PV.sm=pvSm.some(s=>s.t>10&&Math.hypot(P.x-s.x,P.y-s.y)<s.r*.85);
for(const f of pvFl)f.t++;pvFl=pvFl.filter(f=>f.t<22);
let onP=0;for(const w of pvMo){w.t++;if(Math.abs(P.y-w.y)<10&&moOn(w,P.x))onP=1}pvMo=pvMo.filter(w=>w.t<w.life);
if(onP&&P.inv<=0&&bombT<=0&&dying<=0){pvBp+=10;if(pvBp>=30){pvBp=0;hit()}}else pvBp=Math.max(0,pvBp-2);
for(const z of pvIc)z.t++;pvIc=pvIc.filter(z=>z.t<z.life);icy=pvIc.some(z=>inIce(z,P.x,P.y))?1:0;
if(pvTs){const ts=pvTs;ts.t++;if(ts.t>=40&&ts.t<ts.life-20&&(ts.t-40)%40===0)ts.st.push({x:Math.max(14,Math.min(W-14,P.x+(Math.random()-.5)*16)),y:Math.max(24,Math.min(H-14,P.y+(Math.random()-.5)*16)),t:0,T:26});
for(const k of ts.st){k.t++;if(k.t===k.T){for(let i=0;i<10;i++)fx.push({x:k.x,y:k.y,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,l:18,c:'#ffe14d'});if(P.inv<=0&&bombT<=0&&dying<=0&&Math.hypot(P.x-k.x,P.y-k.y)<24)hit()}}
ts.st=ts.st.filter(k=>k.t<k.T+14);if(ts.t>=ts.life&&!ts.st.length)pvTs=null}
if(bombT>0)pvSh=[];
for(const s of pvSh){s.x+=s.vx;s.y+=s.vy;s.l--;if(Math.hypot(P.x-s.x,P.y-s.y)<9*hbS){s.l=0;hit()}}
pvSh=pvSh.filter(s=>s.l>0&&s.x>-10&&s.x<W+10&&s.y>-10&&s.y<H+10);
if(MP.on)mpBfStep();else bfStep();
if(PV.ph==='fight'&&PV.ft>=PV_SD+PV_SDLEN&&(!MP.on||MP.host)){const a=score-PV.sc0,b=PV.bs,w=a>b?1:a<b?0:(Math.random()<.5?1:0);PV.note='HẾT 30s: CẢ HAI BỊ HẠ — ĐIỂM '+a+' : '+b;PV.noteT=150;if(MP.on)mpSend({t:'tmo',rd:PV.rd,w,a,b});pvEnd(w,1)}
pvUI()}
function pvDrawG(){for(const z of pvIc)pvIceDraw(ctx,z);for(const w of pvMo)pvWall(ctx,w,t)}
function pvDrawF(){
for(const q of pvPr){ctx.strokeStyle='#fff';ctx.globalAlpha=.5;ctx.lineWidth=2;ctx.beginPath();pvRing(ctx,q.k,q.tx,q.ty,q.t/q.T);ctx.stroke();ctx.globalAlpha=1;if(!pvIcon(ctx,q.k,q.x,q.y,28,q.t*.3)){ctx.fillStyle={flash:'#fff',smoke:'#aaa',molly:'#ff8a2a',nade:'#5aa84a',ice:'#6ff3ff',thunder:'#ffe14d'}[q.k];ctx.strokeStyle='#000';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(q.x,q.y,5,0,7);ctx.fill();ctx.stroke()}}
for(const s of pvSh){ctx.fillStyle='#ff8a2a';ctx.beginPath();ctx.moveTo(s.x,s.y-4);ctx.lineTo(s.x+3,s.y);ctx.lineTo(s.x,s.y+4);ctx.lineTo(s.x-3,s.y);ctx.fill()}
for(const f of pvFl){ctx.globalAlpha=1-f.t/22;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(f.x,f.y,10+f.t*5,0,7);ctx.fill();ctx.globalAlpha=1}
pvStormDraw(ctx,pvTs);
for(const s of pvSm)pvSmoke(ctx,s);
if(PV.sm){ctx.fillStyle='rgba(172,172,178,.985)';ctx.fillRect(0,0,W,H)}}

// ===== Bảng điểm PVP: thanh nhỏ phía trên + màn kết thúc round (2 mảnh xanh/đỏ ghép đôi, nhảy số) =====
const pvSbE=document.getElementById('pvSb'),pvRsE=document.getElementById('pvRes'),
 g$=id=>document.getElementById(id),
 sbN=[g$('sbN1'),g$('sbN2')],sbS=[g$('sbS1'),g$('sbS2')],rsN=[g$('rsN1'),g$('rsN2')],rsS=[g$('rsS1'),g$('rsS2')],rsP=[g$('rsL'),g$('rsR')];
let pvSbK='',pvRsRd=-1,pvRsPop=0,pvRsJn=0,pvRsShown=[-1,-1];
const pvNames=()=>[String(profName()||'Player').slice(0,12),MP.on?String(MP.rn||'Đối thủ').slice(0,12):FK.on?FK.name:'BOT'];
const pvFit=(el,txt)=>{el.textContent=txt;el.style.setProperty('--k',Math.min(1,7/Math.max(1,txt.length)).toFixed(2))};
const pvClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function pvUiUpd(){
 const on=!!(PV.on&&state==='play');
 pvSbE.style.display=on?'flex':'none';
 if(!on||PV.ph!=='end'){if(pvRsE.style.display!=='none'){pvRsE.style.display='none'}pvRsRd=-1}
 if(!on)return;
 const nm=pvNames(),k=nm[0]+'|'+nm[1]+'|'+PV.sp+'|'+PV.sb;
 if(k!==pvSbK){pvSbK=k;pvFit(sbN[0],nm[0]);pvFit(sbN[1],nm[1]);sbS[0].textContent=PV.sp;sbS[1].textContent=PV.sb}
 if(PV.ph!=='end')return;
 const e=RS_T-PV.bt,IN=22,OUT=22,POP=70;
 if(pvRsRd!==PV.rd){pvRsRd=PV.rd;pvRsPop=0;pvRsJn=0;pvRsShown=[-1,-1];pvFit(rsN[0],nm[0]);pvFit(rsN[1],nm[1]);pvRsE.style.display='block';pvRsE.classList.remove('jn')}
 const ei=pvClamp(e/IN,0,1),eo=pvClamp((e-(RS_T-OUT))/OUT,0,1),off=Math.pow(1-ei,3)+Math.pow(eo,3);
 rsP[0].style.transform='translate3d('+(-off*100)+'%,0,0)';rsP[1].style.transform='translate3d('+(off*100)+'%,0,0)';
 if(e>=IN&&!pvRsJn){pvRsJn=1;pvRsE.classList.remove('jn');void pvRsE.offsetWidth;pvRsE.classList.add('jn')}
 const nv=[PV.sp,PV.sb],ov=[PV.rP,PV.rB];
 for(let i=0;i<2;i++){const shown=e>=POP?nv[i]:ov[i];
  if(pvRsShown[i]!==shown){const jump=pvRsShown[i]!==-1&&e>=POP;pvRsShown[i]=shown;rsS[i].textContent=shown;
   if(jump){rsS[i].classList.remove('pop');void rsS[i].offsetWidth;rsS[i].classList.add('pop')}}}
}
function pvDrawHUD(){bfDraw();
ctx.textAlign='center';
if(PV.noteT>0){ctx.font='bold 14px sans-serif';ctx.strokeText(PV.note,W/2,H/2-90);ctx.fillStyle='#fff';ctx.fillText(PV.note,W/2,H/2-90)}
if(PV.ph==='ready'){ctx.font='bold 40px sans-serif';const n=String(Math.ceil(PV.pt/60));ctx.strokeText(n,W/2,H/2-30);ctx.fillStyle='#fff';ctx.fillText(n,W/2,H/2-30)}
if(PV.ph==='fight'&&PV.fb>0){ctx.font='bold 28px sans-serif';ctx.globalAlpha=Math.min(1,PV.fb/20);ctx.strokeText('FIGHT!',W/2,H/2-40);ctx.fillStyle='#fff';ctx.fillText('FIGHT!',W/2,H/2-40);ctx.globalAlpha=1}
pvUiUpd();

if(P.stun>0){ctx.globalAlpha=Math.min(.97,P.stun/50);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}}
function stepBase(){t++;stgClock();
let mx=Math.max(-1,Math.min(1,dp.x+kb.r-kb.l)),my=Math.max(-1,Math.min(1,dp.y+kb.d-kb.u)),m=Math.hypot(mx,my)||1;P.ln=(P.ln||0)+(mx-(P.ln||0))*.34;
const sp=(K.slow?1.5:3.6)*spdM*(wet?.45:1)*(icy?.5:1);P.x=Math.max(10,Math.min(W-10,P.x+mx/m*sp*(mx||my?1:0)));P.y=Math.max(14,Math.min(H-14,P.y+my/m*sp*(mx||my?1:0)));
if(P.inv>0)P.inv--;
if(PV.on&&CH===2&&PV.ph==='fight'&&!PV.sd&&P.bb<JB_MAX)P.bb=Math.min(JB_MAX,P.bb+JB_REGEN);
if(bombQ||(K.bomb&&!lastBomb))bomb();bombQ=0;lastBomb=K.bomb;
if(dying>0&&--dying===0)die();
const moving=(mx||my),rf=K.slow?.3:1;
rc=Math.max(0,Math.min(1,rc+((K.shoot?.008:0)+(moving?.014:0))*rf-(!K.shoot&&!moving?.03:0)));
G0+=((K.slow?3:6)-G0)*.25;
for(const q of tr)q.a++;tr=tr.filter(q=>(q.a+1)*110-36<q.D);sprayT++;mvg=moving?1:0;if(P.mf>0)P.mf--;
{const tgt=moving?(K.slow?4:10):0;if(tgt>=mvB)mvB=tgt;else mvB=Math.max(tgt,mvB-.8);
const cap=K.slow?5:14;if(spB>cap)spB=Math.max(cap,spB-.7);
if(sprayT>10)spB=Math.max(0,spB-.35);if(sprayT>10)drOff*=.9;if(sprayT>24){sprayI=0;dr=0}}
if(rl>0&&!(wet&&t%20<11)&&!(icy&&t&1)&&--rl===0)ammo=MAG;
if(CH!==1&&K.shoot&&rl<=0&&((wet&&t%20<11)||(icy&&(t&1))?shotT:--shotT)<=0){shotT+=ivl()*(K.slow?1.5:1)*(CH===2?JIN_IV:1)*(CH===2&&P.soul>=30?.5:1);if(CH===2)sfx.shotJ();else sfx.shot();
const ox=P.x,oy=P.y-10,rdy=Math.max(80,P.y-RY),spr=spread(),fi=Math.min(1,Math.max(0,(sprayI-8)/22))*(K.slow?.4:1),tx=(Math.random()*2-1)*spr*(1-.5*fi)+(dr=Math.max(-spr,Math.min(spr,dr+(Math.random()*2-1)*spr*.6*fi)))*fi,sl=tx/rdy,dmg=(K.slow?9:6)*pmul()*(CH===2?JIN_DMG:1);
sprayI++;sprayT=0;P.mf=3;drOff=dr*fi;spB=Math.min(K.slow?5:14,spB+(K.slow?.4:1.1));
let tg=null,ty0=-1e9;for(const e of en){if(e.hp<=0||e.y>oy||e.y<-10)continue;if(Math.abs(ox+sl*(oy-e.y)-e.x)<(e.ty?18:14)&&e.y>ty0){ty0=e.y;tg=e}}
if(bs&&bs.on&&!bs.inv&&!bs.lv&&bs.hp>0&&bs.y<=oy&&Math.abs(ox+sl*(oy-bs.y)-bs.x)<20&&bs.y>ty0)tg=bs;let rkT=null;if(!PV.on){let by=tg?tg.y:-1e9;for(const r of rk){if(r.f||r.dead||r.y>oy||r.y<-10)continue;if(Math.abs(ox+sl*(oy-r.y)-r.x)<r.r+4&&r.y>by){by=r.y;rkT=r}}}let ey=-10;if(rkT){tg=null;ey=rkT.y+rkT.r*.7;shatter(rkT)}else if(tg){tg.hp-=dmg;score+=10;ey=tg.y+(tg===bs?24:tg.ty?18:14)}
const ex=ox+sl*(oy-ey);if(tg||rkT)for(let k=0;k<4;k++)fx.push({x:ex,y:ey,vx:(Math.random()-.5)*4,vy:Math.random()*3,l:12,c:CH===2?'#8ffff0':'#ffb'});
tr.push({x0:ox,y0:oy,x1:ex,y1:ey,a:0,D:Math.max(1,Math.hypot(ex-ox,ey-oy))});
if(--ammo<=0){rl=rlM=(CH===2&&P.soul>=30)?30:60;sfx.reload();sprayI=0;dr=0}}
if(CH===1)axUpd();subUpd();for(const b of pb){b.x+=b.vx;b.y+=b.vy}pb=pb.filter(b=>b.y>-10&&b.x>-10&&b.x<W+10);
if(stg===3&&!clr)s3upd();
if(stg===2){if(s2bn>0)s2bn--;s2t++;if(!PV.on&&!clr){while(s2i<SC_S2.length&&SC_S2[s2i].at<=gt)spawnS2(SC_S2[s2i++]);if(!s2b1&&gt>=T2_B1){s2b1=1;en=[];eb=[];bs=mkBoss(1)}else if(s2b1&&!s2b2&&!bs&&gt>=T2_B2){s2b2=1;en=[];eb=[];bs=mkBoss(2)}}}
else if(stg===1&&gt<T_B1){while(i1<SC1.length){const v=SC1[i1];if(v.gate){if(!g1){if(!noBig())break;g1=gt}if(gt<g1+v.rel)break}else if(v.at>gt)break;spawnEv(v);i1++}}
else if(stg===1&&b1Left&&gt<T_B2){if(!b1LT)b1LT=gt;while(i2<SC2.length){const v=SC2[i2];if(v.gate){if(!g2){if(!noBig())break;g2=gt}if(gt<g2+v.rel)break}else if(b1LT+v.at>gt)break;spawnEv(v);i2++}}
for(const e of en){e.t++;moveEnemy(e);if(e.y>0&&e.t>10&&e.y<H-110&&e.x>-10&&e.x<W+10)enemyFire(e);
for(const b of pb)if(!b.dead&&Math.abs(b.x-e.x)<14&&Math.abs(b.y-e.y)<14){e.hp-=b.d;b.dead=1;score+=10}
if(bombT>0){if(PV.on)e.gone=1;else if(e.ek)e.hp=0;else e.hp-=.6}}
pb=pb.filter(b=>!b.dead);
for(const e of en)if(e.hp<=0){if(e.ek==='bomber'){boomB(e);if(e.sd)continue}else if(e.ek==='witch')witchDie(e);score+=e.ty?500:200;if(CH===2)P.soul=Math.min(30,Math.round((P.soul+(e.ty?.5:.2))*10)/10);for(let i=0;i<10;i++)fx.push({x:e.x,y:e.y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,l:25,c:'#ffd'});drop(e)}
en=en.filter(e=>e.hp>0&&!e.gone);
if(P.inv<=0&&bombT<=0&&dying<=0&&!clr){for(const e of en){if(Math.hypot(P.x-e.x,P.y-e.y)<((e.ty||e.ek==='thunder')?18:14)+3*hbS){hit();break}}
if(bs&&bs.on&&!bs.lv&&bs.hp>0&&Math.hypot(P.x-bs.x,P.y-bs.y)<28+3*hbS)hit()}
const vanish=()=>{for(const e of en)for(let i=0;i<6;i++)fx.push({x:e.x,y:e.y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,l:25,c:'#ffa040'});en=[];eb=[]};
if(stg===1&&!b1s&&gt>=T_B1){b1s=1;vanish();bs={x:W/2,y:-70,t:0,hp:130,max:130,on:0,sp:0,ph:1,bar:0,bars:1,inv:0,lv:0,pt:0,clean:1,txt:0,mph:0,amp:100,my:0,tx:W/2,lim:1800,sd:0,rs:12345,ci:0}}
if(stg===1&&!b2s&&gt>=T_B2&&!bs){b2s=1;vanish();bs={x:W/2,y:-70,t:0,hp:140,max:140,on:0,sp:0,ph:2,bar:0,bars:4,inv:0,lv:0,pt:0,clean:1,txt:0,mph:0,amp:100,my:0,tx:W/2,lim:1800,sd:0,rs:12345,ci:0}}
const bossBonus=(b,pts,mana)=>{if(!b.clean)return;score+=pts;const mk=k=>items.push({x:b.x+(Math.random()-.5)*30,y:b.y,vy:-2-Math.random(),k});for(let i=0;i<2;i++){if(lvP<100)mk('p');if(lvS<100)mk('s')}if(mana)mk('m')};
if(bs){const b=bs;b.t++;b.vx=(b.vx||0)*.85+(b.x-(b.px==null?b.x:b.px))*.15;b.px=b.x;
if(b.lv){b.y-=3;if(b.y<-90){bs=null}}
else if(b.hp<=0||(b.ph===2&&b.on&&b.pt>=b.lim)){
const killed=b.hp<=0,sp=spellOf(b);if(killed&&CH===2)P.soul=Math.min(30,Math.round((P.soul+5)*10)/10);
if(killed)for(let i=0;i<70;i++)fx.push({x:b.x+(Math.random()-.5)*50,y:b.y+(Math.random()-.5)*80,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,l:40,c:i%2?'#ffd':'#ffa040'});
eb=[];lz=[];lf=[];rk=[];s2cg=null;s3fl=[];if(stg===3){en=[];s3buff=0;s3cap=0}
if(b.ph===1){if(killed){items.push({x:b.x,y:b.y,vy:-2,k:'m'});bossBonus(b,2000,0)}b.lv=1;b1Left=1}
else{if(sp){if(killed)bossBonus(b,b.bar===(stg===3?5:3)?5000:3000,1);b.sd++}
if(b.bar<b.bars-1){b.bar++;b.max=(stg===3?PH_HP3:stg===2?PH_HP:PH_HP1)[b.bar];b.hp=b.max;b.lim=(stg===3?PH_T3:stg===2?PH_T:PH_T1)[b.bar];b.t=0;b.sp=0;b.pt=0;b.clean=1;b.ci=0}
else{en=[];bossDone=1;clr=1;endT=170;P.inv=Math.max(P.inv,300);dying=0;bs=null}}}
else if(!b.on){b.y+=2.4;if(b.y>=95){b.y=95;b.on=1;b.t=0}}
else{
if(b.ph===1&&(stg===3?gt>=S3_E1:stg===2?gt>=T2_END1:gt>=T_B1_END)){eb=[];b.lv=1;b1Left=1}
b.pt++;
if(bombT>0)b.hp-=.3;
const a=Math.atan2(P.y-b.y,P.x-b.x);
if(stg===3)(b.ph===1?s3p1:s3p2)(b,a);else if(b.ph===1&&stg===2)boss1s(b,a);else if(b.ph===1){b.mph+=1/80;b.amp+=(100-b.amp)*.03;b.my+=1/55;b.x=W/2+Math.sin(b.mph)*b.amp;b.y=95+Math.sin(b.my)*14;
if(b.t>40&&!b.lv){if(b.t%60===0)for(let i=-2;i<=2;i++)ebul(b.x,b.y,a+i*.2,2.2,0);
if(b.t%150===0){b.sp+=.4;for(let i=0;i<18;i++)ebul(b.x,b.y,b.sp+i*6.2832/18,1.6,1)}}}
else if(stg===2)boss3(b,a);else boss2(b,a)}}
if(clr&&--endT<=0){if(stg===1||(stg===2&&GM==='camp')){const nx=stg===1?startS2:startS3;if(GM==='camp'&&!(UP.g>=4&&UP.s>=4))upgOpen(nx);else nx()}else over()}
for(const it of items){const ac=P.y<AC_Y;if(!ac){it.vy=Math.min(1.6,it.vy+.06);it.y+=it.vy}const dx=P.x-it.x,dy=P.y-it.y,d=Math.hypot(dx,dy);
if(ac&&d>.5){const v=Math.min(d,10);it.x+=dx/d*v;it.y+=dy/d*v}else if(d<50&&d>.5){it.x+=dx/d*4;it.y+=dy/d*4}if(d<16){it.got=1;pickup(it.k)}}
items=items.filter(i=>!i.got&&i.y<H+12);
if(bombT>0){bombT--;eb=[];lf=[];fbs=[];rk=[];s3fl=[];if(stg===2||stg===3||PV.on){lz=[];zn=[];ths=[];if(PV.on)en=[]}}
for(const l of lz){l.t++;if(l.fn)l.fn(l);
if(l.aim&&l.t<=l.lock){l.a=Math.atan2(P.y-l.cy,P.x-l.cx);l.x=l.cx-Math.sin(l.a)*l.off;l.y=l.cy+Math.cos(l.a)*l.off}
if(l.t>=l.tel&&l.t<l.tel+l.on){const px=P.x-l.x,py=P.y-l.y,c=Math.cos(l.a),sn=Math.sin(l.a);if(px*c+py*sn>-6&&Math.abs(px*sn-py*c)<l.w/2+3*hbS)hit()}}
lz=lz.filter(l=>l.t<l.tel+l.on);
for(const f of lf){f.t++;f.y+=1.15;f.x=f.bx+Math.sin(f.t/45+f.ph)*28;const dx=f.x-P.x,dy=f.y-P.y;if(dx*dx+dy*dy<676)hit()}
lf=lf.filter(f=>f.y<H+50);
for(const b of eb){if(b.pa){b.dist+=b.sp;const q=pathAt(b.pa,b.dist);if(q){b.x=q[0];b.y=q[1]}else b.x=-99}else{if(b.w){const ca=Math.cos(b.w),sa=Math.sin(b.w),nx=b.vx*ca-b.vy*sa;b.vy=b.vx*sa+b.vy*ca;b.vx=nx}{const kk=b.ar?(b.k=Math.min(1,b.k+.09)):1;b.x+=b.vx*kk;b.y+=b.vy*kk}if(b.g)b.vy+=b.g}{const dx=b.x-P.x,dy=b.y-P.y,d2=dx*dx+dy*dy;if(d2<31.36*hbS*hbS)hit();}}
eb=eb.filter(b=>b.x>-10&&b.x<W+10&&b.y>-10&&b.y<H+10);
if(stg===2)s2upd();
for(const f of fx){f.x+=f.vx;f.y+=f.vy;f.l--}fx=fx.filter(f=>f.l>0)}
const BC=['#ff4d6d','#4dd2ff','#ffe14d','#c8763a','#3a5bff'],BC1=['#fff3dc','#ffb42e','#ffc83d','#ff9a2e','#fff3dc'];
let HE=null,hc={},_bg=null;
function updHud(){if(!HE){HE={};for(const k of['hSc','hMn','hMb','hPw','hPb','hSp','hSb','hSoR','hSoB','hSo','hSoI'])HE[k]=document.getElementById(k)}
const jb=!!(P&&PV.on&&CH===2),m=P?(jb?P.bb:P.mana):100,s=P?score:0;
if(hc.s!==s){hc.s=s;HE.hSc.textContent=s}
const mx=jb?JB_MAX:(P?P.mx:100),so=P?P.soul:15,jn=CH===2;
if(hc.jb!==jb){hc.jb=jb;hc.m=null;HE.hMn.previousElementSibling.textContent=jb?'BOMB':'MANA'}
if(hc.m!==m||hc.mx!==mx){hc.m=m;hc.mx=mx;HE.hMn.textContent=jb?Math.floor(m)+'/'+JB_MAX:m;HE.hMb.style.width=(m/mx*100)+'%';HE.hMb.parentNode.classList.toggle('low',jb?m<1:m<20)}
if(hc.jn!==jn){hc.jn=jn;HE.hSoR.style.display=HE.hSoB.style.display=jn?'':'none'}
if(jn&&hc.so!==so){hc.so=so;HE.hSo.textContent=so>=30?'MAX':(Number.isInteger(so)?so:so.toFixed(1));HE.hSoI.style.width=(so/30*100)+'%';HE.hSoB.classList.toggle('max',so>=30)}
const bo=jn?(jb?m<JB_COST:so<13):m<15;if(hc.bo!==bo){hc.bo=bo;bEl.bomb.style.opacity=bo?.4:1}
if(hc.p!==lvP){hc.p=lvP;HE.hPw.textContent=lvP>=100?'MAX':lvP;HE.hPb.style.width=lvP+'%';HE.hPb.parentNode.classList.toggle('max',lvP>=100)}
if(hc.v!==lvS){hc.v=lvS;HE.hSp.textContent=lvS>=100?'MAX':lvS;HE.hSb.style.width=lvS+'%';HE.hSb.parentNode.classList.toggle('max',lvS>=100)}}
function draw(){
if(stg===3&&BG3F.complete&&BG3F.naturalWidth)drawBG3();else if(stg===2&&BG2.complete&&BG2.naturalWidth){const o=Math.floor((t||0)*BG_SPEED)%H;ctx.drawImage(BG2,0,o-H,W,H);ctx.drawImage(BG2,0,o,W,H)}else if(BGI.complete&&BGI.naturalWidth){const o=Math.floor((t||0)*BG_SPEED)%H;ctx.drawImage(BGI,0,o-H);ctx.drawImage(BGI,0,o)}else{
if(!_bg){_bg=ctx.createLinearGradient(0,0,0,H);_bg.addColorStop(0,'#0b1030');_bg.addColorStop(1,'#1d1245')}ctx.fillStyle=_bg;ctx.fillRect(0,0,W,H);
ctx.fillStyle='#ffffff14';for(let i=0;i<30;i++){ctx.fillRect((i*97)%W,((i*53+t*(1+i%3))%H),2,6+i%4*3)}}
ctx.fillStyle='rgba(0,0,0,'+(stg>=2?.12:BG_DARK)+')';ctx.fillRect(0,0,W,H);
if(state==='title'||!P)return;
if(stg===2)drawS2g();
if(PV.on)pvDrawG();
if(stg===2){for(const e of en){const im=ES2[e.ek];if(!im||!im.complete)continue;const s=e.ty?56:36;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.ek==='earth'?0:Math.sin(t/(e.ek==='fire'?9:18)+(e.ph||0))*(e.ek==='fire'?.14:.15));ctx.drawImage(im,-s/2,-s/2,s,s);ctx.restore()}}
else if(stg===3){for(const e of en)e.ek==='bomber'?drawBomber(e):e.ek==='witch'?drawWitch(e):drawArcher(e)}
else if(LF_S.complete&&LF_S.naturalWidth&&LF_B.complete&&LF_B.naturalWidth){for(const e of en){const im=e.ty?LF_B:LF_S,s=e.ty?52:36,hh=s*im.naturalHeight/im.naturalWidth;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.sin(t/18+(e.ph||0))*.18);ctx.drawImage(im,-s/2,-hh/2,s,hh);ctx.restore()}}
else for(const e of en){ctx.fillStyle=e.ty?'#b06cff':'#6cffb0';ctx.beginPath();ctx.arc(e.x,e.y,e.ty?13:10,0,7);ctx.fill()}
for(const f of lf){if(EMJ.complete&&EMJ.naturalWidth){const sz=68,hh=sz*EMJ.naturalHeight/EMJ.naturalWidth;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.t/70+f.ph);ctx.drawImage(EMJ,-sz/2,-hh/2,sz,hh);ctx.restore()}}
ctx.lineCap='butt';for(const l of lz){const ex=l.x+Math.cos(l.a)*900,ey=l.y+Math.sin(l.a)*900;
if(l.t<l.tel){ctx.globalAlpha=.3+((l.t>l.tel-14&&(l.t>>1)&1)?.35:0);ctx.strokeStyle='#ffe14d';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(ex,ey);ctx.stroke()}
else{const f=Math.max(0,Math.min(1,(l.t-l.tel)/6,(l.tel+l.on-l.t)/8));ctx.globalAlpha=.4*f;ctx.strokeStyle='#ffc400';ctx.lineWidth=l.w+9;ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(ex,ey);ctx.stroke();
ctx.globalAlpha=1;ctx.strokeStyle='#fffbd0';ctx.lineWidth=l.w*f;ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(ex,ey);ctx.stroke()}ctx.globalAlpha=1}
let BI=stg===3?HAMIN:stg===2?B2P[0]:BOSS1I,SC=0;if(bs&&(stg===2||stg===3)){const PS=stg===3?B3P:B2P,want=(stg===2&&spellOf(bs))?3:bs.vx<-.35?1:bs.vx>.35?2:0;if(bs.pz==null){bs.pz=want;bs.pc=0}else if(want!==bs.pz&&(want===3||bs.pz===3)){bs.pz=want;bs.pc=0}else if(want!==bs.pz){if(++bs.pc>=5){bs.pz=want;bs.pc=0}}else bs.pc=0;BI=PS[bs.pz];if(!(BI.complete&&BI.naturalWidth))BI=PS[0];if(BI.complete&&BI.naturalWidth)SC=stg===3?70/341:68/260;else BI=stg===3?HAMIN:BOSS1I}else if(stg!==2&&stg!==3&&bs){const sp0=spellOf(bs),pi=sp0?(bs.vx<-.35?4:bs.vx>.35?5:3):bs.vx<-.35?1:bs.vx>.35?2:0;if(BOSS1P[pi].complete&&BOSS1P[pi].naturalWidth)BI=BOSS1P[pi]}
if(bs&&BI.complete&&BI.naturalWidth){const h=SC?BI.naturalHeight*SC:stg===3?70:stg===2?68:BI===BOSS1I?62:64.5,w=h*BI.naturalWidth/BI.naturalHeight,spl=spellOf(bs);
if(stg===3){ctx.save();if(spl){ctx.globalAlpha=.2+.1*Math.sin(t/6);ctx.fillStyle='#ff6a8a';ctx.beginPath();ctx.arc(bs.x,bs.y,34+3*Math.sin(t/5),0,6.2832);ctx.fill();ctx.globalAlpha=1}ctx.translate(bs.x,bs.y);ctx.rotate(SC?0:Math.max(-.12,Math.min(.12,(bs.vx||0)*.05)));ctx.drawImage(BI,-w/2,-h/2,w,h);ctx.restore()}else ctx.drawImage(BI,bs.x-w/2,bs.y-h/2-(SC&&stg===2?5:0),w,h);
ctx.fillStyle='#00000088';ctx.fillRect(20,8,W-40,7);ctx.fillStyle=spl?'#ffd23d':'#ff7a3d';ctx.fillRect(21,9,Math.max(0,(W-42)*bs.hp/bs.max),5);
ctx.save();ctx.textAlign='center';ctx.font='bold 12px sans-serif';ctx.lineWidth=3;ctx.strokeStyle='#000000cc';ctx.fillStyle='#fff';{const bn=stg===3?'Hamin':stg===2?'Xeno':'terruui';ctx.strokeText(bn,W/2,28);ctx.fillText(bn,W/2,28)}ctx.restore();
if(bs.ph===2){for(let i=0;i<(stg===2||stg===3?3:1);i++){if(i<bs.sd)continue;const cx=28+i*18,cy=26,act=spl&&i===bs.sd;ctx.beginPath();for(let k=0;k<10;k++){const rr=k&1?3.1:7,an=-Math.PI/2+k*Math.PI/5;ctx.lineTo(cx+Math.cos(an)*rr,cy+Math.sin(an)*rr)}ctx.closePath();
if(act){ctx.shadowColor='#ffe14d';ctx.shadowBlur=9+4*Math.sin(t/7);ctx.fillStyle='#ffe14d';ctx.fill();ctx.shadowBlur=0}else{ctx.strokeStyle='#ffe14dcc';ctx.lineWidth=1.3;ctx.stroke()}}}
if(bs.on&&!bs.lv){const rem=bs.ph===1?(stg===3?Math.max(0,Math.ceil(S3_E1-gt)):stg===2?Math.max(0,Math.ceil(T2_END1-gt)):Math.max(0,Math.ceil(T_B1_END-gt))):Math.max(0,Math.ceil((bs.lim-bs.pt)/60));ctx.textAlign='right';ctx.font='bold 18px sans-serif';ctx.lineWidth=3;ctx.strokeStyle='#000000aa';ctx.strokeText(rem,W-18,36);ctx.fillStyle=rem<=10?'#ff5a5a':'#fff';ctx.fillText(rem,W-18,36)}}
if(((stg===1&&((gt>=T_B1-3&&gt<T_B1)||(gt>=T_B2-3&&gt<T_B2)))||(stg===2&&!PV.on&&((gt>=T2_B1-3&&gt<T2_B1)||(gt>=T2_B2-3&&gt<T2_B2)))||(stg===3&&s3warn()))&&(t>>3)%2){ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 22px sans-serif';ctx.fillText('WARNING',W/2,H/2-40)}
if(clr){ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 26px sans-serif';ctx.fillText('STAGE '+stg+' CLEAR',W/2,H/2)}
if(s2bn>0){ctx.globalAlpha=Math.max(0,Math.min(1,s2bn/30,(150-s2bn)/20));ctx.textAlign='center';ctx.font='bold 30px sans-serif';ctx.lineWidth=4;ctx.strokeStyle='#000b';ctx.fillStyle='#fff';ctx.strokeText('STAGE 2',W/2,H/2-60);ctx.fillText('STAGE 2',W/2,H/2-60);ctx.globalAlpha=1}
if(stg===2)drawS2f();
if(items.length&&state==='play'){ctx.save();ctx.globalAlpha=.28;ctx.setLineDash([6,6]);ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,AC_Y);ctx.lineTo(W,AC_Y);ctx.stroke();ctx.restore()}
for(const it of items){const im=ITI[it.k];if(im&&im.complete&&im.naturalWidth){const hh=ITH[it.k],ww=hh*im.naturalWidth/im.naturalHeight;ctx.drawImage(im,it.x-ww/2,it.y-hh/2,ww,hh)}else{ctx.fillStyle=it.k==='p'?'#ff5a5a':it.k==='s'?'#4dd2ff':'#3ddc6b';ctx.beginPath();ctx.arc(it.x,it.y,8,0,7);ctx.fill()}}
ctx.lineCap='round';for(const q of tr){const dx=(q.x1-q.x0)/q.D,dy=(q.y1-q.y0)/q.D,hd=Math.min(q.D,(q.a+1)*110),td=Math.max(0,Math.min(q.D,(q.a+1)*110-36));
ctx.beginPath();ctx.moveTo(q.x0+dx*td,q.y0+dy*td);ctx.lineTo(q.x0+dx*hd,q.y0+dy*hd);ctx.strokeStyle=CH===2?'#2fe6d066':'#ffa83066';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle=CH===2?'#d8fffb':'#fff6c8';ctx.lineWidth=1.6;ctx.stroke()}
if(CH===1&&P&&state==='play'){const sx=P.x,sy=P.y-10,ey=Math.max(12,sy-AX_R);ctx.save();ctx.globalAlpha=axH>0?1:.35;ctx.setLineDash([3,6]);ctx.lineWidth=1.5;ctx.strokeStyle='#ffffff88';ctx.beginPath();ctx.moveTo(sx,sy-8);ctx.lineTo(sx,ey+9);ctx.stroke();ctx.setLineDash([]);
ctx.lineWidth=2.2;ctx.strokeStyle='#ff4a3d';ctx.beginPath();ctx.arc(sx,ey,7,0,7);ctx.moveTo(sx-13,ey);ctx.lineTo(sx-4,ey);ctx.moveTo(sx+4,ey);ctx.lineTo(sx+13,ey);ctx.moveTo(sx,ey-13);ctx.lineTo(sx,ey-4);ctx.moveTo(sx,ey+4);ctx.lineTo(sx,ey+13);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(sx,ey,1.6,0,7);ctx.fill();ctx.restore()}
if(CH===1)for(const a of axs)drawAxe(a.x,a.y,a.rot,1,1);
if(P.mf>0){ctx.fillStyle=CH===2?'#7dffe6':'#ffe9a0';ctx.beginPath();ctx.moveTo(P.x-4,P.y-20);ctx.lineTo(P.x,P.y-36-Math.random()*6);ctx.lineTo(P.x+4,P.y-20);ctx.fill()}
for(let c=0;c<5;c++){let n=0;ctx.fillStyle=(stg===1&&bs?BC1:BC)[c];ctx.beginPath();for(const b of eb)if(b.c===c){ctx.moveTo(b.x+5,b.y);ctx.arc(b.x,b.y,5,0,6.2832);n++}if(n)ctx.fill()}
if(eb.length){ctx.fillStyle='#fff';ctx.beginPath();for(const b of eb){if(b.ar)continue;ctx.moveTo(b.x+2.6,b.y);ctx.arc(b.x,b.y,2.6,0,6.2832)}ctx.fill();for(const b of eb)if(b.ar)drawArrowB(b)}
if(stg===3)drawS3hud();
for(const f of fx){ctx.globalAlpha=f.l/25;ctx.fillStyle=f.c;ctx.fillRect(f.x,f.y,3,3)}ctx.globalAlpha=1;
if(bombT>0){const r=(110-bombT)*5;ctx.lineWidth=6;for(let i=0;i<3;i++){ctx.strokeStyle=['#ff4d6d','#ffe14d','#4dd2ff'][i];ctx.globalAlpha=bombT/110;ctx.beginPath();ctx.arc(P.x,P.y,Math.max(0,r-i*18),0,7);ctx.stroke()}ctx.globalAlpha=1}
if(P)drawUp();if(!(P.inv>0&&(t>>2)%2))drawChar(ctx,CH,P.x,P.y,P.ln>.5?1:P.ln<-.5?2:0,CH===1&&axH>0);
if(PV.on)pvDrawF();
if(dying>0){const f=dying/DB_FRAMES;ctx.strokeStyle='#ff3b3b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(P.x,P.y,14+26*f,0,7);ctx.stroke();
ctx.globalAlpha=.1+.1*((t>>2)%2);ctx.fillStyle='#f00';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
ctx.fillStyle='#ffffff40';ctx.fillRect(W/2-60,H/2-50,120,5);ctx.fillStyle='#ff4d4d';ctx.fillRect(W/2-60,H/2-50,120*f,5)}
if(K.slow&&HBR.complete&&HBR.naturalWidth){const hh=HB_H*hbS,ww=hh*0.45333,dx=P.x-0.4941*ww,dy=P.y-0.4248*hh;ctx.save();ctx.globalAlpha=HB_A;ctx.drawImage(HBK,dx,dy,ww,hh);ctx.restore();ctx.drawImage(HBR,dx,dy,ww,hh)}
if(CH===1)axPips();else{const L=P.x>W-70,ax=L?P.x-24:P.x+24;ctx.textAlign=L?'right':'left';ctx.font='bold 11px sans-serif';if(rl>0){const bx=L?ax-36:ax;ctx.fillStyle='#ff5a5a';ctx.fillText('NẠP ĐẠN',ax,P.y);ctx.fillStyle='#ffffff40';ctx.fillRect(bx,P.y+4,36,3);ctx.fillStyle='#ff5a5a';ctx.fillRect(bx,P.y+4,36*(1-rl/rlM),3)}else{ctx.fillStyle=ammo<=10?'#ffd24d':'#fff';ctx.fillText(ammo+'/'+MAG,ax,P.y)}}
if(CH!==1){const nx=P.x+drOff,rg=Math.max(3,spread()),cx=Math.max(rg+4,Math.min(W-rg-4,nx));ctx.strokeStyle='#ff2a2a';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx-rg,RY-8);ctx.lineTo(cx-rg,RY+8);ctx.moveTo(cx+rg,RY-8);ctx.lineTo(cx+rg,RY+8);ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(cx-1,RY-1,2,2)}
if(PV.on)pvDrawHUD();
}
let last=0,acc=0,fN=0,fT=0;const PM=matchMedia('(orientation:portrait)');
function loop(ts){acc+=Math.min(50,ts-last);last=ts;if(!fT)fT=ts;fN++;if(ts-fT>=500){if(ST.fps){const f=Math.round(fN*1000/(ts-fT));fpsE.textContent='FPS '+f;fpsE.style.color=f<30?'#f55':f<50?'#fb3':'#6f6'}fN=0;fT=ts}const showP=state==='play'&&!PM.matches;if(showP!==pbShown){pbShown=showP;pauseB.style.display=showP?'flex':'none'}stgSync(state==='play'&&!PM.matches&&!document.hidden&&!paused);let n=0;while(acc>=16.67){if(state==='play'&&!PM.matches&&!paused){step();n++}acc-=16.67}if(n||state!=='play')draw();updHud();requestAnimationFrame(loop)}
requestAnimationFrame(ts=>{last=ts;loop(ts)});
const $=id=>document.getElementById(id),menu=$('menu'),playB=$('play'),muteB=$('mute'),scE=$('sc'),loadE=$('load'),tapE=$('tap');
let stage='load';
const MUS_F=1.38,MUS_L=66.20835,MUS_B64='assets/sounds/menu.mp3';
const sfx=(()=>{let ctx=null,buf=null,jbuf=null,rbuf=null,out=null,ok=false,mg=null,sv=1;
const B64='assets/sounds/sfx_shot.mp3';
const R64='assets/sounds/sfx_reload.mp3';
const J64='assets/sounds/sfx_shot_jin.mp3';
const dec=async s=>{const u=new Uint8Array(await(await fetch(s)).arrayBuffer());
return await new Promise((res,rej)=>{const p=ctx.decodeAudioData(u.buffer,res,rej);if(p&&p.catch)p.catch(rej)})};
function prep(b,off,len,fadeS){const sr=b.sampleRate,o0=Math.round(off*sr),n=Math.min(b.length-o0,Math.round(len*sr)),fd=Math.round(fadeS*sr),r=ctx.createBuffer(b.numberOfChannels,n,sr);let pk=0;
for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(d[o0+i]))}
const k=pk>0?.9/pk:1;
for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c),o=r.getChannelData(c);for(let i=0;i<n;i++){let v=d[o0+i]*k;if(i>n-fd)v*=(n-i)/fd;o[i]=v}}return r}
async function load(){try{const AC=window.AudioContext||window.webkitAudioContext;ctx=new AC();
buf=prep(await dec(B64),.065,.45,.08);rbuf=prep(await dec(R64),0,2,.04);try{jbuf=prep(await dec(J64),0,.45,.08)}catch(e){jbuf=null}
out=ctx.createDynamicsCompressor();const g=ctx.createGain();g.gain.value=.5*sv;mg=g;out.connect(g);g.connect(ctx.destination);ok=true}catch(e){ok=false}return ok}
function resume(){try{if(ctx&&ctx.state==='suspended')ctx.resume()}catch(e){}}
function play(b,vol,rate){if(!ok||sv<=0)return;resume();try{const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=b;s.playbackRate.value=rate;g.gain.value=vol;s.connect(g);g.connect(out);s.start()}catch(e){}}
function shot(){play(buf,1,.97+Math.random()*.06)}
function shotJ(){play(jbuf||buf,1,.97+Math.random()*.06)}
function reload(){play(rbuf,.9,1)}
function swing(){play(buf,.8,.5+Math.random()*.06)}
return{load,resume,shot,shotJ,reload,swing,setVol(v){sv=v;if(mg)mg.gain.value=.5*v},vis(v){if(!ctx)return;try{v?ctx.resume():ctx.suspend()}catch(e){}}}})();
const mus=(()=>{let ctx=null,loop=null,src=null,gain=null,on=true,ok=false,mv=1;
const wait=()=>new Promise(r=>setTimeout(r,40));
async function load(prog){try{const AC=window.AudioContext||window.webkitAudioContext;ctx=new AC();
const u=new Uint8Array(await(await fetch(MUS_B64)).arrayBuffer());prog(.25);await wait();
const b=await new Promise((res,rej)=>{const p=ctx.decodeAudioData(u.buffer,res,rej);if(p&&p.catch)p.catch(rej)});prog(.7);await wait();
const sr=b.sampleRate,Fs=Math.round(MUS_F*sr),Ls=Math.round(MUS_L*sr);loop=ctx.createBuffer(b.numberOfChannels,Ls,sr);
for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c),o=loop.getChannelData(c),m=d.length;for(let i=0;i<Ls;i++)o[i]=d[Fs+i]||0;
for(let i=0;i<Fs;i++){const t=i/Fs,j=Ls+i;o[Ls-Fs+i]=(j<m?d[j]:0)*Math.cos(t*Math.PI/2)+d[i]*Math.sin(t*Math.PI/2)}}
prog(.9);ok=true}catch(e){ok=false}return ok}
function start(){if(!ok||!on||src||state==='play')return;try{if(ctx.state==='suspended')ctx.resume();gain=ctx.createGain();gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(.7*mv,ctx.currentTime+1);src=ctx.createBufferSource();src.buffer=loop;src.loop=true;src.connect(gain);gain.connect(ctx.destination);src.start()}catch(e){src=null}}
function stop(){if(!src)return;const s=src,g=gain;src=null;try{g.gain.cancelScheduledValues(ctx.currentTime);g.gain.setValueAtTime(g.gain.value,ctx.currentTime);g.gain.linearRampToValueAtTime(0,ctx.currentTime+.5)}catch(e){}setTimeout(()=>{try{s.stop()}catch(e){}},600)}
return{isOn(){return on},load,start,stop,setVol(v){mv=v;if(typeof stgVol==='function')stgVol(v);if(gain&&src){try{gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.setValueAtTime(.7*mv,ctx.currentTime)}catch(e){}}},toggle(){on=!on;if(!on)stop();else if(stage==='menu')start();return on},vis(v){if(!ctx)return;try{v?ctx.resume():ctx.suspend()}catch(e){}}}})();
tapE.addEventListener('click',()=>{if(stage!=='tap')return;sfx.resume();stage='menu';tapE.style.display='none';menu.style.display='flex';mus.start()});
playB.addEventListener('click',()=>{sfx.resume();try{document.documentElement.requestFullscreen().then(()=>screen.orientation.lock('landscape')).catch(()=>{})}catch(e){}openMsel()});
muteB.addEventListener('click',()=>{muteB.classList.toggle('off',!mus.toggle())});
document.addEventListener('visibilitychange',()=>{mus.vis(!document.hidden);sfx.vis(!document.hidden);if(document.hidden&&typeof stgSync==='function')stgSync(false)});
const LK='dk_layout',EL={dpad:$('dpad'),bomb:bEl.bomb,slow:bEl.slow,shoot:bEl.shoot,game:$('g'),foe:bfC,throw:pvTh},edbar=$('edbar'),edPct=$('edPct');
let LY={},editing=false,drag=null,sel='dpad';
try{LY=JSON.parse(localStorage.getItem(LK))||{}}catch(e){LY={}}
function setT(k,x,y,s){const e=EL[k].style;e.translate=(x||y)?x+'px '+y+'px':'';e.scale=(s&&s!==1)?s:''}
function get(k){const v=LY[k]||[0,0,1];return[v[0]*innerWidth,v[1]*innerHeight,v[2]||1]}
function place(k,x,y,s){setT(k,x,y,s);const r=EL[k].getBoundingClientRect();
x+=r.left<0?-r.left:(r.right>innerWidth?innerWidth-r.right:0);y+=r.top<0?-r.top:(r.bottom>innerHeight?innerHeight-r.bottom:0);
setT(k,x,y,s);LY[k]=[x/innerWidth,y/innerHeight,s]}
function applyLY(){RC.clear();for(const k in EL){const[x,y,s]=get(k);setT(k,x,y,s)}}
function saveLY(){try{localStorage.setItem(LK,JSON.stringify(LY))}catch(e){}}
function updSel(){for(const k in EL)EL[k].classList.toggle('sel',editing&&k===sel);edPct.textContent=Math.round(get(sel)[2]*100)+'%'}
applyLY();addEventListener('resize',applyLY);addEventListener('orientationchange',()=>setTimeout(applyLY,200));
let fitK='';
function fitGame(force){const w=innerWidth,h=innerHeight;if(!w||!h)return;const key=w+'x'+h;if(!force&&key===fitK)return;fitK=key;
const vm=Math.min(w,h)/100,b=1.2*vm,m=2*vm;let cw,ch;
if(w>=h){ch=h-2*m-2.4*vm-2*b;cw=ch*W/H;const mx=w*.62-2*b;if(cw>mx){cw=mx;ch=cw*H/W}}
else{cw=w-2*m-2*b;ch=cw*H/W;const mh=h-50*vm-2*b;if(ch>mh){ch=mh;cw=ch*W/H}}
const r=document.documentElement.style;r.setProperty('--gw',cw.toFixed(2)+'px');r.setProperty('--gh',ch.toFixed(2)+'px');r.setProperty('--vw',w+'px');r.setProperty('--vh',h+'px');
RC.clear();applyLY()}
function fitSoon(){fitGame();for(const ms of [60,200,500,1000,2000])setTimeout(fitGame,ms)}
fitGame(true);
addEventListener('resize',fitSoon);addEventListener('orientationchange',fitSoon);addEventListener('pageshow',fitSoon);addEventListener('focus',fitSoon);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)fitSoon()});document.addEventListener('fullscreenchange',fitSoon);
if(window.visualViewport)visualViewport.addEventListener('resize',fitSoon);
if(window.ResizeObserver)new ResizeObserver(()=>fitGame()).observe(document.documentElement);
setInterval(fitGame,700);
function keyOf(t){if(!t.closest)return null;const b=t.closest('.b');if(b)return b.dataset.k;if(t.closest('#dpad'))return 'dpad';if(t.closest('#pvC'))return 'foe';if(t.closest('#pvThrow'))return 'throw';return t.closest('#g')?'game':null}
document.addEventListener('pointerdown',e=>{if(!editing||drag)return;const k=keyOf(e.target);if(!k)return;e.stopPropagation();e.preventDefault();
sel=k;updSel();const[ox,oy]=get(k);drag={k,id:e.pointerId,sx:e.clientX,sy:e.clientY,ox,oy}},true);
document.addEventListener('pointermove',e=>{if(!editing||!drag||e.pointerId!==drag.id)return;
place(drag.k,drag.ox+e.clientX-drag.sx,drag.oy+e.clientY-drag.sy,get(drag.k)[2])},true);
['pointerup','pointercancel'].forEach(n=>document.addEventListener(n,e=>{if(drag&&e.pointerId===drag.id){drag=null;saveLY()}},true));
function zoom(d){const[x,y,s]=get(sel);place(sel,x,y,Math.max(.5,Math.min(2,Math.round((s+d)*100)/100)));saveLY();updSel()}
function editOn(){editing=true;document.body.classList.add('ed');edbar.style.display='flex';updSel()}
function editOff(){RC.clear();editing=false;drag=null;document.body.classList.remove('ed');edbar.style.display='none';updSel();saveLY()}
const SK='dk_set',ST={mus:1,sfx:1,fps:false,ping:true,ctl:'auto',rec:true},setE=$('set'),fpsE=$('fps');
try{Object.assign(ST,JSON.parse(localStorage.getItem(SK))||{})}catch(e){}
const saveST=()=>{try{localStorage.setItem(SK,JSON.stringify(ST))}catch(e){}};

if(ST.keys)Object.assign(KBM,ST.keys);if(ST.play)Object.assign(KPLAY,ST.play);
const KN={up:'Lên',down:'Xuống',left:'Trái',right:'Phải',shoot:'Bắn',bomb:'Bomb',slow:'Chậm',pause:'Tạm dừng',n1:'PVP: Chủ lực quấy rối',n2:'PVP: Chủ lực sát thương',n3:'PVP: Nade',n4:'PVP: Smoke'};
const AR={ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',ShiftLeft:'Shift'},kname=c=>AR[c]||c.replace(/^(Key|Digit)/,'').replace(/(Left|Right)$/,x=>x==='Left'?' trái':' phải');
const kbSec=$('kbSec');
function kbDraw(){kbSec.innerHTML='<h3>PHÍM</h3>'+Object.keys(KN).map(a=>'<div class="kr"><span>'+KN[a]+'</span><button class="kb'+(kbCap&&kbCap.a===a?' cap':'')+'" data-a="'+a+'">'+(kbCap&&kbCap.a===a?'Nhấn phím…':kname(KBM[a]))+'</button></div>').join('')+'<h3>CÁCH CHƠI</h3><div class="kr fl"><span>Bắn</span><button class="kb" data-t="tgS">'+(KPLAY.tgS?'Bật/tắt':'Giữ phím')+'</button></div><div class="kr fl"><span>Chậm (Shift)</span><button class="kb" data-t="tgW">'+(KPLAY.tgW?'Bật/tắt':'Giữ phím')+'</button></div><div class="kr fl"><span></span><button class="kb" data-r="1">Đặt lại phím</button></div>'}
function kbSave(){ST.keys={...KBM};ST.play={...KPLAY};saveST()}
kbSec.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
if(b.dataset.t){KPLAY[b.dataset.t]=KPLAY[b.dataset.t]?0:1;K.shoot=K.slow=0;kbSave();kbDraw();return}
if(b.dataset.r){Object.assign(KBM,KBD);kbSave();kbDraw();return}
const a=b.dataset.a;kbCap=Object.assign(ev=>{if(ev.key==='Escape'){kbCap=null;kbDraw();return}const c=kcode(ev),o=Object.keys(KBM).find(k=>KBM[k]===c);if(o&&o!==a)KBM[o]=KBM[a];KBM[a]=c;kbCap=null;kbSave();kbDraw()},{a});kbDraw()});
const ctlT=$('ctlT'),CTL_N={auto:'Tự động',pc:'Bàn phím (PC)',touch:'Cảm ứng'};
function isPC(){return ST.ctl==='pc'||(ST.ctl!=='touch'&&ISPC)}
function applyCtl(){const pc=isPC();document.body.classList.toggle('pc',pc);ctlT.textContent=CTL_N[ST.ctl]||CTL_N.auto;if(ST.ctl==='auto')ctlT.textContent+=' ('+(ISPC?'PC':'Cảm ứng')+')';if(pc)kbDraw();else kbSec.innerHTML='';if(typeof fitSoon==='function')fitSoon()}
ctlT.addEventListener('click',()=>{ST.ctl=ST.ctl==='auto'?'pc':ST.ctl==='pc'?'touch':'auto';K.shoot=K.slow=0;saveST();applyCtl()});
applyCtl();
mus.setVol(ST.mus);sfx.setVol(ST.sfx);
function slider(id,pc,init,cb,end){const el=$(id),fi=el.children[0],th=el.children[1],lab=$(pc);let on=false;
const show=v=>{fi.style.width=v*100+'%';th.style.left=v*100+'%';lab.textContent=Math.round(v*100)+'%'};
const val=e=>{const r=el.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))};
show(init);
el.addEventListener('pointerdown',e=>{on=true;el.setPointerCapture(e.pointerId);const v=val(e);show(v);cb(v);e.preventDefault()});
el.addEventListener('pointermove',e=>{if(!on)return;const v=val(e);show(v);cb(v)});
['pointerup','pointercancel'].forEach(n=>el.addEventListener(n,()=>{if(on){on=false;end()}}))}
slider('slM','pcM',ST.mus,v=>{ST.mus=v;mus.setVol(v)},saveST);
slider('slS','pcS',ST.sfx,v=>{ST.sfx=v;sfx.setVol(v)},()=>{saveST();sfx.resume();sfx.shot()});
const fpsT=$('fpsT');
function applyFps(){fpsT.classList.toggle('on',!!ST.fps);fpsE.style.display=ST.fps?'block':'none';document.body.classList.toggle('fpsOn',!!ST.fps)}applyFps();
fpsT.addEventListener('click',()=>{ST.fps=!ST.fps;applyFps();saveST()});
const pingT=$('pingT'),pingE=$('ping');
function applyPing(){pingT.classList.toggle('on',!!ST.ping);pingDraw()}applyPing();
pingT.addEventListener('click',()=>{ST.ping=!ST.ping;applyPing();saveST()});
const recT=$('recT');function applyRec(){recT.classList.toggle('on',!!ST.rec)}applyRec();recT.addEventListener('click',()=>{ST.rec=!ST.rec;applyRec();saveST()});

const cs=document.createElement('style');cs.textContent='#ver{position:fixed;left:max(1.2vw,env(safe-area-inset-left));bottom:1.2vh;right:auto;z-index:99999;display:flex;flex-direction:column;align-items:flex-start;line-height:1.05;pointer-events:none;user-select:none;-webkit-user-select:none;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;text-shadow:0 0 3px #000,0 0 6px #0008}#ver b{font-size:clamp(18px,4.6vh,32px);font-weight:900;font-style:normal;letter-spacing:.04em;color:#ff2a2a}#ver i{font-size:clamp(10px,2.4vh,15px);font-style:normal;font-weight:400;color:#fff;opacity:.75;letter-spacing:.03em}';document.head.appendChild(cs);
const openSet=()=>{setE.style.display='flex'},closeSet=()=>{setE.style.display='none'};
$('gear').addEventListener('click',openSet);
$('stDone').addEventListener('click',closeSet);

$('stEdit').addEventListener('click',()=>{closeSet();editOn()});
$('edDone').addEventListener('click',editOff);
$('edMinus').addEventListener('click',()=>zoom(-.1));
$('edPlus').addEventListener('click',()=>zoom(.1));
$('edReset').addEventListener('click',()=>{LY={};applyLY();saveLY();updSel()});
(async()=>{const set=v=>{$('bar').style.width=(v*100)+'%';$('pct').textContent=Math.round(v*100)+'%'};
set(.05);await new Promise(r=>setTimeout(r,200));
await mus.load(set);await sfx.load();
try{await Promise.all([$('tlogo').decode(),$('mlogo').decode(),EMJ.decode(),...CHS.flatMap(c=>c.im.concat(c.ov||[])).map(i=>i.decode()),HBK.decode(),HBR.decode(),AXI.decode(),$('cpH').decode(),$('cpJ').decode(),$('cpS').decode()])}catch(e){}
set(1);await new Promise(r=>setTimeout(r,600));
loadE.style.display='none';tapE.style.display='flex';stage='tap'})();
const csel=$('csel'),cCards=[...document.querySelectorAll('.cc')];
function cFocus(i){CH=i;cCards.forEach((c,j)=>c.classList.toggle('sel',j===i))}
function openCsel(){csel.style.display='flex';cFocus(CH);opChipUpd()}
function closeCsel(){csel.style.display='none';if(GM==='mp'){mpSend({t:'quit'});mpReset();openRoom()}else openMsel()}
function goStart(){if(GM==='mp')mpReadyUp();else start()}
cCards.forEach((c,i)=>c.addEventListener('click',()=>{if(CH===i)goStart();else{sfx.resume();cFocus(i)}}));
$('cGo').addEventListener('click',()=>goStart());
$('cBack').addEventListener('click',closeCsel);
addEventListener('keydown',e=>{if(csel.style.display!=='flex')return;
if(e.key==='ArrowLeft'||e.key==='ArrowRight'){cFocus((CH+(e.key==='ArrowRight'?1:2))%3)}
else if(e.key==='Enter'){goStart()}
else if(e.key==='Escape'){closeCsel()}
else return;
e.stopImmediatePropagation();e.preventDefault()},true);
const msel=$('msel'),mCards=[...document.querySelectorAll('#mTabs .mt')],mPanes=[$('mpCamp'),$('mpPvp')],rmNote=$('rmNote'),rmNameE=$('rmName');let GM='camp',mCur=0;
function mcRec(){$('mcRec').innerHTML='<span>KỶ LỤC</span><b>'+(((PR.camp&&PR.camp.best)|0))+'</b>'}
function rmInfo(){rmNameE.textContent='Tên của bạn: '+profName()}
function mcFocus(i){mCur=i;rmNote.textContent='';mCards.forEach((c,j)=>c.classList.toggle('sel',j===i));mPanes.forEach((p,j)=>p.style.display=j===i?'flex':'none');rmNameE.style.visibility=i?'visible':'hidden';if(i===0)mcRec();else rmInfo()}
function openMsel(i){FK.on=0;msel.style.display='flex';mcFocus(i==null?mCur:i)}
function closeMsel(){msel.style.display='none'}
function mcPick(){GM='camp';closeMsel();openCsel()}
mCards.forEach((c,i)=>c.addEventListener('click',()=>{sfx.resume();if(mCur===i&&i===0)mcPick();else mcFocus(i)}));
$('mpCamp').addEventListener('click',()=>{sfx.resume();mcPick()});
function mBackGo(){closeMsel()}
$('mBack').addEventListener('click',mBackGo);
addEventListener('keydown',e=>{if(msel.style.display!=='flex')return;
if(e.key==='Escape')mBackGo();

else if(e.key==='ArrowLeft'||e.key==='ArrowRight')mcFocus((mCur+1)%2);
else if(e.key==='Enter'){if(mCur===0)mcPick();else if(mCur===1){sfx.resume();openLob('pvp')}}
else return;
e.stopImmediatePropagation();e.preventDefault()},true);
const mItems=[$('play'),$('setB'),$('profB')];let mSel=0;
function mFocus(i){mSel=i;mItems.forEach((b,j)=>b.classList.toggle('sel',j===i))}
mItems.forEach((b,i)=>{b.addEventListener('pointerenter',()=>mFocus(i));b.addEventListener('pointerdown',()=>mFocus(i))});
$('setB').addEventListener('click',()=>{sfx.resume();openSet()});
addEventListener('keydown',e=>{if(stage!=='menu'||editing||state==='play'||menu.style.display==='none'||msel.style.display==='flex'||prof.style.display==='flex')return;
if(setE.style.display==='flex'){if(e.key==='Enter'||e.key==='Escape'){e.stopImmediatePropagation();closeSet()}return}
if(e.key==='ArrowUp'||e.key==='ArrowDown')mFocus((mSel+(e.key==='ArrowDown'?1:2))%3);
else if(e.key==='Enter'&&mSel===1){e.stopImmediatePropagation();openSet()}
else if(e.key==='Enter'&&mSel===2){e.stopImmediatePropagation();openProf()}},true);

// ================= MULTIPLAYER PVP (PeerJS, 1 phòng = 2 người) =================
const mpWait=$('mpWait'),CODE_CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LB={open:0,mode:'pvp',bot:0,q:null};
const genCode=()=>Array.from({length:5},()=>CODE_CH[Math.floor(Math.random()*CODE_CH.length)]).join('');

const roomOn=()=>!!LB.open;
function openRoom(){openLob(LB.mode)}
function closeRoom(){LB.open=0;$('lob').style.display='none';msel.style.display='none';lobPres(0)}
function mpSend(m){const c=MP.conn;if(c&&c.open){try{c.send(m)}catch(e){}}}
function mpReset(){try{MP.conn&&MP.conn.close()}catch(e){}try{MP.peer&&MP.peer.destroy()}catch(e){}clearTimeout(MP.joinT);
Object.assign(MP,{rn:'Đối thủ',on:0,host:0,peer:null,conn:null,open:0,code:'',ready:0,rready:0,rq:0,grp:[],f:0,quick:0,op:null});mpWait.style.display='none';$('pzS').style.display='';lobDraw()}
function mpNoLib(){if(RELAY_URL||window.Peer)return 0;rmNote.textContent='Không tải được thư viện mạng — kiểm tra Internet rồi thử lại';return 1}
function lobHost(cb){if(MP.open){rmNote.textContent='Phòng đã đủ người';return}
if(MP.host&&MP.code){cb&&cb();return}
if(MP.host&&!MP.code){LB.q=cb||null;return}
if(mpNoLib())return;mpReset();LB.bot=0;LB.q=cb||null;MP.host=1;lobDraw();
const make=n=>{const code=genCode(),p=mkPeer('daikai-'+code);MP.peer=p;
p.on('open',()=>{MP.code=code;lobDraw();const q=LB.q;LB.q=null;if(q)q()});
p.on('connection',c=>{if(MP.conn&&MP.open){c.on('open',()=>{try{c.send({t:'full'})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},300)});return}mpAttach(c)});
p.on('error',e=>{if(e.type==='unavailable-id'&&n<6){try{p.destroy()}catch(_){}make(n+1)}else rmNote.textContent='Lỗi mạng: '+(e.type||e)});
p.on('disconnected',()=>{try{p.reconnect()}catch(_){}})};make(0)}

function mpJoin(code){code=(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length!==5){rmNote.textContent='Mã phòng gồm 5 ký tự';return}if(mpNoLib())return;
mpReset();MP.host=0;LB.bot=0;$('lbMsg').textContent='';$('lbJoinV').style.display='none';rmNote.textContent='Đang kết nối…';
const p=mkPeer();MP.peer=p;
p.on('open',()=>{const c=p.connect('daikai-'+code,{reliable:true,serialization:'json'});mpAttach(c);
MP.joinT=setTimeout(()=>{if(!MP.open){rmNote.textContent='Không vào được phòng '+code+' (hết thời gian)';try{c.close()}catch(e){}try{p.destroy()}catch(e){}if(MP.peer===p){MP.peer=null;MP.conn=null}}},12000)});
p.on('error',e=>{rmNote.textContent=e.type==='peer-unavailable'?'Không tìm thấy phòng '+code:'Lỗi mạng: '+(e.type||e);try{p.destroy()}catch(_){}if(MP.peer===p){MP.peer=null;MP.conn=null}})}

function mpAttach(c){MP.conn=c;
c.on('open',()=>{MP.open=1;MP.lastRx=performance.now();clearTimeout(MP.joinT);rmNote.textContent='';$('lbMsg').textContent='';lobDraw();mpSend(hiMsg(MM.on?1:0))});
c.on('data',mpRecv);c.on('close',mpLost);c.on('error',mpLost)}

function mpLost(){if(!MP.open)return;MP.open=0;if(MM.on){MP.conn=null;return}
if(MP.on&&state==='play'&&!PV.fin&&PV.ph==='end'&&(PV.sp>=PV_WIN||PV.sb>=PV_WIN)){pvNext();return}
if(MP.on&&state==='play'&&!PV.fin){PV.msg='ĐỐI THỦ ĐÃ THOÁT — BẠN THẮNG';PV.fin=1;profRecord('online','W',PV.sp,PV.sb,MP.rn,1);mpReset();over();return}
if(MP.host&&MP.code&&roomOn()){MP.conn=null;MP.op=null;MP.rn='Đối thủ';lobDraw();rmNote.textContent='Đối thủ đã rời phòng';return}
const inSel=csel.style.display==='flex'||mpWait.style.display==='flex';mpReset();
if(inSel){csel.style.display='none';openRoom();rmNote.textContent='Đối thủ đã rời phòng'}else if(roomOn()){lobDraw();lobEnsure();rmNote.textContent='Đối thủ đã rời phòng'}}
function mpReadyUp(){if(MP.ready||!MP.open)return;MP.ready=1;mpSend({t:'ready',ch:CH,lo:pvLoList(PV_LO)});mpWait.style.display='flex';mpTryGo()}
function mpTryGo(){if(MP.ready&&MP.rready&&MP.host){mpSend({t:'go'});mpBegin()}}
function mpBegin(){mpWait.style.display='none';MP.ready=MP.rready=0;MP.on=1;GM='mp';MP.f=0;MP.rq=0;MP.grp=[];$('pzS').style.display='none';start()}
function mpRecv(m){if(!m||!m.t)return;MP.lastRx=performance.now();
switch(m.t){
case 'hi':MP.rn=String(m.n||'Đối thủ').slice(0,12);MP.op=opSan(m);if(MM.on){mmMatched(m);break}lobDraw();break;
case 'full':rmNote.textContent='Phòng đã đủ người';mpReset();break;
case 'pick':if(!MP.host&&MP.open&&!MP.ready&&!MP.on&&(LB.open||MP.quick)){closeRoom();GM='mp';mpReadyUp()}break;
case 'ready':MP.rready=1;MP.rch=m.ch|0;MP.rlo=pvLoOk(m.lo)?m.lo:null;mpTryGo();break;
case 'go':if(!MP.host&&MP.ready)mpBegin();break;
case 's':MP.nS++;if(MP.on)mpApply(m);break;
case 'grp':if(MP.on&&m.rd===PV.rd)for(const j of m.l)PV.sch.push(j);break;
case 'q':if(MP.on&&PV.ph==='fight'&&m.rd===PV.rd&&PV.qP.length<14)PV.qP.push(m.k);break;
case 'th':if(MP.on&&PV.ph==='fight'&&m.rd===PV.rd&&PV.loB.includes(m.k)){const tx=Math.max(12,Math.min(W-12,P.x)),ty=Math.max(24,Math.min(H-14,P.y));pvPr.push({k:m.k,own:'b',x:tx,y:-12,x0:tx,y0:-12,tx,ty,t:0,T:34})}break;
case 'dead':if(MP.on&&m.rd===PV.rd){if(PV.ph!=='end')pvEnd(1,1);else if(PV.win===0){PV.sb--;PV.win=2}}break;
case 'tmo':if(MP.on&&!MP.host&&m.rd===PV.rd&&PV.ph==='fight'){PV.note='HẾT 30s: CẢ HAI BỊ HẠ — ĐIỂM '+m.b+' : '+m.a;PV.noteT=150;pvEnd(m.w?0:1,1)}break;
case 'p':mpSend({t:'pong',ts:m.ts});break;
case 'pong':{const r=performance.now()-m.ts;if(r>=0&&r<10000){if(MP.rtt<0)MP.rtt=r;else{MP.jit+=(Math.abs(r-MP.rtt)-MP.jit)*.25;MP.rtt+=(r-MP.rtt)*.3}}break}
case 'quit':mpLost();break}}
function mpSnap(){const R=Math.round,o={t:'s',x:R(P.x),y:R(P.y),m:CH===2?P.bb:P.mana,iv:P.inv>0?R(P.inv):0,st:P.stun>0?R(P.stun):0,bp:R(pvBp),sc:score-PV.sc0,q:PV.qP.length};
o.e=[];for(const a of en){const k=EK.indexOf(a.ek);if(k>=0&&a.y>-40)o.e.push(k,R(a.x),R(a.y))}
o.b=[];for(let i=0;i<eb.length&&o.b.length<900;i++){const a=eb[i];if(a.x>-10&&a.x<W+10&&a.y>-10&&a.y<H+10)o.b.push(a.c|0,R(a.x),R(a.y))}
o.f=[];for(const a of fbs)o.f.push(R(a.x),R(a.y));
o.r=[];for(const a of rk)o.r.push(R(a.x),R(a.y),R(a.a*100),R(a.r));
o.z=[];for(const a of zn)o.z.push(a.k==='w'?0:1,R(a.x),R(a.y),a.r,a.t,a.life);
o.sm=[];for(const a of pvSm)o.sm.push(R(a.x),R(a.y),a.t,a.life);
o.mo=[];for(const a of pvMo)o.mo.push(R(a.y),a.t,a.life);
o.ic=[];for(const a of pvIc)o.ic.push(R(a.x),R(a.y),a.w,a.h,a.t,a.life);o.ts=pvTs?[pvTs.t,pvTs.life]:[];o.tk=[];if(pvTs)for(const k of pvTs.st)o.tk.push(R(k.x),R(k.y),k.t,k.T);
o.sd=[];for(const a of pvSh)o.sd.push(R(a.x),R(a.y));
o.p=[];for(let i=0;i<pb.length&&o.p.length<80;i++)o.p.push(R(pb[i].x),R(pb[i].y));
o.tr=[];for(let i=0;i<tr.length&&i<16;i++){const q=tr[i];o.tr.push(R(q.x0),R(q.y0),R(q.x1),R(q.y1),q.a)}
mpSend(o)}
function mpApply(m){const B=BF;if(!B)return;const s=B.sh,dx=m.x-s.tx;
s.ln=(s.ln||0)+((Math.abs(dx)<.5?0:Math.sign(dx))-(s.ln||0))*.5;s.tx=m.x;s.ty=m.y;s.mana=m.m;s.inv=m.iv;s.stun=m.st;s.bp=m.bp;s.fb2=0;PV.bs=m.sc;MP.rq=m.q;
B.en=[];for(let i=0;i<m.e.length;i+=3)B.en.push({k:EK[m.e[i]],x:m.e[i+1],y:m.e[i+2]});
B.eb=[];for(let i=0;i<m.b.length;i+=3)B.eb.push({x:m.b[i+1],y:m.b[i+2],r:5,col:BC[m.b[i]]||'#fff'});
B.fb=[];for(let i=0;i<m.f.length;i+=2)B.fb.push({x:m.f[i],y:m.f[i+1]});
B.rk=[];for(let i=0;i<m.r.length;i+=4)B.rk.push({x:m.r[i],y:m.r[i+1],a:m.r[i+2]/100,r:m.r[i+3],p:RKP});
B.zn=[];B.pu=[];for(let i=0;i<m.z.length;i+=6){const z={x:m.z[i+1],y:m.z[i+2],r:m.z[i+3],t:m.z[i+4],life:m.z[i+5]};(m.z[i]?B.zn:B.pu).push(z)}
B.sm=[];for(let i=0;i<m.sm.length;i+=4)B.sm.push({x:m.sm[i],y:m.sm[i+1],r:100,t:m.sm[i+2],life:m.sm[i+3]});
B.mo=[];for(let i=0;i<m.mo.length;i+=3)B.mo.push({y:m.mo[i],t:m.mo[i+1],life:m.mo[i+2]});
{const ic=m.ic||[];B.ice=[];for(let i=0;i<ic.length;i+=6)B.ice.push({x:ic[i],y:ic[i+1],w:ic[i+2],h:ic[i+3],t:ic[i+4],life:ic[i+5]});const ts=m.ts||[],tk=m.tk||[];if(ts.length){B.ts={t:ts[0],life:ts[1],st:[]};for(let i=0;i<tk.length;i+=4)B.ts.st.push({x:tk[i],y:tk[i+1],t:tk[i+2],T:tk[i+3]})}else B.ts=null}
B.sd=[];for(let i=0;i<m.sd.length;i+=2)B.sd.push({x:m.sd[i],y:m.sd[i+1]});
B.pb=m.p;{const t=m.tr||[];B.tr=[];for(let i=0;i<t.length;i+=5)B.tr.push({x0:t[i],y0:t[i+1],x1:t[i+2],y1:t[i+3],a:t[i+4],D:Math.max(1,Math.hypot(t[i+2]-t[i],t[i+3]-t[i+1]))})}}
function mpBfStep(){const B=BF,s=B.sh;B.t++;if(B.tr){for(const q of B.tr)q.a++;B.tr=B.tr.filter(q=>(q.a+1)*110-36<q.D)}s.x+=(s.tx-s.x)*.5;s.y+=(s.ty-s.y)*.5;
for(const q of B.pr){q.t++;if(q.t>=q.T){q.done=1;bfDet(q)}}B.pr=B.pr.filter(q=>!q.done);
for(const a of B.sm)a.t++;for(const a of B.mo)a.t++;for(const a of B.zn)a.t++;for(const a of B.pu)a.t++;for(const a of B.ice)a.t++;if(B.ts){B.ts.t++;for(const k of B.ts.st)k.t++}if(B.flash>0)B.flash--}
setInterval(()=>{if(!MP.conn||!MP.open){MP.rtt=-1;MP.jit=0;MP.rate=0;MP.nS=0;return}mpSend({t:'p',ts:performance.now()});MP.rate=MP.nS;MP.nS=0;if(performance.now()-MP.lastRx>10000)mpLost()},1000);
function pingDraw(){const on=!!(ST.ping&&MP.on&&state==='play');pingE.style.display=on?'block':'none';if(!on)return;let t,c='#aaa';
if(!MP.conn||!MP.open){t='PING --'}
else{const q=performance.now()-MP.lastRx;
if(q>3000){t='PING -- mất tín hiệu '+Math.round(q/1000)+'s';c='#f55'}
else if(MP.rtt<0){t='PING ...';c='#fb3'}
else{const r=Math.round(MP.rtt);t='PING '+r+'ms';c=r<=120?'#6f6':r<=250?'#fb3':'#f55'}}
pingE.textContent=t;pingE.style.color=c}

setInterval(pingDraw,500);

$('rmGo').addEventListener('click',()=>mpJoin($('rmInp').value));
$('rmInp').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();mpJoin($('rmInp').value)}});
$('rmInp').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'')});

$('mpWaitX').addEventListener('click',()=>{mpSend({t:'quit'});mpReset();csel.style.display='none';openRoom()});

// ================= GHÉP TRẬN NHANH (không cần mã phòng) =================
// Không cần server riêng: có vài "slot" cố định (daikai-n1..3). Ai đến trước giữ slot và chờ,
// người sau thấy slot đã có chủ thì tự kết nối vào. Sau 45s không ai thì gặp Bot.
const MM={on:0,g:0,t0:0,tick:0,casual:0},mmE=$('mmWait'),mmId=(t,n)=>'daikai-n'+n,sleep=ms=>new Promise(r=>setTimeout(r,ms));
const mmLive=g=>MM.on&&MM.g===g;
function mmDrop(){try{MP.conn&&MP.conn.close()}catch(e){}try{MP.peer&&MP.peer.destroy()}catch(e){}MP.conn=null;MP.peer=null;MP.open=0;MP.host=0}
function mmUi(){const s=Math.floor((performance.now()-MM.t0)/1000);$('mmTm').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
$('mmInfo').textContent='Ghép ngẫu nhiên · tìm đối thủ';if(s>=45&&!MM.bot){MM.bot=1;mmBotMatch()}}
function mmStart(c){if(mpNoLib())return;mpReset();FK.on=0;MM.bot=0;MM.on=1;MM.g++;MM.t0=performance.now();closeRoom();mmE.style.display='flex';$('mmIc').src=LB_PORT[CH];mmUi();clearInterval(MM.tick);MM.tick=setInterval(mmUi,500);mmLoop(MM.g)}
function mmStop(){MM.on=0;MM.g++;clearInterval(MM.tick);mmE.style.display='none'}
function mmCancel(){mmStop();mpReset();openRoom()}
function mmMatched(m){if(!MM.on)return;mmStop();MP.quick=1;if(MP.host){mpSend({t:'pick'});GM='mp';mpReadyUp()}}
// kết nối thử (song song) tới các slot; ai trả lời 'hi' trước thì thắng
function mmScan(ids,g,ms){return new Promise(res=>{let fin=0,p=null;const S={done:0,c:null},cs=[];
const end=ok=>{if(fin)return;fin=1;clearTimeout(tm);if(!ok){try{p&&p.destroy()}catch(e){}}res(ok)};const tm=setTimeout(()=>end(0),ms);
try{p=mkPeer()}catch(e){end(0);return}
p.on('error',()=>{});
p.on('open',()=>{if(fin||!mmLive(g)){end(0);return}
for(const id of ids){const c=p.connect(id,{reliable:true,serialization:'json'});cs.push(c);
c.on('open',()=>{try{c.send(hiMsg(1))}catch(e){}});
c.on('data',m=>{if(S.done){if(S.c===c)mpRecv(m);return}
if(m&&m.t==='hi'&&!fin&&mmLive(g)){S.done=1;S.c=c;for(const o of cs)if(o!==c){try{o.close()}catch(e){}}
MP.peer=p;MP.conn=c;MP.host=0;MP.open=1;MP.lastRx=performance.now();c.on('close',mpLost);c.on('error',mpLost);end(1);mpRecv(m)}
else if(m&&m.t==='full'){try{c.close()}catch(e){}}})}})})}
// giữ 1 slot: 'host' = giữ được · 'taken' = đã có chủ · 'err' = lỗi mạng
function mmTryClaim(id,g){return new Promise(res=>{let done=0,p=null;const tm=setTimeout(()=>{if(done)return;done=1;try{p.destroy()}catch(e){}res('err')},6000);
try{p=mkPeer(id)}catch(e){clearTimeout(tm);res('err');return}
p.on('open',()=>{if(done)return;done=1;clearTimeout(tm);if(!mmLive(g)){try{p.destroy()}catch(e){}res('err');return}
MP.peer=p;MP.host=1;
p.on('connection',c=>{if(MP.conn&&MP.open){c.on('open',()=>{try{c.send({t:'full'})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},300)});return}mpAttach(c)});
res('host')});
p.on('error',e=>{if(!done){done=1;clearTimeout(tm);try{p.destroy()}catch(_){}res(e.type==='unavailable-id'?'taken':'err')}});
p.on('disconnected',()=>{try{p.reconnect()}catch(_){}})})}
async function mmLoop(g){const mine=0;
while(mmLive(g)){
if(!mmLive(g))return;let hosted=0;
for(let n=1;n<=3&&mmLive(g);n++){const id=mmId(mine,n),st=await mmTryClaim(id,g);
if(st==='host'){hosted=1;const t=performance.now(),w=7000+Math.random()*4000;while(mmLive(g)&&performance.now()-t<w)await sleep(150);if(mmLive(g))mmDrop();break}
if(st==='taken'){if(await mmScan([id],g,3000))return;continue}
await sleep(1500);break}
if(mmLive(g)&&!hosted)await sleep(800+Math.random()*1200)}}
$('mmX').addEventListener('click',mmCancel);
const FN_L=['minhkhoa','Hachi_fan','NamAnh22','ZeroTwo','tuan.dev','Kuroneko','phuc1807','Yuki_VN','DatNguyen','bao_pro','Shirohime','LinhChi','hoangkun','Sakura_x','trungg','Kaito99','nhatminh','Reimu_VN','mai.anh','Daiki_07','quangvu','Tsuki','vietanh02','MeoMeo','Haru_chan','thanhtam','Kazuma','dukhanh','ngocanh.k','Rin_chan'];
function fakeName(){let n;do{n=Math.random()<.4?'Player'+(1000+Math.floor(Math.random()*9000)):FN_L[Math.floor(Math.random()*FN_L.length)]}while(n===profName());return n.slice(0,12)}
function mmBotMatch(){mmStop();mpReset();FK.on=1;FK.name=fakeName();const rw=n=>Math.floor(Math.random()*n);FK.av='p'+rw(AV_N);FK.op={n:FK.name,a:FK.av,u:'',w:8+rw(40),l:6+rw(35),d:rw(4)};GM='pvp';closeRoom();start()}
addEventListener('keydown',e=>{if(!MM.on)return;if(e.key==='Escape'){mmCancel();e.stopImmediatePropagation();e.preventDefault()}},true);

// ================= REPLAY (quay video 2 sân, lưu IndexedDB, giữ 5 trận gần nhất) =================
const RP={rec:null},RP_MAX=5;let rpDb=null;
const rpOpen=()=>new Promise(res=>{if(rpDb)return res(rpDb);try{const q=indexedDB.open('dk_replay',1);q.onupgradeneeded=()=>q.result.createObjectStore('r');q.onsuccess=()=>{rpDb=q.result;res(rpDb)};q.onerror=()=>res(null)}catch(e){res(null)}});
const rpTx=(mode,fn)=>rpOpen().then(db=>new Promise(res=>{if(!db)return res(null);try{const tx=db.transaction('r',mode),rq=fn(tx.objectStore('r'));tx.oncomplete=()=>res(rq&&rq.result!==undefined?rq.result:true);tx.onerror=tx.onabort=()=>res(null)}catch(e){res(null)}}));
const rpPut=(id,v)=>rpTx('readwrite',s=>s.put(v,id)),rpGet=id=>rpTx('readonly',s=>s.get(id)),rpDel=id=>rpTx('readwrite',s=>s.delete(id)),rpKeys=()=>rpTx('readonly',s=>s.getAllKeys());
function rpDrop(id){let ch=0;PR.hist.forEach(h=>{if(h.rep===id){delete h.rep;ch=1}});if(ch)saveP()}
async function rpPrune(){const ks=await rpKeys();if(!Array.isArray(ks))return;ks.sort((a,b)=>b-a);for(const k of ks.slice(RP_MAX)){await rpDel(k);rpDrop(k)}if(prof.style.display==='flex')profDraw()}
function rpFrame(R){try{const x=R.cx,nm=pvNames();x.fillStyle='#111';x.fillRect(0,0,768,478);x.drawImage(cv,0,30,384,448);x.drawImage(bfC,384,30,384,448);x.fillStyle='#fff';x.font='bold 17px sans-serif';x.textBaseline='middle';x.textAlign='left';x.fillText(nm[0],10,15);x.textAlign='right';x.fillText(nm[1],758,15);x.textAlign='center';x.fillText(PV.sp+' : '+PV.sb,384,15);if(R.size>6e7&&R.mr.state==='recording')R.mr.stop()}catch(e){}}
function rpStart(){rpDiscard();if(!ST.rec||!window.MediaRecorder)return;
try{const mt=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'].find(m=>MediaRecorder.isTypeSupported(m));if(!mt)return;
const k=document.createElement('canvas');k.width=768;k.height=478;const R={cx:k.getContext('2d'),ch:[],size:0,mime:mt,id:Date.now(),tm:0};
R.mr=new MediaRecorder(k.captureStream(24),{mimeType:mt,videoBitsPerSecond:650000});
R.mr.ondataavailable=e=>{if(e.data&&e.data.size){R.ch.push(e.data);R.size+=e.data.size}};
R.mr.start(2000);rpFrame(R);R.tm=setInterval(()=>rpFrame(R),42);RP.rec=R}catch(e){RP.rec=null}}
function rpStop(){const R=RP.rec;if(!R)return 0;RP.rec=null;clearInterval(R.tm);
const fin=()=>{if(!R.ch.length||R.size>9e7){rpDrop(R.id);return}rpPut(R.id,{b:new Blob(R.ch,{type:R.mime}),m:R.mime}).then(ok=>{if(ok===null)rpDrop(R.id);else rpPrune()})};
if(R.mr.state!=='inactive'){R.mr.onstop=fin;try{R.mr.stop()}catch(e){fin()}}else fin();return R.id}
function rpDiscard(){const R=RP.rec;if(!R)return;RP.rec=null;clearInterval(R.tm);try{R.mr.ondataavailable=null;if(R.mr.state!=='inactive')R.mr.stop()}catch(e){}}
const rpVE=$('rpV'),rpVid=$('rpVid');let rpUrl='';
async function rpPlay(id,label){const r=await rpGet(id);if(!r||!r.b){pfNote.textContent='Không tìm thấy bản ghi của trận này';rpDrop(id);profDraw();return}
rpUrl=URL.createObjectURL(r.b);rpVid.muted=true;rpVid.playbackRate=1;rpSpd(1);rpVid.onloadedmetadata=()=>{if(rpVid.duration===Infinity){rpVid.currentTime=1e101;rpVid.ontimeupdate=()=>{rpVid.ontimeupdate=null;rpVid.currentTime=0;rpVid.play().catch(()=>{})}}else rpVid.play().catch(()=>{})};
rpVid.src=rpUrl;$('rpT').textContent=label||'';rpVE.style.display='flex'}
function rpClose(){rpVid.pause();rpVid.onloadedmetadata=rpVid.ontimeupdate=null;rpVid.removeAttribute('src');rpVid.load();if(rpUrl){URL.revokeObjectURL(rpUrl);rpUrl=''}rpVE.style.display='none'}
function rpSpd(s){rpVid.playbackRate=s;document.querySelectorAll('#rpSp button').forEach(b=>b.classList.toggle('on',+b.dataset.s===s))}
document.querySelectorAll('#rpSp button').forEach(b=>b.addEventListener('click',()=>rpSpd(+b.dataset.s)));
$('rpX').addEventListener('click',rpClose);
$('pfHist').addEventListener('click',e=>{const b=e.target.closest('.hp');if(!b)return;sfx.resume();const row=b.closest('.hr');rpPlay(+b.dataset.r,row?row.querySelector('.ho').textContent:'')});
addEventListener('keydown',e=>{if(rpVE.style.display!=='flex')return;if(e.key==='Escape')rpClose();else if(e.key===' '){rpVid.paused?rpVid.play():rpVid.pause()}else return;e.stopImmediatePropagation();e.preventDefault()},true);

// ================= ẢNH ĐẠI DIỆN =================
const AV_N=9;
const avSv=(b,bg)=>'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="'+bg+'"/>'+b+'</svg>');
const _rn='<path d="M12 2V38"/><path d="M12 12L4.5 5M12 12L19.5 5"/><path d="M12 14L19 19.5L12 25"/><path d="M12 25L19 30.5L12 36"/>';
const AVP=['assets/images/portrait_hachi.jpg','assets/images/portrait_sanyo.jpg','assets/images/portrait_jin.jpg',
avSv('<g fill="none" stroke="#111" stroke-width="4" stroke-linejoin="round"><path d="M50 8L63 24 50 40 37 24z"/><path d="M50 36L74 64 50 92 26 64z"/></g><path d="M50 36l5 4-5 5-5-5z" fill="#e63323"/><circle cx="50" cy="40" r="1.6" fill="#fff"/>','#f1f1f1'),
avSv('<g transform="translate(26 10) scale(2)" fill="none" stroke="#111" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+_rn+'</g>','#f1f1f1'),
avSv('<g transform="translate(26 10) scale(2)" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+_rn+'</g>','#111'),
avSv('<g fill="none" stroke="#111" stroke-width="3.5" stroke-linejoin="round"><path d="M50 8L92 50 50 92 8 50z"/><path d="M50 24L76 50 50 76 24 50z"/></g><path d="M50 40L60 50 50 60 40 50z" fill="#e63323"/>','#f1f1f1'),
avSv('<circle cx="50" cy="50" r="32" fill="none" stroke="#fff" stroke-width="4"/><path d="M50 34L62 50 50 66 38 50z" fill="#e63323"/>','#111'),
avSv('<g fill="#fff" stroke="#111" stroke-width="3"><circle cx="50" cy="20" r="6"/><circle cx="71.2" cy="28.8" r="6"/><circle cx="80" cy="50" r="6"/><circle cx="71.2" cy="71.2" r="6"/><circle cx="50" cy="80" r="6"/><circle cx="28.8" cy="71.2" r="6"/><circle cx="20" cy="50" r="6"/><circle cx="28.8" cy="28.8" r="6"/></g><circle cx="50" cy="50" r="7" fill="#e63323"/>','#f1f1f1')];
function avOk(a){return typeof a==='string'&&(/^p\d{1,2}$/.test(a)&&!!AVP[+a.slice(1)]||a.length<30000&&/^c:data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(a))}
function avSrc(a,n){if(avOk(a))return a[0]==='p'?AVP[+a.slice(1)]:a.slice(2);let h=0;for(const ch of String(n||''))h=(h*31+ch.charCodeAt(0))|0;return AVP[3+Math.abs(h)%6]}
function avUpload(f){return new Promise(res=>{const im=new Image(),u=URL.createObjectURL(f);im.onload=()=>{try{const m=Math.min(im.width,im.height),c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,96,96);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,96,96);URL.revokeObjectURL(u);res('c:'+c.toDataURL('image/jpeg',.82))}catch(e){res(null)}};im.onerror=()=>{URL.revokeObjectURL(u);res(null)};im.src=u})}

// ================= HỒ SƠ NGƯỜI CHƠI =================
const PK='dk_prof',PR={name:'',since:Date.now(),on:{w:0,l:0,d:0},bot:{w:0,l:0,d:0},rw:0,rl:0,camp:{runs:0,best:0,stg:0},hist:[]};
try{const o=JSON.parse(localStorage.getItem(PK));if(o&&typeof o==='object')Object.assign(PR,o)}catch(e){}
for(const k of['elo','rg','sh','peak','pend'])delete PR[k]; // bỏ dữ liệu rank cũ
if(!PR.name)PR.name='Player'+(1000+Math.floor(Math.random()*9000));
const saveP=()=>{try{localStorage.setItem(PK,JSON.stringify(PR))}catch(e){}if(accOn)accPush();if(menuReady)menuProf()};var accOn=0,menuReady=0;saveP();
const profName=()=>String(PR.name||'Player').slice(0,12);
function menuProf(){const n=$('mpfN'),a=$('mpfA');if(n)n.textContent=profName();if(a){const u=avSrc(PR.av,PR.name);if(a.getAttribute('src')!==u)a.src=u}}
menuReady=1;menuProf();
$('mpfB').addEventListener('click',()=>{sfx.resume();openProf()});
function profRecord(mode,res,sp,sb,opp,ff){const g=mode==='online'?PR.on:PR.bot,k=res==='W'?'w':res==='L'?'l':'d';g[k]++;PR.rw+=sp|0;PR.rl+=sb|0;
PR.hist.unshift({t:Date.now(),m:mode,o:String(opp||'').slice(0,12),r:res,a:sp|0,b:sb|0,op:mode==='online'?opStore():undefined});if(RP.rec){const id=rpStop();if(id)PR.hist[0].rep=id}if(PR.hist.length>30)PR.hist.length=30;saveP()}
function profCamp(){PR.camp.runs++;PR.camp.best=Math.max(PR.camp.best|0,score|0);PR.camp.stg=Math.max(PR.camp.stg|0,stg|0);saveP()}
const prof=$('prof'),pfName=$('pfName'),pfNote=$('pfNote');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function profDraw(){{const u=avSrc(PR.av,PR.name),i=$('pfAvI');if(i.getAttribute('src')!==u)i.src=u}const o=PR.on,b=PR.bot,w=o.w+b.w,l=o.l+b.l,d=o.d+b.d,n=w+l+d,rate=n?Math.round(w/n*100):0;
const trio=g=>'<i class="w">'+g.w+'</i> · <i class="l">'+g.l+'</i> · <i class="d">'+g.d+'</i>';
$('pfStat').innerHTML=''+'<div class="pfT"><div class="pfC big"><small>PVP tổng · thắng · thua · hòa</small><b>'+trio({w,l,d})+'  —  '+rate+'% thắng</b></div>'
+'<div class="pfC"><small>Online</small><b>'+trio(o)+'</b></div><div class="pfC"><small>Đấu Bot</small><b>'+trio(b)+'</b></div>'
+'<div class="pfC"><small>Round thắng : thua</small><b>'+PR.rw+' : '+PR.rl+'</b></div><div class="pfC"><small>Campaign · điểm cao nhất</small><b>'+(PR.camp.best|0)+'</b></div></div>';
const H=$('pfHist');if(!PR.hist.length){H.innerHTML='<div class="hempty">Chưa có trận nào. Hãy chơi PVP để lưu kết quả.</div>';return}
H.innerHTML=PR.hist.map((x,i)=>{const dt=new Date(x.t),p2=n=>String(n).padStart(2,'0');
return '<div class="hr '+x.r+'"><span class="hd">'+p2(dt.getDate())+'/'+p2(dt.getMonth()+1)+' '+p2(dt.getHours())+':'+p2(dt.getMinutes())+'</span><span class="ho'+(x.op?' lk':'')+'" data-i="'+i+'">'+(x.m==='online'?'Online · ':'Bot · ')+'vs '+esc(x.o)+'</span>'+'<span></span>'+'<span class="hs">'+x.a+' : '+x.b+'</span><b>'+(x.r==='W'?'THẮNG':x.r==='L'?'THUA':'HÒA')+'</b>'+(x.rep?'<button class="hp" data-r="'+x.rep+'" aria-label="Xem lại">▶</button>':'<span class="hp0"></span>')+'</div>'}).join('')}
function openProf(){prof.style.display='flex';pfName.value=profName();pfNote.textContent='';clrArm=0;$('pfClear').textContent='Xoá lịch sử';accUI();profDraw()}
function closeProf(){saveName(1);prof.style.display='none'}
function saveName(quiet){const v=pfName.value.replace(/\s+/g,' ').trim().slice(0,12);if(!v){pfName.value=profName();return}if(v!==PR.name){PR.name=v;saveP();if(!quiet){pfNote.textContent='Đã lưu tên: '+v;setTimeout(()=>{if(pfNote.textContent.startsWith('Đã lưu'))pfNote.textContent=''},1600)}}pfName.value=PR.name}
let clrArm=0;
$('profB').addEventListener('click',()=>{sfx.resume();openProf()});
$('pfSave').addEventListener('click',()=>saveName(0));
pfName.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();saveName(0);pfName.blur()}else if(e.key==='Escape')closeProf()});
$('pfClear').addEventListener('click',()=>{if(!clrArm){clrArm=1;$('pfClear').textContent='Bấm lại để xoá hết';setTimeout(()=>{clrArm=0;$('pfClear').textContent='Xoá lịch sử'},3000);return}
rpKeys().then(ks=>(ks||[]).forEach(rpDel));clrArm=0;$('pfClear').textContent='Xoá lịch sử';Object.assign(PR,{on:{w:0,l:0,d:0},bot:{w:0,l:0,d:0},rw:0,rl:0,camp:{runs:0,best:0,stg:0},hist:[]});saveP();profDraw();pfNote.textContent='Đã xoá lịch sử'});
$('pfBack').addEventListener('click',closeProf);
addEventListener('keydown',e=>{if(prof.style.display!=='flex'||$('avp').style.display==='flex'||$('fr').style.display==='flex'||$('opc').style.display==='flex')return;if(e.key==='Escape'){closeProf();e.stopImmediatePropagation();e.preventDefault()}},true);

// ================= TÀI KHOẢN (Supabase · đăng nhập bằng mã email) =================
const SB_URL='https://gnupzxagevmswuzgnnan.supabase.co',SB_KEY='sb_publishable_LFsGAyQCBdV5cBQMdQ0ehA_C-ebP7ef',AK='dk_auth';
let AU=null;try{AU=JSON.parse(localStorage.getItem(AK))}catch(e){}
if(!AU||!AU.at||!AU.rt||!AU.uid)AU=null;
const saveAU=()=>{try{AU?localStorage.setItem(AK,JSON.stringify(AU)):localStorage.removeItem(AK)}catch(e){}};
async function sbFetch(path,opt){opt=opt||{};const h=Object.assign({apikey:SB_KEY,'Content-Type':'application/json'},opt.headers||{});
 const r=await fetch(SB_URL+path,Object.assign({},opt,{headers:h}));let j=null;try{j=await r.json()}catch(e){}
 if(!r.ok){const er=new Error((j&&(j.msg||j.message||j.error_description||j.error))||('Lỗi '+r.status));er.status=r.status;er.code=(j&&(j.error_code||j.code))||'';throw er}return j}
function setSess(j){const u=j.user||{};AU={at:j.access_token,rt:j.refresh_token,exp:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),uid:u.id||(AU&&AU.uid),email:u.email||(AU&&AU.email)};saveAU()}
async function sbTok(){if(!AU)return null;
 if(Date.now()/1000>AU.exp-60){try{setSess(await sbFetch('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:AU.rt})}))}
 catch(e){if(e.status>=400&&e.status<500&&e.status!==429){AU=null;saveAU();syncOK=0;accUI()}return null}}
 return AU&&AU.at}
const prScore=o=>{const a=o.on||{},b=o.bot||{},c=o.camp||{};return(a.w|0)+(a.l|0)+(a.d|0)+(b.w|0)+(b.l|0)+(b.d|0)+(c.runs|0)};
let syncOK=0,pushT=0;
async function accPull(){const tk=await sbTok();if(!tk)return;
 const rows=await sbFetch('/rest/v1/profiles?id=eq.'+AU.uid+'&select=data',{headers:{Authorization:'Bearer '+tk}});
 const s=rows&&rows[0];
 if(s&&s.data&&typeof s.data==='object'&&Object.keys(s.data).length&&prScore(s.data)>=prScore(PR))Object.assign(PR,s.data);
 syncOK=1;saveP();frFetch(1)}
function accPush(){if(!AU||!syncOK)return;clearTimeout(pushT);pushT=setTimeout(accSend,1500)}
async function accSend(){const tk=await sbTok();if(!tk)return;
 try{await sbFetch('/rest/v1/profiles?on_conflict=id',{method:'POST',headers:{Authorization:'Bearer '+tk,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:AU.uid,name:PR.name,data:PR,updated_at:new Date().toISOString()})})}catch(e){}
 try{const o=PR.on||{};await sbFetch('/rest/v1/public_profiles?on_conflict=id',{method:'POST',headers:{Authorization:'Bearer '+tk,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:AU.uid,code:myCode(),name:profName(),av:avOk(PR.av)?PR.av:null,w:o.w|0,l:o.l|0,d:o.d|0,updated_at:new Date().toISOString()})})}catch(e){}}
const acO=$('acc'),acE=$('acEmail'),acC=$('acCode'),acMsg=$('acMsg'),acS1=$('acS1'),acS2=$('acS2'),acGo=$('acGo'),acVf=$('acVf'),acRe=$('acRe');
let acCd=0,acTm=0,acMail='';
const acErr=e=>{const m=String(e&&e.message||'').toLowerCase(),c=e&&e.code||'';
 if(e&&(e.status===429||/rate.?limit|too many|security purposes/.test(m+c)))return'Gửi quá nhanh hoặc quá nhiều, hãy thử lại sau ít phút';
 if(/expired|invalid/.test(m+c))return'Mã sai hoặc đã hết hạn';
 if(e instanceof TypeError)return'Không kết nối được máy chủ, kiểm tra mạng';
 return'Lỗi: '+(e&&e.message||'không rõ')};
function acMsgSet(t,ok){acMsg.textContent=t||'';acMsg.className=ok?'ok':''}
function accUI(){const b=$('acBox');if(!b)return;
 b.innerHTML=AU?'<div class="rl">TÀI KHOẢN</div><div class="acRow"><span class="acMail">'+esc(AU.email||'')+'</span><button class="rs" id="acOut">Đăng xuất</button></div><small class="acSm">Dữ liệu hồ sơ được lưu theo tài khoản · Mã kết bạn: <b>'+myCode()+'</b></small>'
 :'<div class="rl">TÀI KHOẢN</div><div class="acRow"><button class="rs" id="acIn">Đăng nhập / Đăng ký</button></div><small class="acSm">Chưa đăng nhập: dữ liệu chỉ lưu trên máy này</small>';
 const i=$('acIn');if(i)i.onclick=accOpen;const o=$('acOut');if(o)o.onclick=accOut}
function accOpen(){acO.style.display='flex';acS1.style.display='flex';acS2.style.display='none';acMsgSet('');acE.value='';acE.focus()}
function accClose(){acO.style.display='none'}
function startCd(){acCd=60;clearInterval(acTm);const t=()=>{acRe.disabled=acCd>0;acRe.textContent=acCd>0?'Gửi lại mã ('+acCd+'s)':'Gửi lại mã'};t();acTm=setInterval(()=>{acCd--;t();if(acCd<=0)clearInterval(acTm)},1000)}
async function accSendCode(email){const em=(email||acE.value).trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){acMsgSet('Email không hợp lệ');return}
 acGo.disabled=acRe.disabled=true;acMsgSet('Đang gửi mã...',1);
 try{await sbFetch('/auth/v1/otp',{method:'POST',body:JSON.stringify({email:em,create_user:true})});
  acMail=em;acS1.style.display='none';acS2.style.display='flex';$('acSent').textContent='Đã gửi mã tới '+em+'. Kiểm tra cả mục Spam.';acMsgSet('');acC.value='';acC.focus();startCd()}
 catch(e){acMsgSet(acErr(e))}
 acGo.disabled=false;if(acS2.style.display==='flex')acRe.disabled=acCd>0}
async function accVerify(){const c=acC.value.replace(/\D/g,'');if(c.length<6){acMsgSet('Nhập đủ mã trong email');return}
 acVf.disabled=true;acMsgSet('Đang xác minh...',1);
 try{setSess(await sbFetch('/auth/v1/verify',{method:'POST',body:JSON.stringify({type:'email',email:acMail,token:c})}));
  acMsgSet('Đang đồng bộ dữ liệu...',1);try{await accPull()}catch(e){syncOK=1}
  clearInterval(acTm);accClose();accUI();profDraw();$('pfName').value=profName()}
 catch(e){acMsgSet(acErr(e))}
 acVf.disabled=false}
async function accOut(){if(!confirm('Đăng xuất? Hồ sơ trên máy này sẽ được xoá (dữ liệu vẫn lưu trong tài khoản, đăng nhập lại để lấy về).'))return;
 clearTimeout(pushT);await accSend();const tk=AU&&AU.at;try{if(tk)await sbFetch('/auth/v1/logout',{method:'POST',headers:{Authorization:'Bearer '+tk}})}catch(e){}
 AU=null;syncOK=0;saveAU();frReset();
 const fresh={name:'Player'+(1000+Math.floor(Math.random()*9000)),since:Date.now(),on:{w:0,l:0,d:0},bot:{w:0,l:0,d:0},rw:0,rl:0,camp:{runs:0,best:0,stg:0},hist:[]};
 for(const k of Object.keys(PR))delete PR[k];Object.assign(PR,fresh);saveP();accUI();profDraw();$('pfName').value=profName()}
acGo.addEventListener('click',()=>accSendCode());acVf.addEventListener('click',accVerify);
acRe.addEventListener('click',()=>{if(acCd<=0)accSendCode(acMail)});
$('acCh').addEventListener('click',()=>{acS2.style.display='none';acS1.style.display='flex';acMsgSet('');acE.focus()});
$('acBack').addEventListener('click',accClose);
for(const el of[acE,acC])el.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();el===acE?accSendCode():accVerify()}else if(e.key==='Escape')accClose()});
accOn=1;accUI();if(AU)accPull().catch(()=>{syncOK=1});

// ================= HỒ SƠ ĐỐI THỦ · BẠN BÈ =================
const OPC={p:null,fr:0};
const uidOk=u=>typeof u==='string'&&/^[0-9a-f-]{36}$/i.test(u);
function myCode(){return AU&&AU.uid?String(AU.uid).replace(/-/g,'').slice(0,8).toUpperCase():''}
function hiMsg(q){const o=PR.on||{};return{t:'hi',n:profName(),q,a:avOk(PR.av)?PR.av:'',u:AU?AU.uid:'',w:o.w|0,l:o.l|0,d:o.d|0}}
function opSan(m){const c=(v,hi)=>Math.max(0,Math.min(hi,v|0));return{n:String(m.n||'Đối thủ').slice(0,12),a:avOk(m.a)?m.a:'',u:uidOk(m.u)?m.u:'',w:c(m.w,99999),l:c(m.l,99999),d:c(m.d,99999)}}
function opStore(){const o=MP.op||(FK.on?FK.op:null);if(!o)return undefined;return{n:o.n,a:/^p\d{1,2}$/.test(o.a||'')?o.a:'',u:o.u||'',w:o.w,l:o.l,d:o.d}}
const opcE=$('opc');
function opShow(p,o){if(!p)return;o=o||{};OPC.p=p;OPC.fr=o.fr?1:0;$('opAv').src=avSrc(p.a,p.n);$('opNm').textContent=p.n;
$('opRk').innerHTML='';
const st=(k,v)=>'<div><small>'+k+'</small><b>'+v+'</b></div>';
$('opSt').innerHTML=st('Thắng online',p.w|0)+st('Thua online',p.l|0);
opBtns();opcE.style.display='flex';if(AU)frFetch(1).then(()=>{if(opcE.style.display==='flex'&&OPC.p===p)opBtns()})}
function opBtns(){const p=OPC.p,A=$('opAct'),M=$('opMsg');M.textContent='';if(!p){A.innerHTML='';return}
if(AU&&p.u&&p.u===AU.uid){A.innerHTML='';return}
const rel=frRel(p.u);let h='';
if(!p.u){h='<button class="rb2 sm" disabled>Kết bạn</button>';M.textContent='Người chơi này chưa đăng nhập tài khoản nên chưa thể kết bạn'}
else if(!AU)h='<button class="rb2 sm" data-a="login">Đăng nhập để kết bạn</button>';
else if(rel==='friend')h='<span class="opOk">✓ Đã là bạn bè</span>'+(OPC.fr?'<button class="rs" data-a="del">Xoá bạn</button>':'');
else if(rel==='out')h='<span class="opOk">Đã gửi lời mời</span><button class="rs" data-a="del">Huỷ lời mời</button>';
else if(rel==='in')h='<button class="rb2 sm" data-a="acc">Chấp nhận kết bạn</button><button class="rs" data-a="del">Từ chối</button>';
else h='<button class="rb2 sm" data-a="add">Kết bạn</button>';
A.innerHTML=h}
function opClose(){opcE.style.display='none';OPC.p=null}
$('opX').addEventListener('click',opClose);
opcE.addEventListener('pointerdown',e=>{if(e.target===opcE)opClose()});
$('opAct').addEventListener('click',async e=>{const b=e.target.closest('button[data-a]');if(!b)return;const p=OPC.p,a=b.dataset.a;if(!p)return;
if(a==='login'){opClose();accOpen();return}
b.disabled=true;const M=$('opMsg');
try{if(a==='add'){const r=await frReq(p.u);M.textContent=({ok:'Đã gửi lời mời kết bạn',sent:'Bạn đã gửi lời mời rồi',already:'Hai bạn đã là bạn bè',acc:'Đã chấp nhận — hai bạn là bạn bè!',login:'Hãy đăng nhập',err:'Không gửi được, thử lại sau'})[r]||''}
else if(a==='acc'){await frAcc(p.u)}
else if(a==='del'){if(OPC.fr&&frRel(p.u)==='friend'&&!confirm('Xoá '+p.n+' khỏi danh sách bạn bè?')){b.disabled=false;return}await frDel(p.u)}}
catch(er){M.textContent=frErr(er)}
const t=M.textContent;opBtns();if(t)$('opMsg').textContent=t});
function opChipUpd(){const c=$('opChip');if(!c)return;const o=GM==='mp'?MP.op:(GM==='pvp'&&FK.on?FK.op:null);
if(!o){c.style.display='none';return}
c.innerHTML='<img class="av" src="'+avSrc(o.a,o.n)+'" alt=""><span><b>'+esc(o.n)+'</b></span>';c.style.display='flex'}
$('opChip').addEventListener('click',()=>{sfx.resume();opShow(GM==='mp'?MP.op:FK.op)});
$('pfHist').addEventListener('click',e=>{const b=e.target.closest('.ho.lk');if(!b)return;const x=PR.hist[+b.dataset.i];if(x&&x.op)opShow(Object.assign({},x.op))});

// ----- chọn ảnh đại diện -----
const avpE=$('avp'),avMsg=$('avMsg');
function avDraw(){const cur=PR.av,cu=typeof cur==='string'&&cur[0]==='c'&&avOk(cur);let h='';
if(cu)h+='<button class="sel" data-v="'+'keep'+'"><img class="av" src="'+cur.slice(2)+'" alt=""></button>';
for(let i=0;i<AV_N;i++)h+='<button data-v="p'+i+'"'+(cur==='p'+i?' class="sel"':'')+'><img class="av" src="'+AVP[i]+'" alt=""></button>';
$('avGrid').innerHTML=h}
function avSet(v){PR.av=v;saveP();profDraw();avDraw()}
$('pfAvB').addEventListener('click',()=>{sfx.resume();avMsg.textContent='';avDraw();avpE.style.display='flex'});
$('avX').addEventListener('click',()=>{avpE.style.display='none'});
avpE.addEventListener('pointerdown',e=>{if(e.target===avpE)avpE.style.display='none'});
$('avGrid').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.dataset.v==='keep')return;avSet(b.dataset.v)});
$('avUp').addEventListener('click',()=>$('avFile').click());
$('avFile').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;avMsg.textContent='';
if(!/^image\//.test(f.type)){avMsg.textContent='Hãy chọn một tệp ảnh';return}
const v=await avUpload(f);if(!v||!avOk(v)){avMsg.textContent='Không đọc được ảnh này';return}avSet(v)});
$('avRm').addEventListener('click',()=>avSet(''));

// ----- bạn bè (Supabase: bảng friends + public_profiles, xem supabase_friends.sql) -----
const FR={rows:[],prof:{},ok:0,err:'',tab:'l'},frE=$('fr');
const frH=tk=>({headers:{Authorization:'Bearer '+tk}});
const frErr=e=>e instanceof TypeError?'Không kết nối được máy chủ':(e&&e.status===404)||/PGRST20|relation|schema cache/i.test((e&&(e.code||'')+(e&&e.message||'')))?'Máy chủ bạn bè chưa được cài đặt':'Có lỗi, thử lại sau';
function frNorm(r){return{n:String(r.name||'Player').slice(0,12),a:avOk(r.av)?r.av:'',u:r.id,c:String(r.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8),w:r.w|0,l:r.l|0,d:r.d|0}}
function frRel(u){if(!AU||!u)return'';const r=FR.rows.find(x=>(x.a===AU.uid&&x.b===u)||(x.b===AU.uid&&x.a===u));return!r?'':r.status==='accepted'?'friend':r.a===AU.uid?'out':'in'}
function frReset(){FR.rows=[];FR.prof={};FR.ok=0;FR.err='';frBadge();lobFr();if(frE.style.display==='flex')frDraw()}
function frBadge(){const n=AU?FR.rows.filter(r=>r.b===AU.uid&&r.status==='pending').length:0,b=$('mfrB');b.textContent=n>9?'9+':n;b.style.display=n?'block':'none';$('frN2').textContent=n?'('+n+')':'';const f=FR.rows.filter(r=>r.status==='accepted').length;$('frN1').textContent=f?'('+f+')':''}
async function frFetch(quiet){if(!AU)return;const tk=await sbTok();if(!tk)return;
try{const me=AU.uid;const rows=await sbFetch('/rest/v1/friends?select=a,b,status&or=(a.eq.'+me+',b.eq.'+me+')',frH(tk));
FR.rows=Array.isArray(rows)?rows.filter(r=>uidOk(r.a)&&uidOk(r.b)):[];
const ids=[...new Set(FR.rows.map(r=>r.a===me?r.b:r.a))];
if(ids.length){const ps=await sbFetch('/rest/v1/public_profiles?select=id,code,name,av,w,l,d&id=in.('+ids.join(',')+')',frH(tk));for(const p of ps||[])if(uidOk(p.id))FR.prof[p.id]=frNorm(p)}
FR.ok=1;FR.err=''}
catch(e){FR.ok=0;FR.err=frErr(e)}
frBadge();lobFr();if(frE.style.display==='flex')frDraw()}
async function frReq(u){if(!uidOk(u))return'err';const tk=await sbTok();if(!tk)return'login';await frFetch(1);const rel=frRel(u);
if(rel==='friend')return'already';if(rel==='out')return'sent';if(rel==='in'){await frAcc(u);return'acc'}
try{await sbFetch('/rest/v1/friends',{method:'POST',headers:{Authorization:'Bearer '+tk,Prefer:'return=minimal'},body:JSON.stringify({a:AU.uid,b:u,status:'pending'})});await frFetch(1);return'ok'}catch(e){if(e.status===409){await frFetch(1);return'sent'}throw e}}
async function frAcc(u){if(!uidOk(u))return;const tk=await sbTok();if(!tk)return;await sbFetch('/rest/v1/friends?a=eq.'+u+'&b=eq.'+AU.uid,{method:'PATCH',headers:{Authorization:'Bearer '+tk,Prefer:'return=minimal'},body:JSON.stringify({status:'accepted'})});await frFetch(1)}
async function frDel(u){if(!uidOk(u))return;const tk=await sbTok();if(!tk)return;const me=AU.uid;await sbFetch('/rest/v1/friends?or=(and(a.eq.'+me+',b.eq.'+u+'),and(a.eq.'+u+',b.eq.'+me+'))',{method:'DELETE',headers:{Authorization:'Bearer '+tk,Prefer:'return=minimal'}});await frFetch(1)}
function frMsg(t,ok){const m=$('frMsg');m.textContent=t||'';m.className=ok?'ok':''}
async function frAddCode(){const c=$('frInp').value.toUpperCase().replace(/[^A-Z0-9]/g,'');if(c.length!==8){frMsg('Mã gồm 8 ký tự');return}if(c===myCode()){frMsg('Đây là mã của bạn');return}
const tk=await sbTok();if(!tk){frMsg('Hãy đăng nhập');return}frMsg('Đang tìm...',1);
try{const r=await sbFetch('/rest/v1/public_profiles?select=id,name&code=eq.'+c,frH(tk));if(!r||!r[0]){frMsg('Không tìm thấy mã '+c);return}
const st=await frReq(r[0].id),nm=String(r[0].name||'').slice(0,12);
frMsg(({ok:'Đã gửi lời mời tới '+nm,sent:'Bạn đã gửi lời mời rồi',already:'Hai bạn đã là bạn bè',acc:'Đã chấp nhận — hai bạn là bạn bè!',err:'Không gửi được, thử lại sau',login:'Hãy đăng nhập'})[st]||'',st==='ok'||st==='acc');if(st==='ok'||st==='acc')$('frInp').value=''}
catch(e){frMsg(frErr(e))}}
function frRow(u,btns){const p=FR.prof[u]||{n:'Người chơi',a:'',u,w:0,l:0,d:0};
return'<div class="fr-row" data-u="'+u+'"><img class="av" src="'+avSrc(p.a,p.n)+'" alt=""><div class="fn"><b>'+esc(p.n)+'</b><span>'+(p.w|0)+' thắng · '+(p.l|0)+' thua</span></div><div class="fa">'+(btns||'')+'</div></div>'}
function frDraw(){const out=$('frOut'),body=$('frBody');
if(!AU||FR.err==='Máy chủ bạn bè chưa được cài đặt'){body.style.display='none';out.style.display='flex';
out.innerHTML=!AU?'<span>Đăng nhập tài khoản để kết bạn và xem hồ sơ bạn bè.</span><button class="rb2 sm" id="frLogin">Đăng nhập / Đăng ký</button>':'<span>Máy chủ bạn bè chưa được cài đặt. Cần chạy file supabase_friends.sql trong Supabase (SQL Editor) một lần.</span>';
const b=$('frLogin');if(b)b.onclick=()=>accOpen();return}
out.style.display='none';body.style.display='flex';$('frCode').textContent=myCode();
document.querySelectorAll('#frTabs .ft').forEach(b=>b.classList.toggle('sel',b.dataset.t===FR.tab));
const me=AU.uid,L=$('frList');let h='';
if(FR.tab==='l'){const f=FR.rows.filter(r=>r.status==='accepted').map(r=>r.a===me?r.b:r.a).sort((x,y)=>String((FR.prof[x]||{}).n).localeCompare(String((FR.prof[y]||{}).n)));
h=f.length?f.map(u=>frRow(u)).join(''):'<div class="fr-empty">'+(FR.ok?'Chưa có bạn bè. Gửi lời mời bằng mã kết bạn ở bên trái.':'Đang tải…')+'</div>'}
else{const inc=FR.rows.filter(r=>r.b===me&&r.status==='pending').map(r=>r.a),out=FR.rows.filter(r=>r.a===me&&r.status==='pending').map(r=>r.b);
h=inc.length?inc.map(u=>frRow(u,'<button class="rs pri" data-a="acc">Chấp nhận</button><button class="rs" data-a="del">Từ chối</button>')).join(''):'<div class="fr-empty">Không có lời mời mới</div>';
if(out.length)h+='<div class="fr-sub">ĐÃ GỬI</div>'+out.map(u=>frRow(u,'<button class="rs" data-a="del">Huỷ</button>')).join('')}
L.innerHTML=h}
function openFr(){frE.style.display='flex';frMsg('');frDraw();frFetch(0)}
function closeFr(){frE.style.display='none'}
$('mfr').addEventListener('click',()=>{sfx.resume();openFr()});
$('frX').addEventListener('click',closeFr);
$('frAdd').addEventListener('click',frAddCode);
$('frInp').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();frAddCode()}else if(e.key==='Escape')closeFr()});
$('frCopy').addEventListener('click',async()=>{const c=myCode();try{await navigator.clipboard.writeText(c);frMsg('Đã sao chép '+c,1)}catch(e){frMsg('Mã của bạn: '+c,1)}});
document.querySelectorAll('#frTabs .ft').forEach(b=>b.addEventListener('click',()=>{FR.tab=b.dataset.t;frDraw()}));
$('frList').addEventListener('click',async e=>{const row=e.target.closest('.fr-row');if(!row)return;const u=row.dataset.u,b=e.target.closest('button[data-a]');
if(!b){opShow(FR.prof[u]||{n:'Người chơi',a:'',u,w:0,l:0,d:0},{fr:1});return}
b.disabled=true;try{if(b.dataset.a==='acc')await frAcc(u);else await frDel(u)}catch(er){frMsg(frErr(er))}frDraw()});
addEventListener('keydown',e=>{if(e.key!=='Escape')return;
if(avpE.style.display==='flex')avpE.style.display='none';else if(opcE.style.display==='flex')opClose();else if(frE.style.display==='flex')closeFr();else return;
e.stopImmediatePropagation();e.preventDefault()},true);
setInterval(()=>{if(AU&&document.visibilityState==='visible'&&$('menu').getClientRects().length&&frE.style.display!=='flex')frFetch(1)},45000);
if(AU)setTimeout(()=>frFetch(1),2500);

// ================= SẢNH PVP (giao diện mới) =================
// Màn hình sảnh PVP: thẻ người chơi · ô đối thủ (+ để thêm Bot) · Inventory · Bạn bè · nút Đấu.
const lobE=$('lob'),LB_PORT=[$('cpH').src,$('cpS').src,$('cpJ').src],LB_CN=['Hachi','Sanyo','Jin'],LBP={p:null};
function lobBtn(){const b=$('lbGo');let dis=0,t='Đấu';if(LB.mode==='pvp'&&MP.open&&!MP.host){dis=1;t='Chờ chủ phòng'}
b.textContent=t;b.disabled=!!dis;b.className=t.length>5?'sm':''}
function lobDraw(){if(!LB.open)return;
$('lbT').textContent='Pvp';$('lbJoin').style.display='';
$('lbMeN').textContent=profName();$('lbMeI').src=LB_PORT[CH];$('lbMeC').textContent=LB_CN[CH];
const bx=$('lbOpBox'),I=$('lbOpI'),T=$('lbOpT'),st=MP.open?'human':LB.bot?'bot':MP.host?'host':'empty';
bx.dataset.s=st;I.style.display='none';T.textContent='';let nn='...',cc='...';
if(st==='human'){nn=MP.rn||'Đối thủ';const o=MP.op;I.src=avSrc(o&&o.a,nn);I.style.display='block';cc=o?(o.w|0)+' thắng · '+(o.l|0)+' thua':'';$('lbMsg').textContent=''}
else if(st==='bot'){nn='Bot';T.textContent='BOT';cc='Luyện tập'}
else if(st==='host'){nn='Đang chờ…';T.textContent='+';cc=MP.code?'Mã phòng: '+MP.code:'Đang tạo mã phòng…'}
else T.textContent='+';
$('lbOpN').textContent=nn;$('lbOpC').textContent=cc;$('lbOpC').classList.toggle('cp',st==='host'&&!!MP.code);
const lw=$('lbRoom');if(lw){lw.textContent=st==='host'&&MP.code?'MÃ PHÒNG: '+MP.code+' · bấm để sao chép':st==='host'?'Đang tạo mã phòng…':'';lw.style.display=st==='host'?'block':'none'}
lobBtn();lobFr()}
// luôn có sẵn 1 phòng chờ (hiện mã phòng) khi đang ở sảnh PVP và chưa chọn Bot / chưa có đối thủ
function lobEnsure(){if(LB.open&&LB.mode==='pvp'&&!LB.bot&&!MP.open&&!MP.host&&!MP.peer&&!MM.on&&!MP.on)lobHost()}
setInterval(lobEnsure,2000);
function lobFr(){if(!LB.open)return;const Lx=$('lbFrL'),pv=LB.mode==='pvp';let h='';
if(!AU)h='<div class="lbE">Đăng nhập để mời bạn bè</div><button class="rs" id="lbLogin">Đăng nhập</button>';
else if(FR.err==='Máy chủ bạn bè chưa được cài đặt')h='<div class="lbE">Máy chủ bạn bè chưa được cài đặt</div>';
else{const me=AU.uid,f=FR.rows.filter(r=>r.status==='accepted').map(r=>r.a===me?r.b:r.a).sort((x,y)=>String((FR.prof[x]||{}).n).localeCompare(String((FR.prof[y]||{}).n)));
h=f.length?f.map(u=>'<div class="lbF" data-u="'+u+'"><span>'+esc((FR.prof[u]||{}).n||'Người chơi')+'</span>'+(pv?'<button class="lbI" data-a="inv">Mời</button>':'')+'</div>').join(''):'<div class="lbE">'+(FR.ok?'Chưa có bạn bè':'Đang tải…')+'</div>'}
if(Lx.dataset.h!==h){Lx.innerHTML=h;Lx.dataset.h=h}}
function lobPres(on){if(!on||!AU||!AU.uid||MM.on||MP.on||!LB.open||LB.mode!=='pvp'){if(LBP.p){try{LBP.p.destroy()}catch(e){}LBP.p=null}return}
if(LBP.p||mpNoLib())return;let p;try{p=mkPeer('daikai-f'+myCode())}catch(e){return}LBP.p=p;
p.on('connection',c=>{c.on('data',m=>{if(m&&m.t==='inv')lobInvIn(m)});setTimeout(()=>{try{c.close()}catch(e){}},4000)});
p.on('error',e=>{if(e&&e.type==='unavailable-id'){try{p.destroy()}catch(_){}if(LBP.p===p)LBP.p=null}});
p.on('disconnected',()=>{try{p.reconnect()}catch(_){}})}
function openLob(m){if(m)LB.mode=m;if(!LB.open)LB.bot=0;LB.open=1;FK.on=0;msel.style.display='none';lobE.style.display='block';
rmNote.textContent='';$('lbMsg').textContent='';$('lbJoinV').style.display='none';lobDraw();if(AU)frFetch(1);lobPres(1);lobEnsure()}
function lobBack(){const jv=$('lbJoinV');if(jv.style.display==='flex'){jv.style.display='none';rmNote.textContent='';return}
mpReset();closeRoom();LB.bot=0;openMsel()}
function lobGo(){sfx.resume();
if(MP.open&&MP.host){mpSend({t:'pick'});closeRoom();GM='mp';mpReadyUp();return}
if(MP.open)return;
if(LB.bot){FK.on=0;GM='pvp';closeRoom();start();return}
mmStart(1)}
function lobInvite(u){const f=FR.prof[u],code=MP.code,M=$('lbMsg');if(!f||!code||!AU)return;
const say=t=>{M.textContent=t};say('Đang gửi lời mời tới '+f.n+'…');
const fb=()=>{try{navigator.clipboard.writeText(code)}catch(e){}say(f.n+' chưa ở màn hình PVP — đã sao chép mã phòng '+code+', hãy gửi mã cho bạn ấy')};
if(!f.c||mpNoLib()){fb();return}
let p=null,done=0,tm=0;const fin=ok=>{if(done)return;done=1;clearTimeout(tm);setTimeout(()=>{try{p&&p.destroy()}catch(e){}},ok?700:0);if(ok)say('Đã gửi lời mời tới '+f.n+' — chờ bạn ấy vào phòng');else fb()};
tm=setTimeout(()=>fin(0),7000);
try{p=mkPeer()}catch(e){fin(0);return}
p.on('error',()=>fin(0));
p.on('open',()=>{const c=p.connect('daikai-f'+f.c,{reliable:true,serialization:'json'});c.on('open',()=>{try{c.send({t:'inv',n:profName(),c:code,u:AU.uid})}catch(e){}fin(1)});c.on('error',()=>fin(0))})}
let lbInvT=0;
function lobInvIn(m){const c=String(m.c||'').toUpperCase();if(!/^[A-Z2-9]{5}$/.test(c)||!LB.open||MP.on||MM.on||frRel(String(m.u||''))!=='friend')return;
$('lbToastT').textContent=String(m.n||'Bạn bè').slice(0,12)+' mời bạn đấu PVP';const T=$('lbToast');T.dataset.c=c;T.style.display='flex';clearTimeout(lbInvT);lbInvT=setTimeout(()=>{T.style.display='none'},30000)}
// --- gắn sự kiện ---
$('lbBack').addEventListener('click',lobBack);
$('lbGo').addEventListener('click',lobGo);
$('lbJoin').addEventListener('click',()=>{sfx.resume();$('lbJoinV').style.display='flex';$('rmInp').value='';rmNote.textContent='';setTimeout(()=>$('rmInp').focus(),50)});
$('lbJoinX').addEventListener('click',()=>{$('lbJoinV').style.display='none';rmNote.textContent=''});
$('lbMeBox').addEventListener('click',()=>{if(MP.ready)return;sfx.resume();cFocus((CH+1)%3);lobDraw()});
$('lbOpBox').addEventListener('click',()=>{sfx.resume();
if(MP.open){if(MP.op)opShow(MP.op);return}
if(LB.bot){LB.bot=0;lobDraw();lobEnsure();return}
if(MP.host)mpReset();LB.bot=1;lobDraw()});
const lobCopy=()=>{if(!(MP.host&&MP.code))return;try{navigator.clipboard.writeText(MP.code);$('lbMsg').textContent='Đã sao chép mã '+MP.code}catch(e){$('lbMsg').textContent='Mã phòng: '+MP.code}};
$('lbOpC').addEventListener('click',lobCopy);if($('lbRoom'))$('lbRoom').addEventListener('click',lobCopy);
$('lbFrL').addEventListener('click',e=>{if(e.target.closest('#lbLogin')){accOpen();return}
const row=e.target.closest('.lbF');if(!row)return;const u=row.dataset.u;
if(e.target.closest('[data-a="inv"]')){sfx.resume();lobHost(()=>lobInvite(u));return}
opShow(FR.prof[u]||{n:'Người chơi',a:'',u,w:0,l:0,d:0},{fr:1})});
$('lbToastY').addEventListener('click',()=>{const T=$('lbToast'),c=T.dataset.c;T.style.display='none';if(c)mpJoin(c)});
$('lbToastN').addEventListener('click',()=>{$('lbToast').style.display='none'});
$('rmPvp').addEventListener('click',()=>{sfx.resume();openLob('pvp')});
function lbInvDraw(){const nm=k=>PV_ITEMS.find(x=>x.k===k).n;$('lbInvR').innerHTML=[[PV_LO.d,'d',1],[PV_LO.h,'h',1],['nade','',0],['smoke','',0]].map(a=>'<div class="iv'+(a[2]?' sw':'')+'"'+(a[1]?' data-g="'+a[1]+'"':'')+'><img src="'+NI_SRC[a[0]]+'" alt="'+a[0]+'"><small>'+nm(a[0])+(a[2]?' ⇄':'')+'</small></div>').join('')}
lbInvDraw();
$('lbInvR').addEventListener('click',e=>{const b=e.target.closest('.sw');if(!b||MP.ready)return;if(b.dataset.g==='d')PV_LO.d=PV_LO.d==='molly'?'thunder':'molly';else PV_LO.h=PV_LO.h==='flash'?'ice':'flash';try{localStorage.setItem('dk_lo',JSON.stringify(PV_LO))}catch(_){}lbInvDraw()}); // chạm Molly⇄Sét / Flash⇄Băng để đổi chủ lực
addEventListener('keydown',e=>{if(!LB.open||e.key!=='Escape')return;lobBack();e.stopImmediatePropagation();e.preventDefault()},true);

// ================= KẾT NỐI: icon sóng ở sảnh (đỏ 1 cục · vàng 2 cục · xanh 3 cục) =================
// Đo thời gian gọi /health của máy chủ relay. Trong trận thì ping hiện bằng số (pingDraw).
const NETS={a:[],ok:1,lv:3,fail:0},netE=$('net'),netMs=$('netMs'),netUrl=(()=>{try{return RELAY_URL?'https://'+new URL(RELAY_URL).host+'/health':''}catch(e){return''}})();
function netDraw(){if(!netE)return;const vis=state!=='play'&&stage==='menu'&&menu.getClientRects().length>0;netE.style.display=vis?'flex':'none';if(!vis)return;
const lv=NETS.ok?NETS.lv:0,ms=NETS.a.length?Math.round(Math.min(...NETS.a)):-1;netE.className='l'+lv;netE.title=NETS.ok?(ms>=0?'Ping '+ms+'ms':'Đã kết nối'):'Mất kết nối';
if(netMs){netMs.style.display=ST.ping?'':'none';netMs.textContent=NETS.ok?(ms>=0?'PING '+ms+'ms':'PING ...'):'MẤT KẾT NỐI'}}
async function netProbe(){if(!netUrl){NETS.ok=navigator.onLine?1:0;NETS.lv=3;netDraw();return}
const t0=performance.now();let to=0;try{const ctl=new AbortController();to=setTimeout(()=>ctl.abort(),6000);const r=await fetch(netUrl+'?t='+Date.now(),{cache:'no-store',signal:ctl.signal});clearTimeout(to);if(!r.ok)throw new Error('http');await r.text();
NETS.a.push(performance.now()-t0);if(NETS.a.length>3)NETS.a.shift();const ms=Math.min(...NETS.a);NETS.lv=ms<=120?3:ms<=250?2:1;NETS.ok=1;NETS.fail=0}
catch(e){clearTimeout(to);NETS.fail++;if(NETS.fail>=2)NETS.ok=0}
netDraw()}
setInterval(()=>{if(document.visibilityState==='visible'&&state!=='play')netProbe();else netDraw()},4000);
setInterval(netDraw,1000);
addEventListener('online',()=>{NETS.fail=0;netProbe()});addEventListener('offline',()=>{NETS.ok=0;netDraw()});
setTimeout(netProbe,800);
