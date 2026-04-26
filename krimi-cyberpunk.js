// ── CURSOR ──────────────────────────────────────────
const cur = document.getElementById('cur');
const cur2 = document.getElementById('cur2');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cur.style.left=mx+'px';cur.style.top=my+'px';
});
function animCursor(){
  rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
  cur2.style.left=rx+'px';cur2.style.top=ry+'px';
  requestAnimationFrame(animCursor);
}
animCursor();
document.querySelectorAll('.node').forEach(n=>{
  n.addEventListener('mouseenter',()=>{cur.classList.add('big');cur2.classList.add('big');});
  n.addEventListener('mouseleave',()=>{cur.classList.remove('big');cur2.classList.remove('big');});
});

// ── BOOT SEQUENCE ───────────────────────────────────
const lines=['b0','b1','b2','b3','b4','b5','b6'];
lines.forEach((id,i)=>{
  setTimeout(()=>{
    document.getElementById(id).classList.add('on');
    if(i===3) document.getElementById('boot-bar').style.width='40%';
    if(i===5) document.getElementById('boot-bar').style.width='80%';
    if(i===6){
      document.getElementById('boot-bar').style.width='100%';
      setTimeout(()=>{
        document.getElementById('boot').classList.add('off');
        document.getElementById('page').classList.add('show');
      },600);
    }
  },i*260+200);
});

// ── CANVAS: MATRIX + GRID + PARTICLES ──────────────
const cv = document.getElementById('c');
const cx2 = cv.getContext('2d');
let W,H;
const resize=()=>{ W=cv.width=innerWidth; H=cv.height=innerHeight; };
resize(); window.addEventListener('resize',resize);

// Matrix
const COLS=()=>Math.floor(W/16);
let drops=[];
const resetDrops=()=>{ drops=Array.from({length:COLS()},()=>Math.random()*-80|0); };
resetDrops();
window.addEventListener('resize',resetDrops);
const KANA='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ01法電影機侍龍∑∆Ω∇';

// Particles
const PCOUNT=120;
const pts=Array.from({length:PCOUNT},()=>({
  x:Math.random()*2000,y:Math.random()*2000,
  vx:(Math.random()-.5)*.15,vy:(Math.random()-.5)*.15,
  r:Math.random()*1.2+.2,a:Math.random()*.4+.05
}));

let frame=0;
function draw(){
  frame++;
  cx2.clearRect(0,0,W,H);

  // Faint grid
  cx2.strokeStyle='rgba(0,255,240,0.025)';
  cx2.lineWidth=1;
  const gs=50;
  for(let x=0;x<W;x+=gs){cx2.beginPath();cx2.moveTo(x,0);cx2.lineTo(x,H);cx2.stroke();}
  for(let y=0;y<H;y+=gs){cx2.beginPath();cx2.moveTo(0,y);cx2.lineTo(W,y);cx2.stroke();}

  // Perspective vanishing grid
  if(frame%2===0){
    cx2.strokeStyle='rgba(180,0,255,0.018)';
    const vx=W/2,vy=H*.4;
    for(let i=0;i<16;i++){
      const a=(i/16)*Math.PI*2;
      cx2.beginPath();cx2.moveTo(vx,vy);
      cx2.lineTo(vx+Math.cos(a)*W,vy+Math.sin(a)*H);cx2.stroke();
    }
  }

  // Matrix rain (lighter, background feel)
  cx2.fillStyle='rgba(2,4,10,0.14)';
  cx2.fillRect(0,0,W,H);
  cx2.font='12px Share Tech Mono,monospace';
  drops.forEach((y,i)=>{
    const ch=KANA[Math.random()*KANA.length|0];
    const alpha=Math.random()*.3+.04;
    // Color: mostly cyan, occasionally pink or purple
    const r=Math.random();
    if(r<.05) cx2.fillStyle=`rgba(255,45,120,${alpha})`;
    else if(r<.1) cx2.fillStyle=`rgba(180,0,255,${alpha})`;
    else cx2.fillStyle=`rgba(0,255,240,${alpha})`;
    cx2.fillText(ch,i*16,y*12);
    if(y*12>H&&Math.random()>.978) drops[i]=0;
    drops[i]++;
  });

  // Floating particles
  pts.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0)p.x=W; if(p.x>W)p.x=0;
    if(p.y<0)p.y=H; if(p.y>H)p.y=0;
    cx2.beginPath();
    cx2.arc(p.x,p.y,p.r,0,Math.PI*2);
    cx2.fillStyle=`rgba(0,255,240,${p.a})`;
    cx2.fill();
  });

  // Mouse glow
  if(mx||my){
    const g=cx2.createRadialGradient(mx,my,0,mx,my,180);
    g.addColorStop(0,'rgba(0,255,240,0.04)');
    g.addColorStop(1,'transparent');
    cx2.fillStyle=g; cx2.fillRect(0,0,W,H);
  }

  requestAnimationFrame(draw);
}
draw();

// ── TOAST ───────────────────────────────────────────
const toast=document.getElementById('toast');
let tt;
function showToast(msg){
  toast.textContent=msg;
  toast.classList.add('show');
  clearTimeout(tt);
  tt=setTimeout(()=>toast.classList.remove('show'),2200);
}
function copyText(v){
  navigator.clipboard.writeText(v).then(()=>showToast('// COPIED → '+v)).catch(()=>showToast('// '+v));
}
function openLink(u){ window.open(u,'_blank','noopener'); showToast('// JACK IN → '+u.split('/').pop()); }

document.querySelectorAll('.node').forEach(node=>{
  node.addEventListener('click',()=>{
    const { copy, link } = node.dataset;
    if(copy) copyText(copy);
    if(link) openLink(link);
  });
});

// ── 3D PARALLAX ON NODES ────────────────────────────
document.querySelectorAll('.node').forEach(nd=>{
  nd.addEventListener('mousemove',e=>{
    const r=nd.getBoundingClientRect();
    const dx=(e.clientX-r.left-r.width/2)/(r.width/2);
    const dy=(e.clientY-r.top-r.height/2)/(r.height/2);
    nd.querySelector('.node-in').style.cssText=`
      transform:translateY(-6px) rotateX(${-dy*16}deg) rotateY(${dx*16}deg) scale(1.04);
      animation:none;transition:transform .08s;
    `;
  });
  nd.addEventListener('mouseleave',()=>{
    const ni=nd.querySelector('.node-in');
    ni.style.cssText='transition:transform .5s ease;transform:none;';
    setTimeout(()=>{ ni.style.cssText=''; },500);
  });
});

// ── GLITCH INTERVAL ─────────────────────────────────
// Random horizontal glitch line across screen
setInterval(()=>{
  if(Math.random()>.85){
    const g=document.createElement('div');
    g.style.cssText=`position:fixed;left:0;right:0;top:${Math.random()*100}%;
      height:${Math.random()*3+1}px;background:rgba(255,45,120,${Math.random()*.15});
      z-index:5;pointer-events:none;animation:none;`;
    document.body.appendChild(g);
    setTimeout(()=>g.remove(),80+Math.random()*120);
  }
},300);
