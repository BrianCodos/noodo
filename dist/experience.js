'use strict';
/* Local product interactions. No network writes, payments or external publishing. */
(()=>{
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
 const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));if(key==='noodo-playlists-v1')queueMicrotask(()=>window.dispatchEvent(new Event('noodo:playlistschange')));return true;}catch{announce('No se pudo guardar en este navegador.');return false;}};
 Object.assign(paths,{community:'<circle cx="12" cy="5" r="3"/><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="m10 8-3 6m7-6 3 6M8 17h8"/>',pin:'<path d="M12 22S4 13 4 9a8 8 0 1 1 16 0c0 4-8 13-8 13Z"/><circle cx="12" cy="9" r="2"/>',copy:'<path d="M8 8h13v13H8ZM16 8V3H3v13h5"/>',album:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="1"/>'});
 document.querySelectorAll('[data-icon="community"]').forEach(el=>el.innerHTML=icon('community'));
 function panel(id,title){let el=document.getElementById(id);if(!el){el=document.createElement('section');el.id=id;el.className='central-panel experience-panel';el.hidden=true;el.tabIndex=-1;document.getElementById('center-details').append(el);}el.setAttribute('aria-label',title);return el;}
 function show(el,html){el.innerHTML='<button class="text-button unified-back" data-back>← Volver</button>'+html;el.querySelector('[data-back]').onclick=()=>window.noodoWorkspace.closePanel();window.noodoWorkspace.showPanel(el);}
 function activate(){window.noodoNavigation?.sync();}
 const events=concertSamples.map((event,i)=>({...event,code:'ND-2026-'+String(i+1).padStart(3,'0'),image:i%2?'assets/live-session-v02.png':'assets/gallery-night-stage-v03.png',stage:'assets/gallery-rehearsal-v03.png',address:'Sector San Antonio · Cali',doors:i===0?'17:30':i===1?'14:00':i===2?'21:00':'19:00',localities:[{name:'General',capacity:120,available:84,price:event.free?0:45000},{name:'Preferencial',capacity:40,available:18,price:event.free?0:75000},{name:'Balcón',capacity:30,available:12,price:event.free?0:60000}]}));
 const money=n=>n?'$'+n.toLocaleString('es-CO'):'Gratis';
 function openEvent(i){const event=events[i];if(event)window.noodoWorkspace.navigate('event.html?event='+event.code);}
 window.noodoEvents={open:openEvent,openCode(code){const event=window.noodoEventIdentity.find(code);if(event){window.noodoWorkspace.showPanel(window.noodoEventPage.render(event.code));return true;}const el=panel('event-not-found','Buscar evento');show(el,'<h1>No encontramos ese evento</h1><p>Revisa el código del evento.</p>');return false;}};
 // The same persisted playlist schema is used by artist rows and the library.
 const playlistKey='noodo-playlists-v1';
 function playlists(){const raw=read(playlistKey,[]);return (Array.isArray(raw)?raw:[]).filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&Array.isArray(p.tracks)).map(p=>({...p,tracks:[...new Set(p.tracks)].filter(i=>Number.isInteger(i)&&tracks[i])}));}
 let initial=playlists();if(!initial.some(p=>p.id==='my-playlist'))initial.unshift({id:'my-playlist',name:'Mi playlist',tracks:[]});
 const migration='noodo-playlist-saved-migrated';if(!read(migration,false)){initial.find(p=>p.id==='my-playlist').tracks=[...new Set([...initial.find(p=>p.id==='my-playlist').tracks,...saved])];if(write(playlistKey,initial))write(migration,true);}else write(playlistKey,initial);
 // Seed the requested samples once, preserving all existing user playlists.
 const sampleMigration='noodo-sample-playlists-v1';
 if(!read(sampleMigration,false)){
  const samples=[
   {id:'sample-pulso-nocturno',name:'Pulso nocturno',genres:['electronic','experimental']},
   {id:'sample-raiz-pacifico',name:'Raíz del Pacífico',genres:['pacific','tropical','salsa']},
   {id:'sample-guitarras-ciudad',name:'Guitarras de la ciudad',genres:['indie','rock','metal']},
   {id:'sample-voces-asfalto',name:'Voces del asfalto',genres:['hiphop','soul','pop']}
  ];
  for(const sample of samples)if(!initial.some(p=>p.id===sample.id)){
   const ids=tracks.map((track,id)=>({track,id})).filter(({track})=>track.kind==='track'&&sample.genres.includes(track.genre)).slice(0,8).map(({id})=>id);
   initial.push({id:sample.id,name:sample.name,tracks:ids,sample:true});
  }
  if(write(playlistKey,initial))write(sampleMigration,true);
 }
 saved=new Set(initial.find(p=>p.id==='my-playlist').tracks);paintCurrent();
 const samplePortraits={
  'sample-pulso-nocturno':['artist-portrait-v02.png','orbita-sur-v16.png','abril-neon-v16.png','member-simon-v03.png'],
  'sample-raiz-pacifico':['live-session-v02.png','rio-lento-v16.png','member-mar-v03.png','gallery-percussion-v03.png'],
  'sample-guitarras-ciudad':['bruma-roja-v16.png','hierro-vivo-v16.png','rio-lento-v16.png','orbita-sur-v16.png'],
  'sample-voces-asfalto':['abril-neon-v16.png','member-mar-v03.png','artist-portrait-v02.png','bruma-roja-v16.png']
 };
 function playlistArtwork(p){
  if(p.owner==='NOODO')return `<span class="user-playlist-art noodo-playlist-art" data-edition="${p.edition}" aria-hidden="true"><span class="noodo-playlist-brand">NOODO</span><span class="noodo-playlist-shape"></span><span class="noodo-playlist-cover-title">${esc(p.name)}</span><span class="noodo-playlist-cover-genre">${esc(genreNames[p.genre])}</span></span>`;
  const photos=samplePortraits[p.id]?.map(file=>'assets/'+file)||[...new Set(p.tracks.map(i=>tracks[i]?.image).filter(Boolean))].slice(0,4);
  return `<span class="user-playlist-art ${photos.length?'is-mosaic':''}">${photos.length?Array.from({length:4},(_,i)=>`<img src="${esc(photos[i%photos.length])}" alt="" loading="lazy">`).join(''):`<span class="user-playlist-placeholder">${icon('queue')}</span>`}</span>`;
 }
 function playlistCard(p){const editorial=p.owner==='NOODO';return `<button type="button" class="user-playlist-card" ${editorial?'data-noodo-playlist':'data-user-playlist'}="${esc(p.id)}" aria-label="Abrir playlist: ${esc(p.name)}${editorial?' · NOODO':''}">${playlistArtwork(p)}<strong>${esc(p.name)}</strong><small>${editorial?'NOODO · ':''}${editorial&&!p.tracks.length?'Próximamente':p.tracks.length+' '+(p.tracks.length===1?(editorial?'canción':'contenido'):(editorial?'canciones':'contenidos'))}</small></button>`;}
 function playlistActionCard(action,label,symbol,description){return `<button type="button" class="user-playlist-card user-playlist-action" data-user-playlist-${action} aria-label="${esc(label)}"><span class="user-playlist-art" aria-hidden="true"><span class="user-playlist-placeholder">${icon(symbol)}</span></span><strong>${esc(label)}</strong><small>${esc(description)}</small></button>`;}
 let curatedDispose=null;
 function openCuratedPlaylist(playlist){
  curatedDispose?.();curatedDispose=null;
  const el=panel('noodo-playlist-detail',playlist.name);el.dataset.navigation='genres';
  show(el,`<div class="section-heading"><div class="playlist-page-heading">${playlistArtwork(playlist)}<div><p class="noodo-playlist-owner">NOODO · ${esc(genreNames[playlist.genre])}</p><h1>${esc(playlist.name)}</h1><p>${esc(playlist.description)}</p><p>${playlist.tracks.length} canciones</p></div></div></div><div class="section-heading playlist-selection"><h2>Canciones</h2><div class="song-heading-actions"><button type="button" class="icon-button" data-curated-shuffle aria-label="Reproducir playlist en orden aleatorio" ${playlist.tracks.length?'':'disabled'}>${icon('shuffle')}</button><button type="button" class="pill primary" data-curated-play ${playlist.tracks.length?'':'disabled'}>${icon('play')}Reproducir playlist</button></div></div>${playlist.tracks.length?'<div class="song-list" id="noodo-playlist-rows"></div>':'<div class="library-empty"><h3>Próximamente</h3><p>Estamos preparando esta selección. Aquí encontrarás las canciones cuando estén disponibles.</p></div>'}`);
  el.querySelector('[data-curated-play]').onclick=()=>window.noodoPlayer.playQueue(playlist.tracks);
  el.querySelector('[data-curated-shuffle]').onclick=()=>window.noodoPlayer.playQueue(playlist.tracks,true);
  if(playlist.tracks.length)curatedDispose=window.noodoTrackList.mount(el.querySelector('#noodo-playlist-rows'),playlist.tracks);
 }
 function mountGenrePlaylists(host,key){
  let section=host.querySelector('.noodo-genre-playlists');
  if(!section){section=document.createElement('section');section.className='noodo-genre-playlists';section.setAttribute('aria-labelledby','noodo-genre-playlists-title');host.append(section);}
  const collections=window.noodoCuratedPlaylists.forGenre(key);
  section.innerHTML=`<div class="section-heading"><h2 id="noodo-genre-playlists-title">Playlists de NOODO</h2></div><div class="user-playlist-grid" role="group" aria-label="Playlists de NOODO · ${esc(genreNames[key])}">${collections.map(playlistCard).join('')}</div>`;
  section.onclick=e=>{const button=e.target.closest('[data-noodo-playlist]'),playlist=collections.find(p=>p.id===button?.dataset.noodoPlaylist);if(playlist)openCuratedPlaylist(playlist);};
 }
 let libraryMode='all',libraryDispose=null;
 function renderLibrary(){
  libraryDispose?.();libraryDispose=null;
  const el=panel('playlist-library','Mis playlists'),all=playlists();
  const activePlaylist=all.find(p=>p.id===libraryMode);
  if(!activePlaylist)libraryMode='all';
  const ids=activePlaylist?.tracks||[];
  el.dataset.libraryView=activePlaylist?'detail':'grid';
  el.setAttribute('aria-label',activePlaylist?'Playlist: '+activePlaylist.name:'Mis playlists');
  el.innerHTML=`<button type="button" class="text-button unified-back" data-back>${activePlaylist?'← Mis playlists':'← Volver'}</button><div class="section-heading"><div class="playlist-page-heading">${activePlaylist?playlistArtwork(activePlaylist):''}<div><h1>${activePlaylist?esc(activePlaylist.name):'Mis playlists'}</h1><p>${activePlaylist?ids.length+' contenidos · Tu playlist':'Elige una playlist para escuchar sus canciones.'}</p></div></div><button class="pill primary" id="create-library-playlist">${icon('plus')}Crear playlist</button></div>${activePlaylist?`<div class="section-heading playlist-selection"><h2>Canciones</h2><button class="pill primary" id="play-library" ${ids.some(i=>tracks[i].kind==='track')?'':'disabled'}>${icon('play')}Reproducir playlist</button></div>${ids.length?'<div id="playlist-rows"></div>':'<div class="library-empty"><h3>Una playlist por descubrir</h3><p>Añade canciones con el botón + del catálogo o del perfil del artista.</p><button class="pill outline" id="library-explore">Explorar canciones</button></div>'}`:`<div class="user-playlist-grid library-playlist-grid" role="group" aria-label="Todas tus playlists">${all.map(playlistCard).join('')}</div>`}<p id="library-feedback" role="status"></p>`;
  el.querySelector('[data-back]').onclick=()=>{
   if(!activePlaylist){window.noodoWorkspace.closePanel();return;}
   const previous=libraryMode;libraryMode='all';renderLibrary();
   [...el.querySelectorAll('[data-user-playlist]')].find(b=>b.dataset.userPlaylist===previous)?.focus();
  };
  el.querySelector('#create-library-playlist').onclick=()=>openCreate();
  el.querySelectorAll('[data-user-playlist]').forEach(b=>b.onclick=()=>{libraryMode=b.dataset.userPlaylist;renderLibrary();window.noodoNavigation?.enter(el);el.querySelector('h1').setAttribute('tabindex','-1');el.querySelector('h1').focus();});
  el.querySelector('#play-library')?.addEventListener('click',()=>window.noodoPlayer.playQueue(ids,false));
  if(activePlaylist&&ids.length)libraryDispose=window.noodoTrackList.mount(el.querySelector('#playlist-rows'),ids);
  el.querySelector('#library-explore')?.addEventListener('click',()=>{window.noodoWorkspace.songs();setView('all');});activate('saved');
 }
 function openLibrary(id){libraryMode=typeof id==='string'&&playlists().some(p=>p.id===id)?id:'all';renderLibrary();window.noodoWorkspace.showPanel(document.getElementById('playlist-library'));}

 function createForm(){return '<form id="playlist-create-form" class="experience-form"><label for="playlist-new-name">Nombre de la playlist</label><input id="playlist-new-name" maxlength="60" required placeholder="Por ejemplo: De camino a casa"><button class="pill primary">Crear playlist</button><p role="status" id="playlist-create-status"></p></form>';}
 function wireCreate(el,done){el.querySelector('form').onsubmit=e=>{e.preventDefault();const input=el.querySelector('#playlist-new-name'),name=input.value.trim();if(!name){input.setCustomValidity('Escribe un nombre.');input.reportValidity();return;}const all=playlists();if(all.some(p=>p.name.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'))){el.querySelector('#playlist-create-status').textContent='Ya tienes una playlist con ese nombre.';return;}const record={id:'playlist-'+crypto.randomUUID(),name,tracks:[]};all.push(record);if(write(playlistKey,all))done(record);};el.querySelector('input').oninput=e=>e.target.setCustomValidity('');}
 function openCreate(){const el=panel('playlist-create','Crear playlist');show(el,'<h1>Crear playlist</h1>'+createForm());wireCreate(el,p=>{libraryMode=p.id;renderLibrary();window.noodoWorkspace.closePanel();announce('Playlist creada.');});el.querySelector('input').focus();}
 function pick(i){const t=tracks[i];if(!t)return;const el=panel('playlist-picker','Añadir a playlist');
 function render(){const all=playlists();el.innerHTML=`<button class="text-button unified-back" data-back>← Volver</button><h1>Añadir a playlist</h1><div class="picker-song"><img src="${t.image}" alt=""><div><strong>${t.title}</strong><p>${t.artist}</p></div></div><div class="playlist-choices">${all.map(p=>`<button class="playlist-choice" data-choice="${esc(p.id)}" ${p.tracks.includes(i)?'disabled':''}>${icon('queue')}<span>${esc(p.name)}<small>${p.tracks.length} contenidos</small></span><span>${p.tracks.includes(i)?'Añadida':icon('plus')}</span></button>`).join('')}</div><h2>Nueva playlist</h2>${createForm()}`;
 el.querySelector('[data-back]').onclick=()=>window.noodoWorkspace.closePanel();el.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{const lists=playlists(),entry=lists.find(p=>p.id===b.dataset.choice);if(!entry||entry.tracks.includes(i))return;entry.tracks.push(i);if(write(playlistKey,lists)){syncDefault();render();renderIfLibrary();announce('Añadida a '+entry.name);}});wireCreate(el,p=>{const lists=playlists();lists.find(v=>v.id===p.id).tracks.push(i);if(write(playlistKey,lists)){render();renderIfLibrary();announce('Playlist creada con '+t.title);}});}
 render();window.noodoWorkspace.showPanel(el);
 }
 function syncDefault(){saved=new Set(playlists().find(p=>p.id==='my-playlist')?.tracks||[]);paintCurrent();}
 function renderIfLibrary(){if(document.getElementById('playlist-library'))renderLibrary();}
 function followedArtists(){const extras=read('noodo-followed-profiles',[]),canonical=[...new Set(tracks.map((t,i)=>artistProfileIndex(i)))].map(i=>({key:'noodo-follow-'+(i===0?'lunamarea':'artista-muestra-'+i),name:tracks[i].artist,image:tracks[i].image,href:'artist.html?artist='+i,type:profileKind(i)}));return [...new Map([...canonical,...(Array.isArray(extras)?extras:[])].map(a=>[a.key,a])).values()].filter(a=>localStorage.getItem(a.key)==='true');}
 function openArtists(){
  const el=panel('artist-directory','Artistas');el.dataset.navigation='artists';
  const profiles=[...new Set(tracks.map((track,index)=>artistProfileIndex(index)))];
  show(el,'<div class="section-heading"><h1>Artistas</h1></div><div class="genre-artists-grid" id="all-artists-grid"></div><section id="artist-recommendations"></section>');
  window.noodoArtistCollection.mount(el.querySelector('#all-artists-grid'),profiles);
  window.noodoRecommendedArtists.mount(el.querySelector('#artist-recommendations'));
  activate('artists');
 }
 window.noodoLibrary={searchEntries:()=>[...playlists(),...Object.keys(genreNames).flatMap(key=>window.noodoCuratedPlaylists.forGenre(key))],openSearchResult:p=>p.owner==='NOODO'?openCuratedPlaylist(p):window.noodoCommunity.requireProfile(()=>openLibrary(p.id),'playlists'),open:openLibrary,pick,artists:openArtists,mountGenrePlaylists,syncSaved(ids){const all=playlists(),entry=all.find(p=>p.id==='my-playlist');entry.tracks=ids;write(playlistKey,all);renderIfLibrary();},rememberArtist(record){const list=read('noodo-followed-profiles',[]);write('noodo-followed-profiles',[...(Array.isArray(list)?list:[]).filter(a=>a.key!==record.key),record]);}};

 // The saved view combines the user's playlists with their liked music.
 const playlistSection=document.createElement('section');playlistSection.className='user-playlists';playlistSection.setAttribute('aria-labelledby','user-playlists-title');
 const trackColumns=document.querySelector('.track-columns'),songsHeading=document.querySelector('.songs-heading'),songActions=document.querySelector('.song-heading-actions');
 const favoritesHeading=document.createElement('div');favoritesHeading.className='section-heading favorites-heading';favoritesHeading.hidden=true;
 favoritesHeading.innerHTML='<h2 id="favorites-title">Canciones que te gustan</h2>';
 trackColumns.before(playlistSection,favoritesHeading);
 let playlistMarkup='';
 function renderPlaylistGrid(){
  const isSaved=view==='saved',isLibrary=view==='all'||isSaved,all=playlists();
  playlistSection.hidden=!isSaved&&!isLibrary;favoritesHeading.hidden=!isSaved&&!isLibrary;
  songsHeading.classList.toggle('library-overview-label',isLibrary);
  playlistSection.classList.toggle('library-overview',isLibrary);
  favoritesHeading.classList.toggle('library-song-actions',isLibrary);
  document.getElementById('favorites-title').hidden=isLibrary;
  const actionParent=isSaved||isLibrary?favoritesHeading:songsHeading;
  if(songActions.parentElement!==actionParent)actionParent.append(songActions);
  const markup=`<h2 id="user-playlists-title" class="section-heading">Tus playlists</h2><div class="user-playlist-grid" role="group" aria-label="Tus playlists">${all.filter(p=>p.id!=='my-playlist').map(playlistCard).join('')}${playlistActionCard('create','Crear playlist','plus','Una nueva selección')}${playlistActionCard('all','Ver todas las playlists','queue',all.length+' '+(all.length===1?'playlist':'playlists'))}</div>`;
  if(markup!==playlistMarkup){playlistSection.innerHTML=markup;playlistMarkup=markup;}
  document.getElementById('user-playlists-title').classList.toggle('library-overview-label',isLibrary);
  const empty=document.getElementById('empty');
  empty.querySelector('h3').textContent=isSaved?'Aún no tienes canciones favoritas.':'No encontramos ese sonido.';
  empty.querySelector('p').textContent=isSaved?'Marca el corazón de una canción y aparecerá aquí.':'Prueba con otro nombre o guarda una pista con el corazón.';
  document.getElementById('reset-filter').textContent=isSaved?'Explorar canciones':'Ver toda la selección';
  if(isSaved){
   const favorites=tracks.filter((track,index)=>matches(track,index));
   document.getElementById('favorites-title').textContent=favorites.some(track=>track.kind==='session')?'Canciones y sesiones que te gustan':'Canciones que te gustan';
   document.getElementById('selection-summary').textContent=all.length+' '+(all.length===1?'playlist':'playlists')+' · '+favorites.length+' '+(favorites.length===1?'favorito':'favoritos');
  }
 }
 playlistSection.addEventListener('click',e=>{
  const card=e.target.closest('[data-user-playlist]');
  if(card)window.noodoLibrary.open(card.dataset.userPlaylist);
  if(e.target.closest('[data-user-playlist-all]'))window.noodoLibrary.open();
  if(e.target.closest('[data-user-playlist-create]')){window.noodoLibrary.open();document.getElementById('create-library-playlist').click();}
 });
 window.addEventListener('noodo:catalogchange',renderPlaylistGrid);
 window.addEventListener('noodo:playlistschange',renderPlaylistGrid);
 window.addEventListener('storage',e=>{if(e.key===playlistKey||e.key===null)renderPlaylistGrid();});
 renderPlaylistGrid();
 document.getElementById('library-artists').onclick=openArtists;

})();
