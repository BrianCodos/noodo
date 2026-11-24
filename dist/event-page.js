/* Event detail component, using the same sample data as Radar. */
(() => {
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=value=>value===0?'Gratis':new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(value)+' COP';
 let eventMap=null,mapObserver=null,visibilityObserver=null,renderVersion=0;
 function render(id){
  const version=++renderVersion;eventMap?.remove();eventMap=null;mapObserver?.disconnect();visibilityObserver?.disconnect();document.getElementById("event-related-sidebar")?.remove();
  let page=document.getElementById('radar-event-page');
  if(!page){page=document.createElement('section');page.id='radar-event-page';page.className='central-panel event-detail-page';page.tabIndex=-1;page.hidden=true;page.dataset.kind='RadarEvent';document.getElementById('center-details').append(page);}
  const event=window.noodoEventIdentity.find(id);
  if(!event){page.removeAttribute('aria-labelledby');document.title='Evento no encontrado · NOODO';page.setAttribute('aria-label','Evento no encontrado');page.innerHTML='<button type="button" class="text-button unified-back">← Volver</button><h1>No encontramos este evento</h1><p>Explora la programación para encontrar tu próximo encuentro.</p><a class="pill primary" href="listen.html?section=radar">Explorar Radar</a>';return page;}
  document.title=event.name+' · NOODO';page.setAttribute('aria-labelledby','event-detail-title');
  const [artist,discipline]=event.artist.split(' · '),artistId=tracks.findIndex(track=>track.artist===artist);
  const participants=Array.isArray(event.artists)?event.artists.map(a=>typeof a==='string'?a:a.name).filter(Boolean):[artist].filter(Boolean);
  const artistPills=participants.map(name=>{const id=tracks.findIndex(t=>t.artist===name);return id>=0?`<a class="event-artist-pill" href="artist.html?artist=${id}"><img src="${escape(tracks[id].image)}" alt="">${escape(name)}</a>`:`<span class="event-artist-pill">${escape(name)}</span>`;}).join('');
  const related=window.noodoRadarEvents.filter(e=>e.code!==event.code).sort((a,b)=>Number(b.category===event.category)-Number(a.category===event.category)).slice(0,3);
  const relatedHTML=`<h2>Eventos relacionados</h2><div class="event-related-list">${related.map(e=>`<a href="event.html?event=${encodeURIComponent(e.code)}" class="event-related-card"><img src="${escape(e.image)}" alt=""><span><small>${escape(e.date)} · ${escape(e.place)}</small><strong>${escape(e.name)}</strong><small>${money(e.price)}</small></span></a>`).join('')}</div>`;
  const dateLabel=new Intl.DateTimeFormat('es-CO',{dateStyle:'full',timeZone:'UTC'}).format(new Date(event.dateISO+'T12:00:00Z'));
  const mapURL='https://www.openstreetmap.org/?mlat='+event.coordinates[1]+'&mlon='+event.coordinates[0]+'#map=16/'+event.coordinates[1]+'/'+event.coordinates[0];
  page.innerHTML=`<nav class="event-detail-nav" aria-label="Navegación del evento"><button type="button" class="text-button unified-back">← Volver</button><button type="button" class="text-button" data-share-event>${icon('copy')} Copiar enlace</button></nav>
   <div class="event-detail-hero">
    <div class="event-detail-art"><img src="${escape(event.image)}" alt="Flyer de ${escape(event.name)}"><div class="event-detail-date" aria-hidden="true"><span>${escape(event.day)}</span><strong>${event.date.split(' ')[0]}</strong><span>${escape(event.date.split(' ')[1])}</span></div></div>
    <div class="event-detail-summary"><span class="event-detail-eyebrow">${escape(event.category)} · Cali</span><h1 id="event-detail-title">${escape(event.name)}</h1><p class="event-detail-intro">${escape(event.description)}</p>
     ${artistPills?`<div class="event-artist-pills" aria-label="Artistas participantes">${artistPills}</div>`:''}<dl class="event-detail-facts"><div><dt>${icon('calendar')} Fecha</dt><dd>${dateLabel}<small>${escape(event.time)} · Hora de Colombia</small></dd></div><div><dt>${icon('pin')} Lugar</dt><dd>${escape(event.place)}, Cali<small>Dirección y recinto por confirmar</small></dd></div><div><dt>${icon('user')} Organiza</dt><dd>${escape(event.organizer)}</dd></div></dl>
     
     <p class="event-detail-demo">Evento de muestra. Puedes recorrer la compra de prueba sin realizar cobros.</p>
    </div>
    ${window.noodoEventIdentity.block(event)}
   </div>
   <section class="event-detail-sections event-ticket-prices" aria-labelledby="event-ticket-title"><h2 id="event-ticket-title">Precio de las entradas</h2><div class="event-price-scroll"><table><thead><tr><th scope="col">Localidad</th><th scope="col">Detalle</th><th scope="col">Disponibles</th><th scope="col">Precio</th><th scope="col">Costo de servicio</th><th scope="col">Cantidad</th></tr></thead><tbody>${event.localities.map(l=>`<tr><th scope="row">${escape(l.name)}</th><td>${escape(l.description)}</td><td>${l.available}</td><td>${money(l.price)}</td><td>$0 COP</td><td><select class="event-ticket-quantity" data-locality="${escape(l.id)}" aria-label="Cantidad de entradas ${escape(l.name)}">${Array.from({length:Math.min(6,l.available)+1},(_,n)=>`<option value="${n}">${n}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div><div class="event-price-footer"><small>Disponibilidad de muestra. Localidades sin numeración. Servicio sin costo en esta prueba. Máximo 6 boletas por pedido.</small><button type="button" class="pill primary" data-event-tickets>Continuar con mis entradas</button></div></section>
   <section class="event-location-map-section" aria-labelledby="event-map-title"><h2 id="event-map-title">Ubicación del evento</h2><p>${escape(event.place)} · Cali, Colombia</p><p class="event-detail-demo">Ubicación de referencia del sector. Dirección y recinto por confirmar.</p><div class="event-location-map-wrap"><div id="event-location-map" aria-label="Mapa de ubicación del evento"></div><p class="event-location-map-status" role="status">Cargando ubicación…</p></div><a class="text-button" href="${mapURL}" target="_blank" rel="noopener">Abrir ubicación ${icon('link')}</a></section><section class="event-related-mobile">${relatedHTML}</section><p class="event-detail-feedback" role="status" aria-live="polite"></p>`;
  page.querySelector('[data-event-tickets]').onclick=()=>{
   const quantities=Object.fromEntries([...page.querySelectorAll('[data-locality]')].map(input=>[input.dataset.locality,Number(input.value)]));
   const count=Object.values(quantities).reduce((a,b)=>a+b,0),feedback=page.querySelector('.event-detail-feedback');
   if(count<1||count>6){feedback.textContent='Elige entre 1 y 6 boletas por pedido.';page.querySelector('.event-price-footer').append(feedback);return;}
   location.href='checkout.html?event='+encodeURIComponent(event.code)+'&quantities='+encodeURIComponent(JSON.stringify(quantities));
  };
  page.querySelector('[data-share-event]').onclick=async()=>{const feedback=page.querySelector('.event-detail-feedback');try{await navigator.clipboard.writeText(window.noodoEventIdentity.url(event));feedback.textContent='Enlace copiado.';}catch{feedback.textContent='Puedes copiar el enlace desde la barra de direcciones.';}};
  const sidebar=document.createElement('aside');sidebar.id='event-related-sidebar';sidebar.setAttribute('aria-label','Eventos relacionados');sidebar.innerHTML=relatedHTML;sidebar.hidden=true;document.querySelector('.workspace-grid').append(sidebar);
  let loadingMap=false;
  async function mountMap(){
   if(loadingMap||eventMap||page.hidden||page.parentElement.hidden)return;
   const status=page.querySelector('.event-location-map-status'),token=window.NOODO_MAPBOX?.accessToken;
   if(!token){status.textContent='El mapa no está disponible. Puedes abrir la ubicación en el enlace inferior.';return;}
   loadingMap=true;
   try{await window.noodoLoadMapbox();if(version!==renderVersion||page.hidden||page.parentElement.hidden)return;
    eventMap=new mapboxgl.Map({container:page.querySelector('#event-location-map'),accessToken:token,style:window.NOODO_MAPBOX.style||'mapbox://styles/mapbox/dark-v11',center:event.coordinates,zoom:15,cooperativeGestures:true});
    eventMap.addControl(new mapboxgl.NavigationControl({showCompass:false}),'top-right');
    new mapboxgl.Marker({color:'#c493f3'}).setLngLat(event.coordinates).addTo(eventMap);
    eventMap.on('load',()=>{status.hidden=true;eventMap.resize();});eventMap.on('error',()=>{status.hidden=false;status.textContent='No pudimos cargar el mapa. Usa el enlace de ubicación.';});
    mapObserver=new ResizeObserver(()=>eventMap?.resize());mapObserver.observe(page.querySelector('.event-location-map-wrap'));
   }catch{status.textContent='No pudimos cargar el mapa. Usa el enlace de ubicación.';}finally{loadingMap=false;}
  }
  function syncEvent(){const visible=!page.hidden&&!page.parentElement.hidden;sidebar.hidden=!visible;if(visible)mountMap();else{eventMap?.remove();eventMap=null;mapObserver?.disconnect();}}
  visibilityObserver=new MutationObserver(syncEvent);visibilityObserver.observe(document.getElementById('center-stage'),{subtree:true,attributes:true,attributeFilter:['hidden']});
  queueMicrotask(syncEvent);
  return page;
 }
 window.noodoEventPage={render};
})();
