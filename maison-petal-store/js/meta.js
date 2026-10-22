const FB={view:'ViewContent',cart:'AddToCart',checkout:'InitiateCheckout',wa:'Contact'};
const tr=(k,d)=>{const m=DB.S.meta;if(window.fbq&&m.on[k])fbq('track',k=='buy'?m.orderEv:FB[k],d)};
const evP=(p,n=1)=>({content_ids:[p.id],content_type:'product',content_name:p.name,content_category:p.cat,contents:[{id:p.id,quantity:n}],value:price(p)*n,currency:'PKR'});
const evC=()=>({content_ids:cart.map(i=>i.id),content_type:'product',contents:cart.map(i=>({id:i.id,quantity:i.n})),num_items:cart.reduce((s,i)=>s+i.n,0),value:tot().t,currency:'PKR'});
function pixel(){const m=DB.S.meta,id=m.pixel;if(!/^\d{6,20}$/.test(id||''))return;
 const go=()=>{!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',id);fbq('track','PageView')};
 const c=localStorage.petal_consent;if(!m.consent||c=='1')return go();if(c=='0')return;
 const b=document.createElement('div');b.className='cons';b.innerHTML='<p>We use cookies and Meta Pixel to show relevant ads and measure results.</p><button class="btn sm" data-y>Accept</button><button class="ib" data-n>Decline</button>';document.body.appendChild(b);
 b.onclick=e=>{const y=e.target.dataset||{};if('y' in y||'n' in y){localStorage.petal_consent='y' in y?'1':'0';b.remove();if('y' in y)go()}}}
(()=>{const p=new URLSearchParams(location.search),s=['utm_source','utm_medium','utm_campaign','utm_content'].filter(x=>p.get(x)).map(x=>x.slice(4)+': '+p.get(x));if(p.get('fbclid'))s.push('fbclid');if(s.length)sessionStorage.petal_src=s.join(', ')})();
const src=()=>sessionStorage.petal_src||'';
document.addEventListener('click',e=>{if(e.target.closest('a[href^="https://wa.me"]'))tr('wa',{})});
