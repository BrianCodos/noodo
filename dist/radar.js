// Radar uses Mapbox for the basemap; event coordinates remain demonstration data.
(()=>{
 const root=document.getElementById('radar-view');if(!root)return;
 const events=window.noodoRadarEvents;
 let selected=-1,mapHidden=false,resultView='grid';
 try{mapHidden=localStorage.getItem('noodo-radar-map-hidden')==='true';}catch{}
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const savedKey='noodo-saved-events';
 let saved=new Set();
 try{const values=JSON.parse(localStorage.getItem(savedKey)||'[]');if(Array.isArray(values))saved=new Set(values.filter(id=>Number.isInteger(id)&&events[id]));}catch{}
 const viewLink=window.noodoEventCard.viewLink;
 const actions=(event,id)=>window.noodoEventCard.actions(event,id,saved.has(id));
 window.noodoRadarEventCard=window.noodoEventCard;
 let feedbackTimer;
 function feedback(message){const toast=document.getElementById('toast');if(!toast)return;toast.textContent=message;toast.classList.add('visible');clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>toast.classList.remove('visible'),3500);}
 root.innerHTML=`<h1 class="radar-sr-only">Radar</h1><div class="radar-location"><span>⌖ Cali, Colombia</span></div><div class="radar-layout"><section id="radar-map-section" class="radar-map-section" aria-label="Mapa de eventos"><div class="radar-map"><div id="radar-mapbox" aria-label="Mapa de eventos en Cali"></div><div class="radar-map-status" role="status"><p>Preparando el mapa…</p><button type="button" class="pill outline" id="radar-map-retry" hidden>Reintentar</button></div></div></section><section class="radar-results" aria-label="Eventos de muestra"><div class="radar-results-heading"><span id="radar-count" class="radar-sr-only" role="status"></span><div class="radar-view-switch" role="group" aria-label="Vista de eventos"><button type="button" id="radar-toggle-map" aria-label="Ocultar mapa" title="Ocultar mapa" aria-controls="radar-map-section"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3ZM9 3v15M15 6v15"/></svg></button><button type="button" data-radar-view="grid" aria-label="Ver eventos en cuadrícula" title="Cuadrícula"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></button><button type="button" data-radar-view="list" aria-label="Ver eventos en lista" title="Lista"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/></svg></button></div></div><div class="radar-cards"></div><p class="radar-empty" hidden>No encontramos eventos. Prueba con otro artista o zona.</p></section></div><p class="radar-footnote">Explora esta primera vista con eventos de ejemplo. Pronto podrás descubrir la agenda y sus ubicaciones reales.</p>`;

 const viewSwitch=root.querySelector('.radar-view-switch');

 let map=null,mapReady=false,loading=false,sdkPromise=null,eventPopup=null,popupEvent=null;
 const markers=new Map(),status=root.querySelector('.radar-map-status'),retry=root.querySelector('#radar-map-retry');
 function showStatus(message,canRetry=false){status.hidden=false;status.querySelector('p').textContent=message;retry.hidden=!canRetry;}
 function loadSDK(){return window.noodoLoadMapbox();}
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
   map=new mapboxgl.Map({container:'radar-mapbox',accessToken:token,style:window.NOODO_MAPBOX.style||'mapbox://styles/mapbox/dark-v11',center:[-76.538,3.445],zoom:12.3,cooperativeGestures:matchMedia('(pointer:coarse)').matches});
   map.addControl(new mapboxgl.NavigationControl({showCompass:false}),'top-right');
   map.on('load',()=>{mapReady=true;status.hidden=true;map.resize();if(selected>=0)showEventOnMap(selected);});
   map.on('error',()=>showStatus('No pudimos cargar el mapa. Puedes seguir explorando los eventos.',true));
   render();
  }catch(error){showStatus('No pudimos cargar el mapa. Revisa tu conexión e inténtalo de nuevo.',true);}
  finally{loading=false;}
 }
 retry.addEventListener('click',()=>{eventPopup?.remove();eventPopup=null;popupEvent=null;for(const marker of markers.values())marker.remove();markers.clear();map?.remove();map=null;mapReady=false;ensureMap();});
 new MutationObserver(()=>ensureMap()).observe(root,{attributes:true,attributeFilter:['hidden']});
 new ResizeObserver(()=>{if(map&&!root.hidden)map.resize();}).observe(root.querySelector('.radar-map'));

 let dateFilter={mode:'all',start:'',end:''};
 const filterButton=document.createElement('button');filterButton.type='button';filterButton.className='icon-button radar-date-toggle';filterButton.setAttribute('aria-label','Filtrar eventos por fecha');filterButton.setAttribute('aria-expanded','false');filterButton.setAttribute('aria-controls','radar-date-filters');filterButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/></svg>';
 viewSwitch.prepend(filterButton);
 const datePanel=document.createElement('form');datePanel.id='radar-date-filters';datePanel.className='radar-date-filters';datePanel.hidden=true;
 datePanel.innerHTML='<label>Cuándo<select name="mode"><option value="all">Cualquier fecha</option><option value="day">Un día</option><option value="week">Esta semana</option><option value="range">Rango de fechas</option></select></label><label data-date-start hidden><span>Fecha</span><input type="date" name="start"></label><label data-date-end hidden>Hasta<input type="date" name="end"></label><button type="submit" class="pill primary">Aplicar</button><button type="button" class="text-button" data-date-clear>Limpiar</button><p role="status" class="radar-date-status"></p>';
 root.querySelector('.radar-location').after(datePanel);
 const modeInput=datePanel.elements.mode,startInput=datePanel.elements.start,endInput=datePanel.elements.end;
 function todayColombia(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
 function weekRange(today){const day=new Date(today+'T12:00:00Z');const monday=new Date(day);monday.setUTCDate(day.getUTCDate()-((day.getUTCDay()+6)%7));const sunday=new Date(monday);sunday.setUTCDate(monday.getUTCDate()+6);return [monday.toISOString().slice(0,10),sunday.toISOString().slice(0,10)];}
 function matchesDate(date){return !dateFilter.start||(date>=dateFilter.start&&date<=dateFilter.end);}
 function closeFilters(){datePanel.hidden=true;filterButton.setAttribute('aria-expanded','false');}
 filterButton.onclick=()=>{datePanel.hidden=!datePanel.hidden;filterButton.setAttribute('aria-expanded',String(!datePanel.hidden));if(!datePanel.hidden)modeInput.focus();};
 modeInput.onchange=()=>{const mode=modeInput.value;datePanel.querySelector('[data-date-start]').hidden=!['day','range'].includes(mode);datePanel.querySelector('[data-date-start] span').textContent=mode==='range'?'Desde':'Fecha';datePanel.querySelector('[data-date-end]').hidden=mode!=='range';startInput.required=['day','range'].includes(mode);endInput.required=mode==='range';startInput.disabled=!startInput.required;endInput.disabled=!endInput.required;if(startInput.required&&!startInput.value)startInput.value=todayColombia();endInput.setCustomValidity('');};
 startInput.oninput=()=>{endInput.min=startInput.value;endInput.setCustomValidity('');};endInput.oninput=()=>endInput.setCustomValidity('');
 datePanel.onsubmit=e=>{e.preventDefault();const mode=modeInput.value;let start='',end='';if(mode==='week')[start,end]=weekRange(todayColombia());else if(mode==='day')start=end=startInput.value;else if(mode==='range'){start=startInput.value;end=endInput.value;if(end<start){endInput.setCustomValidity('La fecha final debe ser igual o posterior a la inicial.');endInput.reportValidity();return;}}dateFilter={mode,start,end};filterButton.classList.toggle('active',mode!=='all');filterButton.setAttribute('aria-label',mode==='all'?'Filtrar eventos por fecha':'Filtrar eventos por fecha: '+(mode==='week'?'esta semana':start+(start!==end?' a '+end:'')));render();closeFilters();filterButton.focus();};
 datePanel.querySelector('[data-date-clear]').onclick=()=>{dateFilter={mode:'all',start:'',end:''};modeInput.value='all';modeInput.onchange();filterButton.classList.remove('active');filterButton.setAttribute('aria-label','Filtrar eventos por fecha');render();closeFilters();filterButton.focus();};
 datePanel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();closeFilters();filterButton.focus();}});
 modeInput.onchange();
 let searchQuery='';
 const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function render(){
  const query=normalize(searchQuery.trim());
  const visible=events.map((event,id)=>({...event,id})).filter(e=>normalize(e.name+' '+e.artist+' '+e.place+' '+e.organizer+' '+e.category+' '+e.code).includes(query)&&matchesDate(e.dateISO));
  if(!visible.some(e=>e.id===selected))selected=-1;
  root.querySelector('#radar-count').textContent=visible.length+(visible.length===1?' evento':' eventos')+(dateFilter.start?' · '+dateFilter.start+' a '+dateFilter.end:'');
  root.querySelector('.radar-empty').hidden=visible.length>0;
  root.querySelector('.radar-cards').innerHTML=visible.map(event=>window.noodoRadarEventCard.render(event,{selected:event.id===selected,saved:saved.has(event.id)})).join('');
  if(popupEvent!==null&&!visible.some(e=>e.id===popupEvent)){eventPopup?.remove();eventPopup=null;popupEvent=null;}
  updateMarkers(visible);
 }

 function restoreMapOverview(){
  eventPopup=null;popupEvent=null;selected=-1;render();
  if(!map||!mapReady)return;
  const duration=matchMedia('(prefers-reduced-motion:reduce)').matches?0:850;
  const visible=[...markers.keys()].map(id=>events[id].coordinates);
  if(visible.length>1){const bounds=new mapboxgl.LngLatBounds();visible.forEach(point=>bounds.extend(point));map.fitBounds(bounds,{padding:48,maxZoom:12.3,bearing:0,pitch:0,offset:[0,0],duration});}
  else map.easeTo({center:visible[0]||[-76.538,3.445],zoom:12.3,bearing:0,pitch:0,offset:[0,0],duration});
 }

 function showEventOnMap(id){
  const event=events[id];
  eventPopup?.remove();popupEvent=id;
  const card=document.createElement('article');card.className='radar-map-event';
  const price=event.price===0?'Gratis':new Intl.NumberFormat('es-CO').format(event.price)+' COP';
  const directions='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(event.coordinates[1]+','+event.coordinates[0]);
  card.innerHTML=`<img src="${escape(event.image)}" alt=""><div><span class="radar-date">${escape(event.day)} · ${escape(event.date)}</span><h3>${escape(event.name)}</h3><p>${escape(event.artist)}</p><p>Organiza: ${escape(event.organizer)}</p><p>⌖ ${escape(event.place)}</p><strong>${escape(price)}</strong></div><footer class="radar-popup-actions" role="group" aria-label="Acciones del evento">${viewLink(event,id)}<a class="radar-directions" href="${escape(directions)}" target="_blank" rel="noopener noreferrer" aria-label="Cómo llegar a ${escape(event.place)} en Google Maps"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 9-9 9-9-9 9-9Z"/><path d="M8 15v-4h7m-3-3 3 3-3 3"/></svg></a>${actions(event,id)}</footer>`;
  card.querySelectorAll('.radar-popup-actions a').forEach(link=>{link.title=link.getAttribute('aria-label');if(link.classList.contains('radar-view-event'))[...link.childNodes].filter(node=>node.nodeType===3).forEach(node=>node.remove());});
  eventPopup=new mapboxgl.Popup({className:'radar-event-popup',anchor:'bottom',offset:28,maxWidth:'380px',closeButton:true,closeOnClick:false,focusAfterOpen:false}).setLngLat(event.coordinates).setDOMContent(card).addTo(map);
  const close=eventPopup.getElement().querySelector('.mapboxgl-popup-close-button');
  close?.setAttribute('aria-label','Cerrar tarjeta y mostrar todos los eventos');
  close?.addEventListener('click',restoreMapOverview,{once:true});
  map.easeTo({center:event.coordinates,zoom:17+Math.log2(.8),offset:[0,Math.min(110,map.getContainer().clientHeight*.22)],duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:850});
 }
 root.addEventListener('click',async e=>{
  const save=e.target.closest('[data-save-event]');
  if(save){
   const id=Number(save.dataset.saveEvent),next=new Set(saved);next.has(id)?next.delete(id):next.add(id);
   try{localStorage.setItem(savedKey,JSON.stringify([...next]));}catch{feedback('No se pudo guardar el evento en este navegador.');return;}
   saved=next;
   root.querySelectorAll(`[data-save-event="${id}"]`).forEach(button=>{button.setAttribute('aria-pressed',String(saved.has(id)));button.title=saved.has(id)?'Quitar de guardados':'Guardar evento';button.setAttribute('aria-label',`${button.title}: ${events[id].name}`);});
   feedback(saved.has(id)?'Evento guardado en este navegador.':'Evento eliminado de guardados.');return;
  }
  const share=e.target.closest('[data-share-event]');if(!share)return;
  const id=Number(share.dataset.shareEvent),url=new URL('event.html?event='+id,location.href).href;
  try{
   if(navigator.share&&matchMedia('(pointer:coarse)').matches){await navigator.share({title:events[id].name,url});}
   else{await navigator.clipboard.writeText(url);feedback('Enlace del evento copiado para compartir.');}
  }catch(error){if(error.name!=='AbortError')feedback('No se pudo compartir el enlace. Abre el evento y copia su dirección.');}
 });
 window.noodoRadarSearch={setQuery(value){if(searchQuery===value)return;searchQuery=value;render();root.querySelector('.radar-cards').scrollTop=0;}};
 async function selectEvent(id){
  selected=id;render();
  if(mapHidden){mapHidden=false;applyLayout();}
  await ensureMap();
  if(mapReady)showEventOnMap(id);
  if(root.clientWidth<=760)mapSection.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 }
 root.addEventListener('click',e=>{
  const pin=e.target.closest('[data-radar-event]');
  if(pin){selectEvent(Number(pin.dataset.radarEvent));return;}
  const card=e.target.closest('[data-card-event]');
  if(!card||e.target.closest('a,[data-save-event],[data-share-event]'))return;
  const id=Number(card.dataset.cardEvent);
  if(selected===id){window.noodoWorkspace.navigate('event.html?event='+id);return;}
  const keyboard=e.detail===0;
  selectEvent(id).then(()=>{if(keyboard)root.querySelector(`[data-select-event="${id}"]`)?.focus({preventScroll:true});});
 });
 const mapSection=root.querySelector('.radar-map-section'),mapToggle=root.querySelector('#radar-toggle-map');
 root.querySelector('.radar-cards').tabIndex=0;root.querySelector('.radar-cards').setAttribute('aria-label','Lista de eventos, desplazamiento independiente');
 function applyLayout(){
  mapSection.hidden=mapHidden;root.classList.toggle('radar-map-hidden',mapHidden);root.dataset.eventView=resultView;
  mapToggle.setAttribute('aria-label',mapHidden?'Mostrar mapa':'Ocultar mapa');mapToggle.title=mapToggle.getAttribute('aria-label');mapToggle.setAttribute('aria-expanded',String(!mapHidden));mapToggle.setAttribute('aria-pressed',String(!mapHidden));
  viewSwitch.querySelectorAll('[data-radar-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.radarView===resultView)));
  try{localStorage.setItem('noodo-radar-map-hidden',String(mapHidden));}catch{}
  requestAnimationFrame(()=>{sizeMap();if(!mapHidden)ensureMap();});
 }
 mapToggle.onclick=()=>{mapHidden=!mapHidden;if(mapHidden){eventPopup?.remove();eventPopup=null;popupEvent=null;}applyLayout();};
 viewSwitch.querySelectorAll('[data-radar-view]').forEach(button=>button.onclick=()=>{resultView=button.dataset.radarView;applyLayout();});
 function sizeMap(){
  if(root.hidden)return;
  document.body.classList.add('radar-mode');
  root.style.setProperty('--radar-workspace-height',Math.max(360,innerHeight-root.getBoundingClientRect().top-24)+'px');
  const dock=document.querySelector('.player-dock').getBoundingClientRect();
  // Use the layout's document position, not the map's moving viewport position.
  const top=root.querySelector('.radar-layout').getBoundingClientRect().top+window.scrollY;
  const bottom=document.body.classList.contains('section-player-mode')?innerHeight-24:Math.min(innerHeight-12,dock.top-12);
  root.style.setProperty('--radar-map-height',Math.max(320,bottom-top)+'px');
 }
 let resizeFrame=0;function scheduleMapSize(){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(sizeMap);}
 window.addEventListener('resize',scheduleMapSize);
 const chromeObserver=new ResizeObserver(scheduleMapSize);chromeObserver.observe(document.querySelector('.player-topbar'));chromeObserver.observe(document.querySelector('.player-dock'));
 new MutationObserver(()=>{document.body.classList.toggle('radar-mode',!root.hidden);scheduleMapSize();}).observe(root,{attributes:true,attributeFilter:['hidden']});
 render();applyLayout();
 ensureMap();
})();
