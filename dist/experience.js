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
 function activate(id){document.querySelectorAll('.music-views .nav').forEach(b=>{b.classList.toggle('active',b.dataset.view===id);b.setAttribute('aria-pressed',String(b.dataset.view===id));});}
 const events=concertSamples.map((event,i)=>({...event,code:'ND-2026-'+String(i+1).padStart(3,'0'),image:i%2?'assets/live-session-v02.png':'assets/gallery-night-stage-v03.png',stage:'assets/gallery-rehearsal-v03.png',address:'Sector San Antonio · Cali',doors:i===0?'17:30':i===1?'14:00':i===2?'21:00':'19:00',localities:[{name:'General',capacity:120,available:84,price:event.free?0:45000},{name:'Preferencial',capacity:40,available:18,price:event.free?0:75000},{name:'Balcón',capacity:30,available:12,price:event.free?0:60000}]}));
 const money=n=>n?'$'+n.toLocaleString('es-CO'):'Gratis';
 function openEvent(i){const event=events[i];if(event)window.noodoWorkspace.navigate('event.html?event='+event.code);}
 window.noodoEvents={open:openEvent,openCode(code){const event=window.noodoEventIdentity.find(code);if(event){window.noodoWorkspace.showPanel(window.noodoEventPage.render(event.code));return true;}const el=panel('event-not-found','Buscar evento');show(el,'<h1>No encontramos ese evento</h1><p>Revisa el código del evento.</p>');return false;}};
 const search=document.getElementById('search-music');search.placeholder='Canciones, artistas o código de evento';search.setAttribute('aria-label','Buscar canciones, artistas o código de evento');
 search.addEventListener('keydown',e=>{if(e.key==='Enter'&&/^ND-/i.test(search.value.trim())){e.preventDefault();const code=search.value.trim().toUpperCase();search.value='';window.noodoWorkspace.navigate('listen.html?event='+encodeURIComponent(code));}});
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
  const photos=samplePortraits[p.id]?.map(file=>'assets/'+file)||[...new Set(p.tracks.map(i=>tracks[i]?.image).filter(Boolean))].slice(0,4);
  return `<span class="user-playlist-art ${photos.length?'is-mosaic':''}">${photos.length?Array.from({length:4},(_,i)=>`<img src="${esc(photos[i%photos.length])}" alt="" loading="lazy">`).join(''):`<span class="user-playlist-placeholder">${icon('queue')}</span>`}</span>`;
 }
 function playlistCard(p){return `<button type="button" class="user-playlist-card" data-user-playlist="${esc(p.id)}" aria-label="Abrir playlist: ${esc(p.name)}">${playlistArtwork(p)}<strong>${esc(p.name)}</strong><small>${p.tracks.length} ${p.tracks.length===1?'contenido':'contenidos'}</small></button>`;}
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
  el.querySelectorAll('[data-user-playlist]').forEach(b=>b.onclick=()=>{libraryMode=b.dataset.userPlaylist;renderLibrary();el.querySelector('h1').setAttribute('tabindex','-1');el.querySelector('h1').focus();});
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
 function openArtists(){const el=panel('followed-artists','Tus artistas'),artists=followedArtists();show(el,`<div class="section-heading"><div><h1>Tus artistas</h1><p>Los proyectos que sigues, en un mismo lugar.</p></div><button class="pill outline" id="discover-artists">Explorar artistas</button></div><div class="genre-artists-grid">${artists.map(a=>`<a class="genre-artist-card" href="${esc(a.href)}"><img src="${esc(a.image)}" alt=""><strong>${esc(a.name)}</strong><span>${esc(a.type)}</span></a>`).join('')}</div>${artists.length?'':'<div class="library-empty"><h2>Aquí empieza tu escena</h2><p>Presiona Seguir artista en un perfil y lo encontrarás aquí.</p></div>'}`);el.querySelector('#discover-artists').onclick=()=>window.noodoGenres.open();activate('artists');}
 window.noodoLibrary={open:openLibrary,pick,artists:openArtists,syncSaved(ids){const all=playlists(),entry=all.find(p=>p.id==='my-playlist');entry.tracks=ids;write(playlistKey,all);renderIfLibrary();},rememberArtist(record){const list=read('noodo-followed-profiles',[]);write('noodo-followed-profiles',[...(Array.isArray(list)?list:[]).filter(a=>a.key!==record.key),record]);}};

 // Album-style collection above the song rows, using the existing local library.
 const playlistSection=document.createElement('section');playlistSection.className='user-playlists';playlistSection.setAttribute('aria-labelledby','user-playlists-title');
 document.querySelector('.track-columns').before(playlistSection);
 function renderPlaylistGrid(){
  playlistSection.hidden=view!=='all';
  const all=playlists();
  playlistSection.innerHTML=`<div class="section-heading"><h2 id="user-playlists-title">Tus playlists</h2><button type="button" class="text-button" data-user-playlist-create>${icon('plus')}Crear playlist</button></div><div class="user-playlist-grid">${all.map(playlistCard).join('')}</div>`;
 }
 playlistSection.addEventListener('click',e=>{
  const card=e.target.closest('[data-user-playlist]');
  if(card)window.noodoLibrary.open(card.dataset.userPlaylist);
  if(e.target.closest('[data-user-playlist-create]')){window.noodoLibrary.open();document.getElementById('create-library-playlist').click();}
 });
 window.addEventListener('noodo:catalogchange',renderPlaylistGrid);
 window.addEventListener('noodo:playlistschange',renderPlaylistGrid);
 window.addEventListener('storage',e=>{if(e.key===playlistKey||e.key===null)renderPlaylistGrid();});
 renderPlaylistGrid();
 document.getElementById('library-artists').onclick=openArtists;

})();
