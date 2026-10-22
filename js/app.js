const $=s=>document.querySelector(s);
let cart=get(K.c,[]),cat='All',q='',so='f',cp=null,wish=get('petal_wish',[]);
(async()=>{await DB.init();start()})();
const P=()=>DB.P.filter(p=>!p.hide);
const wa=t=>`https://wa.me/${DB.S.wa.replace(/\D/g,'')}?text=${encodeURIComponent(t)}`;
const im=(u,a)=>`<img src="${esc(u)}" alt="${esc(a)}">`;
function start(){const s=DB.S,h=s.hero,a=P()[0],b=P()[1]||a;
 $('.logo').textContent=$('#fn').textContent=s.name;$('#ann').textContent=s.ann;$('#h1').innerHTML=h.title.split(' ').map((w,i)=>`<span class="wd" style="--i:${i}">${esc(w)}</span>`).join(' ');$('#tag').textContent=h.sub;$('#hc').textContent=h.cta;$('#hb').textContent=h.badge;$('#hf').textContent='Free delivery over '+money(s.ship.free);
 $('#slab').innerHTML=`<div class="ph">${h.img?im(h.img,s.name):a?pic(a):''}</div><div class="mi">${h.img2?im(h.img2,s.name):b?pic(b):''}</div>`;
 const mqh=Array(6).fill(s.marquee.map(x=>`<span>${esc(x)}</span>`).join('')).join('');$('#mq').innerHTML=$('#mq2').innerHTML=mqh;
 $('#ctl').innerHTML=s.cats.map(c=>`<button class="ct" data-tilt data-c="${esc(c.n)}">${c.img?im(c.img,c.n):''}<span>${esc(c.n)}</span><small>${P().filter(p=>p.cat==c.n).length} bags</small></button>`).join('');
 $('#wl').innerHTML=s.why.map(w=>`<div data-tilt><h3>${esc(w.t)}</h3><p>${esc(w.d)}</p></div>`).join('');
 $('#rvs').hidden=!s.reviews.length;$('#rl').innerHTML=s.reviews.map(r=>`<blockquote>${esc(r.t)}<b>${esc(r.n)}</b></blockquote>`).join('');
 $('#fl').innerHTML=s.faq.map(f=>`<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
 const f=s.foot;$('#fa').textContent=f.about;$('#fc').innerHTML='<b style="font-size:18px">Contact</b>'+[[f.phone&&'tel:'+f.phone,f.phone],[f.email&&'mailto:'+f.email,f.email],[f.insta,'Instagram'],[f.fb,'Facebook'],[f.tiktok,'TikTok']].filter(x=>x[0]).map(x=>`<a href="${esc(x[0])}" rel="noopener">${esc(x[1])}</a>`).join('')+`<span>${esc(f.addr)}</span>`;
 $('#wa').href=wa('Hi, I want to order a bag from '+s.name);seo();pixel();chips();grid();drawCart();reveal();hidePre();if(location.hash.startsWith('#p-'))view(location.hash.slice(3))}
function meta(sel,v,at='content'){const e=$(sel);if(e&&v)e.setAttribute(at,v)}
function seo(){const s=DB.S,o=s.seo,t=o.title||s.name,img=[o.og,s.hero.img,'assets/black-butterfly.jpg'].find(x=>x&&!x.startsWith('data:'));document.title=t;
 meta('meta[name=description]',o.desc);meta('meta[name=keywords]',o.kw);meta('meta[property="og:title"]',t);meta('meta[property="og:description"]',o.desc);meta('meta[property="og:site_name"]',s.name);
 if(o.url){meta('link[rel=canonical]',o.url,'href');meta('meta[property="og:url"]',o.url);if(img)meta('meta[property="og:image"]',img.startsWith('http')?img:o.url.replace(/\/?$/,'/')+img)}
 $('#ld').textContent=JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"Store","name":s.name,"description":o.desc,"url":o.url||undefined,"address":{"@type":"PostalAddress","addressCountry":"PK","streetAddress":s.foot.addr},"priceRange":"PKR"},{"@type":"ItemList","itemListElement":P().map((p,i)=>({"@type":"ListItem","position":i+1,"item":{"@type":"Product","name":p.name,"description":p.desc,"category":p.cat,"image":p.img&&!p.img.startsWith('data:')?p.img:undefined,"offers":{"@type":"Offer","priceCurrency":"PKR","price":price(p),"availability":p.stock>0?"https://schema.org/InStock":"https://schema.org/OutOfStock"}}}))}]})}
function chips(){const c=['All',...DB.S.cats.map(x=>x.n)];$('#chips').innerHTML=c.map(x=>`<button class="chip ${x==cat?'on':''}" data-c="${esc(x)}">${esc(x)}</button>`).join('')+`<button class="chip ${cat=='__w'?'on':''}" data-c="__w">Saved (${wish.length})</button>`}
function grid(){let l=P().filter(p=>(cat=='All'||(cat=='__w'?wish.includes(p.id):p.cat==cat))&&p.name.toLowerCase().includes(q));
 if(so=='lo')l.sort((a,b)=>price(a)-price(b));if(so=='hi')l.sort((a,b)=>price(b)-price(a));
 $('#grid').innerHTML=l.map(p=>`<article class="card" data-tilt><button class="hrt ${wish.includes(p.id)?'on':''}" data-hr="${p.id}" aria-label="Save ${esc(p.name)}" aria-pressed="${wish.includes(p.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button><button class="pic" data-v="${p.id}" aria-label="View ${esc(p.name)}" style="--c:${p.color}">${pic(p)}${p.sale>0?'<span class="tag">Sale</span>':''}${p.best?'<span class="tag t2">Best seller</span>':''}${p.stock<1?'<span class="tag out">Sold out</span>':''}</button><div class="inf"><h3>${esc(p.name)}</h3><p>${esc(p.cat)}</p><div class="row"><b>${money(price(p))}</b>${p.sale>0?`<s>${money(p.price)}</s>`:''}<button class="btn sm" data-a="${p.id}" ${p.stock<1?'disabled':''}>Add</button></div></div></article>`).join('')||'<p>No bags match your search. Try another word or category.</p>';reveal()}
function view(id){const p=DB.P.find(x=>x.id==id);if(!p)return;history.replaceState(null,'','#p-'+id);document.title=p.name+' | '+DB.S.name;
 $('#pm').innerHTML=`<div class="pmg"><div class="pimg" style="--c:${p.color}">${pic(p)}</div><div><h2>${esc(p.name)}</h2><p>${esc(p.desc)}</p><p class="row"><b>${money(price(p))}</b>${p.sale>0?`<s>${money(p.price)}</s>`:''}</p><p>${p.stock<1?'Sold out':p.stock<5?'Only '+p.stock+' left':'In stock'}</p><div class="btns"><button class="btn" data-a="${p.id}" ${p.stock<1?'disabled':''}>Add to cart</button><a class="btn ghost" target="_blank" rel="noopener" href="${wa('Hi, I want to order: '+p.name+' ('+money(price(p))+')')}">Order on WhatsApp</a></div></div></div>`;$('#pd').showModal();tr('view',evP(p))}
$('#pd').onclose=()=>{history.replaceState(null,'',location.pathname+location.search);seo()};
function save(){set(K.c,cart);drawCart()}
function add(id,el){const p=DB.P.find(x=>x.id==id),i=cart.find(x=>x.id==id);if(i){if(i.n<p.stock)i.n++}else cart.push({id,n:1});save();tr('cart',evP(p));fly(el);$('#pd').close();toast('Added to cart')}
function tot(){let sub=0;cart.forEach(i=>{sub+=price(DB.P.find(x=>x.id==i.id))*i.n});const d=cp?Math.round(sub*cp.pct/100):0,sh=sub&&sub-d<DB.S.ship.free?DB.S.ship.fee:0;return{sub,d,sh,t:sub-d+sh}}
function drawCart(){cart=cart.filter(i=>DB.P.some(p=>p.id==i.id));$('#cc').textContent=cart.reduce((s,i)=>s+i.n,0);
 $('#ci').innerHTML=cart.map(i=>{const p=DB.P.find(x=>x.id==i.id);return `<div class="ci"><div class="t" style="--c:${p.color}">${pic(p)}</div><div><b>${esc(p.name)}</b><br>${money(price(p))} x ${i.n}</div><button data-m="${i.id}" aria-label="Fewer">-</button><button data-p="${i.id}" aria-label="More">+</button></div>`}).join('')||'<p>Your cart is empty. Add a bag you love.</p>';
 const t=tot();$('#tt').innerHTML=`<div class="sm2"><span>Subtotal</span><span>${money(t.sub)}</span></div>${cp?`<div class="sm2"><span>Coupon ${esc(cp.code)}</span><span>-${money(t.d)}</span></div>`:''}<div class="sm2"><span>Delivery</span><span>${t.sh?money(t.sh):'Free'}</span></div><div class="sm2" style="font:800 22px Fraunces,serif"><span>Total</span><span>${money(t.t)}</span></div>`;$('#go').disabled=!cart.length;$('#ct').textContent='Total to pay on delivery: '+money(t.t)}
document.addEventListener('click',e=>{const t=e.target.closest('button,dialog');if(!t)return;const d=t.dataset||{};
 if(d.hr){const i=wish.indexOf(d.hr);i<0?wish.push(d.hr):wish.splice(i,1);set('petal_wish',wish);t.classList.toggle('on',i<0);t.setAttribute('aria-pressed',i<0);chips();if(cat=='__w')grid();toast(i<0?'Saved to favourites':'Removed from favourites')}else if(d.v)view(d.v);else if(d.a)add(d.a,t.closest('.card,#pm')?.querySelector('.pic,.pimg'));else if('vc' in d)$('#ds').classList.add('open');else if(d.c!=null){cat=d.c;chips();grid();$('#shop').scrollIntoView()}
 else if(d.m||d.p){const i=cart.find(x=>x.id==(d.m||d.p)),p=DB.P.find(x=>x.id==i.id);i.n+=d.p?(i.n<p.stock?1:0):-1;cart=cart.filter(x=>x.n>0);save()}
 else if('close' in d)t.closest('dialog').close();
 else if(t.id=='cb')$('#ds').classList.add('open');else if(t.id=='dx')$('#ds').classList.remove('open');
 else if(t.id=='bg'){const n=$('#nv').classList.toggle('open');t.setAttribute('aria-expanded',n)}
 else if(t.id=='go'){tr('checkout',evC());$('#ds').classList.remove('open');$('#cd').showModal()}
 else if(t.tagName=='DIALOG')t.close()});
document.querySelectorAll('nav a').forEach(a=>a.onclick=()=>$('#nv').classList.remove('open'));
$('#q').oninput=e=>{q=e.target.value.toLowerCase();grid()};$('#so').onchange=e=>{so=e.target.value;grid()};
$('#cpf').onsubmit=e=>{e.preventDefault();const c=DB.S.coupons.find(x=>x.on&&x.code.toUpperCase()==$('#cpi').value.trim().toUpperCase());cp=c||null;if(!c)alert('That coupon code is not valid.');drawCart()};
$('#cf').onsubmit=e=>{e.preventDefault();const t=tot(),s=DB.S,ev=evC();
 const lines=cart.map(i=>{const p=DB.P.find(x=>x.id==i.id);return `${i.n} x ${p.name} (${money(price(p))})`});
 const o={id:'o'+Date.now(),date:new Date().toISOString(),name:$('#cn').value,phone:$('#cp').value,addr:$('#ca').value+', '+$('#cy').value,lines,total:t.t,status:'New',src:src()};
 const os=get(K.o,[]);os.unshift(o);set(K.o,os);
 const msg=`New order from ${o.name}\n${lines.join('\n')}\nSubtotal: ${money(t.sub)}${cp?`\nCoupon ${cp.code}: -${money(t.d)}`:''}\nDelivery: ${t.sh?money(t.sh):'Free'}\nTotal (cash on delivery): ${money(t.t)}\nPhone: ${o.phone}\nAddress: ${o.addr}${src()?'\nSource: '+src():''}`;
 tr('buy',ev);cart=[];cp=null;save();$('#cd').close();$('#cf').reset();window.open(wa(msg),'_blank')};
document.addEventListener('mousemove',e=>{const t=e.target.closest&&e.target.closest('[data-tilt]');document.querySelectorAll('[data-tilt].on').forEach(x=>{if(x!==t){x.style.transform='';x.classList.remove('on')}});if(!t)return;const r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;t.classList.add('on');t.style.transform=`perspective(800px) rotateY(${x*12}deg) rotateX(${-y*12}deg) translateY(-6px)`});
