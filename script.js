(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const progress = document.querySelector('.reading-progress');
 const nav = document.querySelector('.nav'), menu = document.querySelector('.menu');
 const glow = document.createElement('div'); glow.className = 'cursor-glow'; glow.setAttribute('aria-hidden','true'); document.body.appendChild(glow);
 if(nav && menu){
   menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'✕':'☰';});
   nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰';}));
 }
 const current=location.pathname.split('/').pop()||'index.html';
 document.querySelectorAll('.nav a').forEach(a=>{if(a.getAttribute('href')===current)a.classList.add('active')});
 if('IntersectionObserver' in window && !reduced){
   const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -30px 0px'});
   document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
 }else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
 const update=()=>{if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%'}};
 addEventListener('scroll',update,{passive:true});update();
 if(!reduced && matchMedia('(pointer:fine)').matches){
   let last=0;
   addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';if(performance.now()-last>95){const dot=document.createElement('i');dot.className='cursor-trail';dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';document.body.appendChild(dot);setTimeout(()=>dot.remove(),700);last=performance.now()}},{passive:true});
 }else glow.style.display='none';
 const toggle=document.querySelector('.dream-toggle');
 if(toggle) toggle.addEventListener('click',()=>{const on=toggle.getAttribute('aria-pressed')!=='true';toggle.setAttribute('aria-pressed',String(on));document.body.classList.toggle('dream-off',!on)});
 document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.classList.add('image-unavailable');},{once:true}));
})();