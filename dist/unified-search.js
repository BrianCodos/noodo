/* One header input: cross-catalog suggestions plus in-place Radar / forum filtering. */
(() => {
 'use strict';
 const input = document.getElementById('search-music');
 if (!input) return;
 const shell = input.closest('.search'), center = document.getElementById('center-stage');
 const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labels = {track:'Canciones',artist:'Artistas',session:'Sessions',playlist:'Playlists',event:'Eventos',genre:'Géneros',community:'Comunidad'};
 const symbols = {track:'music',artist:'user',session:'play',playlist:'disc',event:'calendar',genre:'browse',community:'community'};
 input.placeholder = 'Buscar en NOODO';
 input.setAttribute('aria-label', 'Buscar canciones, artistas, playlists, Sessions, eventos o comunidad');
 input.setAttribute('autocomplete', 'off');
 input.setAttribute('aria-controls', 'global-search-suggestions');
 input.setAttribute('aria-expanded', 'false');
 shell.setAttribute('role', 'search');shell.setAttribute('aria-label', 'Buscar en NOODO');
 const popup = document.createElement('section');
 popup.id = 'global-search-suggestions';popup.className = 'global-search-suggestions';popup.hidden = true;
 popup.setAttribute('aria-label', 'Sugerencias de búsqueda');shell.append(popup);
 const status = document.createElement('span');status.className = 'radar-sr-only';status.setAttribute('role', 'status');shell.append(status);
 const clear = document.createElement('button');clear.type = 'button';clear.className = 'icon-button search-clear';clear.hidden = true;clear.setAttribute('aria-label', 'Limpiar búsqueda');clear.innerHTML = icon('close');input.after(clear);
 const panel = document.createElement('section');panel.id = 'global-search-results';panel.className = 'central-panel experience-panel global-search-results';panel.hidden = true;panel.tabIndex = -1;panel.setAttribute('aria-label', 'Resultados de búsqueda');
 document.getElementById('center-details').append(panel);
 let entries = [], results = [], category = 'all', timer;
 const radar = document.getElementById('radar-view');
 const radarLink = document.createElement('button');radarLink.type = 'button';radarLink.className = 'text-button radar-global-search';radarLink.hidden = true;radarLink.textContent = 'Buscar en todo NOODO';radarLink.onclick = () => openResults();radar?.querySelector('.radar-location').append(radarLink);
 function catalog() {
  const artists = new Map();
  const list = tracks.map((track, id) => {
   const profile = artistProfileIndex(id);
   if (!artists.has(profile)) artists.set(profile, {key:'artist:'+profile,type:'artist',id:profile,title:tracks[profile].artist,subtitle:profileKind(profile)+' · '+genreNames[tracks[profile].genre],image:tracks[profile].image,keywords:genreNames[track.genre]});
   return {key:track.kind+':'+id,type:track.kind,id,title:track.title,subtitle:track.artist,image:track.image,keywords:[genreNames[track.genre],track.label].join(' ')};
  });
  list.push(...artists.values());
  for (const playlist of window.noodoLibrary.searchEntries()) list.push({key:'playlist:'+playlist.id,type:'playlist',id:playlist.id,title:playlist.name,subtitle:(playlist.owner || 'Tu playlist')+' · '+playlist.tracks.length+' canciones',keywords:genreNames[playlist.genre] || '',image:tracks[playlist.tracks[0]]?.image,playlist});
  for (const event of window.noodoEventIdentity.events) list.push({key:'event:'+event.code,type:'event',id:event.code,title:event.name,subtitle:event.artist+' · '+event.place,image:event.image,keywords:[event.organizer,event.category,event.date].join(' '),code:event.code});
  for (const [id, name] of Object.entries(genreNames)) list.push({key:'genre:'+id,type:'genre',id,title:name,subtitle:'Explorar artistas y playlists'});
  list.push(...(window.noodoCommunity?.searchEntries() || []));
  return list;
 }
 function resultMarkup(result) {
  return `<button type="button" class="global-search-result" data-search-result="${escape(result.key)}"><span class="search-result-art" aria-hidden="true">${result.image?`<img src="${escape(result.image)}" alt="" loading="lazy">`:icon(symbols[result.type])}</span><span class="search-result-copy"><strong>${escape(result.title)}</strong><small>${escape(result.subtitle)}</small></span><span class="search-result-arrow" aria-hidden="true">${icon(result.type==='track'?'play':'arrow')}</span></button>`;
 }
 function groups(limit) {
  return Object.entries(labels).map(([type, label]) => {
   if (category !== 'all' && category !== type) return '';
   const items = results.filter(result => result.type === type);
   return items.length?`<section class="search-result-group"><h2>${label} <span>${items.length}</span></h2><div class="search-result-list">${items.slice(0, limit).map(resultMarkup).join('')}</div></section>`:'';
  }).join('');
 }
 function closePopup() {popup.hidden = true;input.setAttribute('aria-expanded', 'false');}
 function showSuggestions() {
  if (!input.value.trim() || !panel.hidden || (radar && !radar.hidden)) {closePopup();return;}
  category = 'all';
  popup.innerHTML = `<div class="search-suggestions-heading"><strong>Buscar en NOODO</strong><button type="button" class="icon-button" data-search-close aria-label="Cerrar sugerencias">${icon('close')}</button></div>${results.length?groups(2):'<p class="search-empty">No encontramos resultados. Prueba con otro nombre, género o zona.</p>'}<button type="button" class="text-button search-see-all" data-search-all>Ver todos los resultados (${results.length}) ${icon('arrow')}</button>`;
  popup.hidden = false;input.setAttribute('aria-expanded', 'true');
 }
 function renderResults() {
  window.noodoSectionTools?.restore(panel);
  panel.dataset.query = input.value;
  panel.innerHTML = `<button type="button" class="text-button unified-back">← Volver</button><div class="section-heading"><div><h1>Resultados de búsqueda</h1><p>${results.length} resultados para «${escape(input.value.trim())}»</p></div></div><div class="search-categories"><label>Mostrar<select id="search-result-type" aria-label="Tipo de resultado">${[['all','Todo'],...Object.entries(labels)].map(([type,label])=>`<option value="${type}" ${category===type?'selected':''}>${label}</option>`).join('')}</select></label></div>${groups(Infinity) || '<p class="search-empty">No encontramos resultados. Prueba con otro nombre, género o zona.</p>'}`;
  panel.querySelector('#search-result-type').onchange = event => {category=event.target.value;renderResults();panel.querySelector('#search-result-type').focus({preventScroll:true});};
 }
 function refresh() {
  clearTimeout(timer);
  entries = catalog();results = window.noodoSearchIndex.find(entries, input.value);
  clear.hidden = !input.value;
  window.noodoRadarSearch?.setQuery(input.value);
  window.noodoCommunity?.search(input.value);
  radarLink.hidden = !input.value.trim();
  status.textContent = input.value.trim()?results.length+(results.length===1?' resultado en NOODO':' resultados en NOODO'):'';
  if (!panel.hidden) renderResults();else showSuggestions();
 }
 function reset() {
  clearTimeout(timer);input.value = '';clear.hidden = true;results = [];closePopup();status.textContent = '';radarLink.hidden = true;
  window.noodoRadarSearch?.setQuery('');window.noodoCommunity?.search('');
 }
 function openResults() {
  if (!input.value.trim()) return;
  refresh();closePopup();category = 'all';renderResults();window.noodoWorkspace.showPanel(panel);
 }
 function activate(key) {
  const result = entries.find(item => item.key === key);if (!result) return;
  closePopup();
  if (result.type === 'track') {window.noodoPlayer.playQueue([result.id]);if (panel.hidden) {input.focus({preventScroll:true});closePopup();}return;}
  if (result.type === 'artist') window.noodoWorkspace.navigate('artist.html?artist='+result.id);
  else if (result.type === 'session') openSession(result.id);
  else if (result.type === 'event') window.noodoWorkspace.navigate('event.html?event='+encodeURIComponent(result.id));
  else if (result.type === 'genre') window.noodoGenres.artists(result.id);
  else if (result.type === 'playlist') window.noodoLibrary.openSearchResult(result.playlist);
  else if (result.type === 'community') window.noodoCommunity.openSearchResult(result);
 }
 function onClick(event) {
  const result = event.target.closest('[data-search-result]');if (result) activate(result.dataset.searchResult);
  if (event.target.closest('[data-search-all]')) openResults();
  if (event.target.closest('[data-search-close]')) {input.focus({preventScroll:true});closePopup();}
 }
 popup.addEventListener('click', onClick);panel.addEventListener('click', onClick);
 input.addEventListener('input', event => {clearTimeout(timer);if (!event.isComposing) timer = setTimeout(refresh, 100);});
 input.addEventListener('compositionend', refresh);
 input.addEventListener('focus', () => {if (input.value.trim()) refresh();});
 input.addEventListener('keydown', event => {
  if (event.isComposing) return;
  if (event.key === 'Enter') {
   event.preventDefault();clearTimeout(timer);
   const code = input.value.trim();
   if (/^ND-/i.test(code) && window.noodoEventIdentity.find(code)) {closePopup();window.noodoWorkspace.navigate('listen.html?event='+encodeURIComponent(code.toUpperCase()));}
   else openResults();
  }
  if (event.key === 'ArrowDown') {event.preventDefault();refresh();popup.querySelector('button[data-search-result],button[data-search-all]')?.focus();}
 });
 shell.addEventListener('keydown', event => {
  if (event.key === 'Escape') {event.preventDefault();event.stopPropagation();if (!popup.hidden) closePopup();else {reset();if (!panel.hidden) window.noodoWorkspace.closePanel();}input.focus({preventScroll:true});closePopup();}
 });
 clear.onclick = () => {reset();if (!panel.hidden) window.noodoWorkspace.closePanel();input.focus({preventScroll:true});};
 document.addEventListener('pointerdown', event => {if (!shell.contains(event.target)) closePopup();});
 shell.addEventListener('focusout', () => queueMicrotask(() => {if (!shell.contains(document.activeElement)) closePopup();}));
 function destination() {return [...center.querySelectorAll('#listen-view,#artist-view,#context-view,#radar-view,.central-panel')].find(el=>!el.hidden&&!el.parentElement.closest('[hidden]'))?.id;}
 let lastDestination = destination();
 new MutationObserver(() => {
  const next = destination();if (next === lastDestination) return;
  lastDestination = next;closePopup();if (next !== panel.id) reset();
  else if (!input.value && panel.dataset.query) {input.value=panel.dataset.query;refresh();}
 }).observe(center, {childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
 window.addEventListener('noodo:playlistschange', () => {if (input.value.trim()) refresh();});
 window.noodoSearch = {reset};
})();
