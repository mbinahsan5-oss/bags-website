const Q=s=>document.querySelector(s),RM=matchMedia('(prefers-reduced-motion:reduce)').matches;let ls=0,tt;
function reveal(){const els=[...document.querySelectorAll('main h2,.why div,.ct,details,blockquote,.card')].filter(e=>!e.classList.contains('in'));
 els.forEach(e=>{e.classList.add('rv0');e.style.setProperty('--d',([...e.parentElement.children].indexOf(e)%4)*.09+'s')});
 if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}
 const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12});els.forEach(e=>io.observe(e))}
function bump(){const c=Q('#cc');c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop')}
function fly(el){const t=Q('#cb').getBoundingClientRect();if(!el||RM)return bump();const r=el.getBoundingClientRect(),d=document.createElement('i');d.className='fly';d.style.left=r.left+r.width/2-20+'px';d.style.top=r.top+r.height/2-20+'px';document.body.appendChild(d);
 d.animate([{transform:'translate(0,0) scale(1.2)',opacity:1},{transform:`translate(${t.left+t.width/2-r.left-r.width/2}px,${t.top+t.height/2-r.top-r.height/2}px) scale(.3)`,opacity:.5}],{duration:750,easing:'cubic-bezier(.55,-.2,.7,1)'}).onfinish=()=>{d.remove();bump()}}
function toast(m){const t=Q('#tst');t.innerHTML=`<span>${m}</span>`+(m=='Added to cart'?'<button class="ib" data-vc>View cart</button>':'');t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2800)}
const hidePre=()=>setTimeout(()=>Q('#pre').classList.add('out'),500);
addEventListener('scroll',()=>{Q('#sprog').style.transform=`scaleX(${scrollY/((document.documentElement.scrollHeight-innerHeight)||1)})`},{passive:true});
document.addEventListener('mousemove',e=>{if(RM)return;const h=e.target.closest&&e.target.closest('.hs');
 if(h){const r=h.getBoundingClientRect();h.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5)*2);h.style.setProperty('--my',((e.clientY-r.top)/r.height-.5)*2)}
 if(matchMedia('(pointer:fine)').matches&&Date.now()-ls>70){ls=Date.now();const s=document.createElement('i');s.className='spk';s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';s.style.background=['#ff5fa2','#a77bff','#ffb88a','#ffd84d'][Math.random()*4|0];document.body.appendChild(s);
  s.animate([{transform:'translate(-50%,-50%) scale(1) rotate(0)',opacity:.9},{transform:`translate(${(Math.random()-.5)*40-6}px,${Math.random()*40+10}px) scale(0) rotate(120deg)`,opacity:0}],{duration:800}).onfinish=()=>s.remove()}});
