// Radar uses Mapbox for the basemap; event coordinates remain demonstration data.
(()=>{
 const root=document.getElementById('radar-view');if(!root)return;
 const events=[
  {name:'Noche de nuevas frecuencias',artist:'Luna Marea · Electrónica',place:'San Antonio',day:'VIE',date:'27 NOV',image:'assets/artist-portrait-v02.png',organizer:'NOODO Encuentros',price:35000,currency:'COP',coordinates:[-76.5415,3.4445]},
  {name:'Un patio para sonar',artist:'Cimarrón Sonoro · Fusión Pacífico',place:'Granada',day:'SÁB',date:'28 NOV',image:'assets/live-session-v02.png',organizer:'Patio Sonoro',price:0,currency:'COP',coordinates:[-76.5360,3.4595]},
  {name:'La ciudad en vivo',artist:'Bruma Roja · Indie',place:'San Fernando',day:'DOM',date:'29 NOV',image:'assets/live-session-v02.png',organizer:'Colectivo Nuevas Frecuencias',price:25000,currency:'COP',coordinates:[-76.5420,3.4295]}
 ];
 let selected=0,mapHidden=false,resultView='list';
 try{mapHidden=localStorage.getItem('noodo-radar-map-hidden')==='true';}catch{}
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 window.noodoRadarEventCard={render(event,{selected=false}={}){
  const price=event.price===0?'Gratis':Number.isFinite(event.price)?new Intl.NumberFormat('es-CO',{style:'currency',currency:event.currency||'COP',maximumFractionDigits:0}).format(event.price)+' COP':'Precio por confirmar';
  return `<button type="button" class="radar-card" data-radar-event="${event.id}" aria-pressed="${selected}"><img class="radar-event-image" src="${escape(event.image)}" alt="" loading="lazy"><span class="radar-event-copy"><span class="radar-date">${escape(event.day)} · ${escape(event.date)}</span><strong>${escape(event.name)}</strong><span>${escape(event.artist)}</span><span>Organiza: ${escape(event.organizer||'Por confirmar')}</span><small>⌖ ${escape(event.place)}</small><span class="radar-price" data-free="${event.price===0}">${escape(price)}</span></span><span class="radar-ticket-stub" aria-hidden="true"><span class="radar-ticket-brand">NOODO</span><span class="radar-card-arrow">↗</span><span class="radar-ticket-label">RADAR</span></span></button>`;
 }};
 root.innerHTML=`<header class="radar-heading">${window.noodoPageTitle.render("Radar")}<label class="radar-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><input type="search" placeholder="Evento, artista o zona" aria-label="Buscar eventos por nombre, artista o zona"></label></header><div class="radar-location"><span>⌖ Cali, Colombia</span></div><div class="radar-layout"><section id="radar-map-section" class="radar-map-section" aria-label="Mapa de eventos"><button class="pill outline" id="radar-toggle-map" aria-controls="radar-mapbox">Ocultar mapa</button><div class="radar-map"><div id="radar-mapbox" aria-label="Mapa de eventos en Cali"></div><div class="radar-map-status" role="status"><p>Preparando el mapa…</p><button type="button" class="pill outline" id="radar-map-retry" hidden>Reintentar</button></div></div></section><section class="radar-results" aria-label="Eventos de muestra"><div class="radar-results-heading"><h2>En el radar</h2><span id="radar-count" role="status"></span><div class="radar-view-switch" role="group" aria-label="Vista de eventos"><button type="button" data-radar-view="list">Lista</button><button type="button" data-radar-view="grid">Tarjetas</button></div></div><div class="radar-cards"></div><p class="radar-empty" hidden>No encontramos eventos. Prueba con otro artista o zona.</p></section></div><p class="radar-footnote">Explora esta primera vista con eventos de ejemplo. Pronto podrás descubrir la agenda y sus ubicaciones reales.</p>`;

 let map=null,loading=false,sdkPromise=null,eventPopup=null,popupEvent=null;
 const markers=new Map(),status=root.querySelector('.radar-map-status'),retry=root.querySelector('#radar-map-retry');
 function showStatus(message,canRetry=false){status.hidden=false;status.querySelector('p').textContent=message;retry.hidden=!canRetry;}
 function loadSDK(){
  if(window.mapboxgl)return Promise.resolve();
  if(sdkPromise)return sdkPromise;
  sdkPromise=new Promise((resolve,reject)=>{
   const css=document.createElement('link');css.rel='stylesheet';css.href='https://api.mapbox.com/mapbox-gl-js/v3.35.0/mapbox-gl.css';
   const script=document.createElement('script');script.src='https://api.mapbox.com/mapbox-gl-js/v3.35.0/mapbox-gl.js';script.async=true;
   const timer=setTimeout(()=>fail(),20000);
   function fail(){clearTimeout(timer);script.remove();css.remove();sdkPromise=null;reject(new Error('SDK unavailable'));}
   script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=fail;
   document.head.append(css,script);
  });return sdkPromise;
 }
 function updateMarkers(visible){
  if(!map)return;
  const ids=new Set(visible.map(e=>e.id));
  for(const [id,marker] of markers)if(!ids.has(id)){marker.remove();markers.delete(id);}
  for(const e of visible){
   let marker=markers.get(e.id);
   if(!marker){const button=document.createElement('button');button.type='button';button.className='radar-pin';button.dataset.radarEvent=e.id;button.textContent=e.id+1;button.setAttribute('aria-label',`Seleccionar ${e.name}, ${e.place}`);marker=new mapboxgl.Marker({element:button}).setLngLat(e.coordinates).addTo(map);button.setAttribute('role','button');markers.set(e.id,marker);}
   marker.getElement().setAttribute('aria-pressed',String(e.id===selected));
  }
 }
 async function ensureMap(){
  if(root.hidden||mapHidden||loading)return;
  if(map){map.resize();return;}
  const token=window.NOODO_MAPBOX?.accessToken?.trim();
  if(!token||!token.startsWith('pk.')){showStatus('El mapa estará disponible pronto. Mientras tanto, explora los eventos.');return;}
  loading=true;showStatus('Cargando mapa de Cali…');
  try{
   await loadSDK();
   if(root.hidden||mapHidden)return;
   if(!mapboxgl.supported())throw new Error('WebGL unavailable');
   map=new mapboxgl.Map({container:'radar-mapbox',accessToken:token,style:window.NOODO_MAPBOX.style||'mapbox://styles/mapbox/dark-v11',center:[-76.538,3.445],zoom:12.3,cooperativeGestures:true});
   map.addControl(new mapboxgl.NavigationControl({showCompass:false}),'top-right');
   map.on('load',()=>{status.hidden=true;map.resize();});
   map.on('error',()=>showStatus('No pudimos cargar el mapa. Puedes seguir explorando los eventos.',true));
   render();
  }catch(error){showStatus('No pudimos cargar el mapa. Revisa tu conexión e inténtalo de nuevo.',true);}
  finally{loading=false;}
 }
 retry.addEventListener('click',()=>{eventPopup?.remove();eventPopup=null;popupEvent=null;for(const marker of markers.values())marker.remove();markers.clear();map?.remove();map=null;ensureMap();});
 new MutationObserver(()=>ensureMap()).observe(root,{attributes:true,attributeFilter:['hidden']});
 new ResizeObserver(()=>{if(map&&!root.hidden)map.resize();}).observe(root.querySelector('.radar-map'));
 const input=root.querySelector('input');
 const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function render(){
  const query=normalize(input.value.trim());
  const visible=events.map((event,id)=>({...event,id})).filter(e=>normalize(e.name+' '+e.artist+' '+e.place+' '+e.organizer).includes(query));
  if(!visible.some(e=>e.id===selected))selected=visible[0]?.id??-1;
  root.querySelector('#radar-count').textContent=visible.length+' eventos';
  root.querySelector('.radar-empty').hidden=visible.length>0;
  root.querySelector('.radar-cards').innerHTML=visible.map(event=>window.noodoRadarEventCard.render(event,{selected:event.id===selected})).join('');
  if(popupEvent!==null&&!visible.some(e=>e.id===popupEvent)){eventPopup?.remove();eventPopup=null;popupEvent=null;}
  updateMarkers(visible);
 }

 function showEventOnMap(id){
  const event=events[id];
  eventPopup?.remove();popupEvent=id;
  const card=document.createElement('article');card.className='radar-map-event';
  const price=event.price===0?'Gratis':new Intl.NumberFormat('es-CO').format(event.price)+' COP';
  card.innerHTML=`<img src="${escape(event.image)}" alt=""><div><span class="radar-date">${escape(event.day)} · ${escape(event.date)}</span><h3>${escape(event.name)}</h3><p>${escape(event.artist)}</p><p>Organiza: ${escape(event.organizer)}</p><p>⌖ ${escape(event.place)}</p><strong>${escape(price)}</strong></div>`;
  eventPopup=new mapboxgl.Popup({className:'radar-event-popup',anchor:'bottom',offset:28,maxWidth:'260px',closeButton:true,closeOnClick:false,focusAfterOpen:false}).setLngLat(event.coordinates).setDOMContent(card).addTo(map);
  map.easeTo({center:event.coordinates,zoom:17,offset:[0,Math.min(110,map.getContainer().clientHeight*.22)],duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:850});
 }
 input.addEventListener('input',render);
 root.addEventListener('click',e=>{const button=e.target.closest('[data-radar-event]');if(!button)return;selected=Number(button.dataset.radarEvent);const isPin=button.classList.contains('radar-pin');render();if(map&&!mapHidden)showEventOnMap(selected);root.querySelector(`.${isPin?'radar-pin':'radar-card'}[data-radar-event="${selected}"]`)?.focus({preventScroll:true});});
 const mapSection=root.querySelector('.radar-map-section'),mapToggle=root.querySelector('#radar-toggle-map');
 root.querySelector('.radar-cards').tabIndex=0;root.querySelector('.radar-cards').setAttribute('aria-label','Lista de eventos, desplazamiento independiente');
 function applyLayout(){
  mapSection.querySelector('.radar-map').hidden=mapHidden;root.classList.toggle('radar-map-hidden',mapHidden);root.dataset.eventView=resultView;
  mapToggle.textContent=mapHidden?'Mostrar mapa':'Ocultar mapa';mapToggle.setAttribute('aria-expanded',String(!mapHidden));
  root.querySelectorAll('[data-radar-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.radarView===resultView)));
  try{localStorage.setItem('noodo-radar-map-hidden',String(mapHidden));}catch{}
  requestAnimationFrame(()=>{sizeMap();if(!mapHidden)ensureMap();});
 }
 mapToggle.onclick=()=>{mapHidden=!mapHidden;if(mapHidden){eventPopup?.remove();eventPopup=null;popupEvent=null;}applyLayout();};
 root.querySelectorAll('[data-radar-view]').forEach(button=>button.onclick=()=>{resultView=button.dataset.radarView;applyLayout();});
 function sizeMap(){
  if(root.hidden||mapHidden)return;
  const dock=document.querySelector('.player-dock').getBoundingClientRect();
  // Use the layout's document position, not the map's moving viewport position.
  const top=root.querySelector('.radar-layout').getBoundingClientRect().top+window.scrollY;
  const bottom=Math.min(innerHeight-12,dock.top-12);
  root.style.setProperty('--radar-map-height',Math.max(180,bottom-top)+'px');
 }
 let resizeFrame=0;function scheduleMapSize(){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(sizeMap);}
 window.addEventListener('resize',scheduleMapSize);
 const chromeObserver=new ResizeObserver(scheduleMapSize);chromeObserver.observe(document.querySelector('.player-topbar'));chromeObserver.observe(document.querySelector('.player-dock'));
 new MutationObserver(scheduleMapSize).observe(root,{attributes:true,attributeFilter:['hidden']});
 render();applyLayout();
 ensureMap();
})();