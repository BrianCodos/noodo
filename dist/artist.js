'use strict';
window.mountArtist=function(root){
const $=s=>root.querySelector(s)||document.querySelector('#center-details').querySelector(s),$$=s=>[...root.querySelectorAll(s),...document.querySelector('#center-details').querySelectorAll(s)];
const icons={album:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="1"/>',phone:'<path d="M8 3H4v4c0 7 6 13 13 13h4v-4l-5-2-2 2a14 14 0 0 1-6-6l2-2Z"/>',previous:'<path d="m19 5-10 7 10 7ZM5 5v14"/>',next:'<path d="m5 5 10 7-10 7ZM19 5v14"/>',volume:'<path d="M3 9h4l5-5v16l-5-5H3Zm13-2a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16"/>',pause:'<path d="M8 5v14M16 5v14"/>',ticket:'<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4Zm12 0v3m0 3v2m0 3v3"/>',link:'<path d="m10 13 4-4m-6 6-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m4 2 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',play:'<path d="m8 5 11 7-11 7Z"/>',plus:'<path d="M12 4v16M4 12h16"/>',check:'<path d="m4 12 5 5L20 6"/>',mail:'<path d="M3 5h18v14H3Zm0 0 9 8 9-8"/>',calendar:'<path d="M4 5h16v16H4ZM8 2v6M16 2v6M4 11h16"/>',pin:'<path d="M12 22s8-9 8-14a8 8 0 0 0-16 0c0 5 8 14 8 14Z"/><circle cx="12" cy="8" r="2"/>',expand:'<path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',copy:'<path d="M8 8h13v13H8ZM16 8V3H3v13h5"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
$$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
try{const t=JSON.parse(localStorage.getItem('noodo-design-system-v03')||'null')?.tokens;if(t)for(const k of ['background','primary','accent','secondary','textPrimary'])if(/^#[0-9a-f]{6}$/i.test(t[k]))document.documentElement.style.setProperty('--noodo-'+k,t[k]);}catch{}
let artistIndex=Number(new URLSearchParams(location.search).get('artist'));if(!Number.isInteger(artistIndex)||!tracks[artistIndex])artistIndex=0;
const artist=tracks[artistIndex],isLuna=artistIndex===0,artistSlug=(isLuna?'lunamarea':'artista-muestra-'+artistIndex)+(new URLSearchParams(location.search).get('member')?'-'+new URLSearchParams(location.search).get('member').replace(/[^a-z-]/g,''):''),listenURL='listen.html?track='+artistIndex+'&play=1';
document.title=artist.artist+' · NOODO';$('#artist-name').textContent=artist.artist;$('#sticky-artist-name').textContent=artist.artist;$('#sticky-artist-image').src=artist.image;$('#artist-bio').textContent=artistBio(artist);$('#hero-location').textContent='Cali, Colombia';$('#hero-genre').textContent=genreNames[artist.genre];$('#hero-type').textContent=profileKind(artistIndex);$('#hero-image').src=artist.image;$('#hero-image').alt='Retrato de '+artist.artist;$('#video-portrait').src=artist.image;$('#hero-listen').href=listenURL;
if(!isLuna)$('#hero-intro').textContent=artist.description;
if($('#artist-bio').textContent.trim()===$('#hero-intro').textContent.trim())$('#artist-bio').hidden=true;
const memberProfiles=[
 {id:'voz-principal',name:artistIndex===4?'Nicolás Rúa':artistIndex===3?'Elena Cruz':'Valeria Sol',role:'Voz · composición',image:artist.image,bio:'Voz principal y compositora. Su trabajo une la identidad del proyecto con nuevas formas de interpretar la ciudad.'},
 {id:'simon-rios',name:'Simón Ríos',role:'Sintetizadores · dirección musical',image:'assets/member-simon-v03.png',bio:'Arreglos y capas de sintetizadores que dan forma al sonido en vivo.'},
 {id:'mar-vera',name:'Mar Vera',role:'Percusión · coros',image:'assets/member-mar-v03.png',bio:'Ritmos del Pacífico y armonías vocales que conectan raíz y presente.'}
];
const profileURL=m=>'artist.html?artist='+artistIndex+(m.id?'&member='+m.id:'');
const members=profileKind(artistIndex)==='Banda'?memberProfiles:[{id:'',name:artist.artist,role:profileKind(artistIndex),image:artist.image},...memberProfiles.filter(m=>m.id!=='voz-principal')];
const memberLink=m=>`<a href="${profileURL(m)}" class="member-pill" title="${m.name} · ${m.role}"><img class="member-photo" src="${m.image}" alt=""><span>${m.name}</span></a>`;
$('#members').innerHTML=members.map(memberLink).join('');
const member=memberProfiles.find(m=>m.id===new URLSearchParams(location.search).get('member'));
if(member){
 $('#artist-bio').hidden=false;
 $('#hero-type').textContent=member.id==='simon-rios'?'Productor':member.id==='mar-vera'?'Percusionista':'Artista';document.title=member.name+' · NOODO';$('#artist-name').textContent=member.name;$('#sticky-artist-name').textContent=member.name;$('#hero-intro').textContent=member.role;$('#artist-bio').textContent=member.bio+' Forma parte del proyecto '+artist.artist+'.';$('#hero-image').src=member.image;$('#hero-image').alt='Retrato de '+member.name;$('#sticky-artist-image').src=member.image;
 $('#members-heading').textContent='Su proyecto y colaboradores.';$('#hero-listen').lastChild.textContent='Escuchar proyecto';$('#members').innerHTML=members.filter(m=>m.id!==member.id).map(memberLink).join('');
 for(const id of ['albumes','conciertos','videos']){$('#'+id).hidden=true;$('.section-nav a[href="#'+id+'"]').hidden=true;}
}
const socialIcons={
 YouTube:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 6 3-6 3Z"/>',
 Spotify:'<circle cx="12" cy="12" r="10"/><path d="M6 9c4-2 9-1 12 1M7 12c3-1 7-1 10 1M8 15c3-1 5-1 8 1"/>',
 SoundCloud:'<path d="M2 12v5m3-7v9m3-10v10m3-12v12h8a4 4 0 1 0-1-8 6 6 0 0 0-7-4Z"/>',
 Deezer:'<path d="M3 16h3m-3 4h3m2-12h3m-3 4h3m-3 4h3m-3 4h3m2-8h3m-3 4h3m-3 4h3m2-16h3m-3 4h3m-3 4h3m-3 4h3m-3 4h3"/>',
 Web:'<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/>',
 TikTok:'<path d="M14 3h3c0 3 2 5 5 5v3c-2 0-4-1-5-2v8a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2Z"/>'
};
$('#artist-socials').innerHTML=Object.entries(socialIcons).map(([name,path])=>`<button class="social-icon" data-social="${name}" aria-label="${name}" title="${name}"><svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg></button>`).join('');
$('#hero-genre').onclick=()=>window.noodoGenres.artists(artist.genre);
const artistTracks=tracks.map((t,i)=>({t,i})).filter(({t,i})=>t.kind==='track'&&artistProfileIndex(i)===artistIndex).slice(0,5);
$('#mini-player-heading').textContent='Canciones';
const miniFmt=n=>`${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;
const artistTrackIds=artistTracks.map(({i})=>i);
const disposeArtistRows=window.noodoTrackList.mount($('#artist-track-list'),artistTrackIds);
function miniState(){const state=window.noodoPlayer.getState();return artistTrackIds.includes(state.current)?state:{...state,current:artistTrackIds[0],elapsed:0,playing:false};}
function paintMiniPlayer(){
 const state=miniState(),t=tracks[state.current];if(!t)return;
 $('#mini-current-image').src=t.image;$('#mini-current-image').alt='Portada de '+t.title;$('#mini-current-title').textContent=t.title;$('#mini-status').textContent=state.playing?'Reproduciendo':'En pausa';
 $('#mini-toggle').innerHTML=icon(state.playing?'pause':'play');$('#mini-toggle').setAttribute('aria-label',(state.playing?'Pausar ':'Reproducir ')+t.title);$('#mini-toggle').setAttribute('aria-pressed',String(state.playing));
 $('#mini-elapsed').textContent=miniFmt(state.elapsed);$('#mini-duration').textContent=miniFmt(t.duration);$('#mini-seek').max=t.duration;$('#mini-seek').value=state.elapsed;$('#mini-seek').style.setProperty('--range-progress',(state.elapsed/t.duration*100)+'%');$('#mini-seek').setAttribute('aria-valuetext',miniFmt(state.elapsed)+' de '+miniFmt(t.duration));
 $('#mini-volume').value=state.volume;$('#mini-volume').style.setProperty('--range-progress',state.volume+'%');$('#mini-volume').setAttribute('aria-valuetext',state.volume+' por ciento');
}
$('#mini-toggle').onclick=()=>window.noodoPlayer.toggleTrack(miniState().current);
function stepMini(direction){const index=artistTrackIds.indexOf(miniState().current);window.noodoPlayer.select(artistTrackIds[(index+direction+artistTrackIds.length)%artistTrackIds.length],true);}
$('#mini-previous').onclick=()=>stepMini(-1);$('#mini-next').onclick=()=>stepMini(1);
$('#mini-seek').oninput=e=>window.noodoPlayer.seek(miniState().current,Number(e.target.value));
$('#mini-volume').oninput=e=>{window.noodoPlayer.setVolume(Number(e.target.value));paintMiniPlayer();};
window.addEventListener('noodo:playerchange',paintMiniPlayer);paintMiniPlayer();
$('#hero-listen').addEventListener('click',e=>{e.preventDefault();window.noodoPlayer.playQueue(artistTrackIds);});
let toastTimer;function toast(message){$('#artist-toast').textContent=message;$('#artist-toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#artist-toast').classList.remove('visible'),3500);}
const followKey='noodo-follow-'+artistSlug;let following=false;try{following=localStorage.getItem(followKey)==='true';}catch{}
function paintFollow(){$('#follow').setAttribute('aria-pressed',String(following));$('#follow-text').textContent=following?'Siguiendo':'Seguir artista';$('#follow [data-icon]').innerHTML=icon(following?'check':'plus');}
$('#follow').addEventListener('click',()=>{following=!following;try{localStorage.setItem(followKey,String(following));}catch{}window.noodoLibrary.rememberArtist({key:followKey,name:member?.name||artist.artist,image:member?.image||artist.image,href:profileURL(member||{id:''}),type:member?.role||profileKind(artistIndex)},following);paintFollow();toast(following?'Siguiendo al artista.':'Dejaste de seguir a este artista.');});paintFollow();
const navLinks=$$('.section-nav a');$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=$(a.hash);if(!target)return;e.preventDefault();history.pushState({},'',a.hash);target.scrollIntoView({behavior:'instant',block:'start'});updateStickyArtist();target.scrollIntoView({behavior:'instant',block:'start'});updateActiveSection();}));
let sectionFrame=0;
function updateActiveSection(){sectionFrame=0;updateStickyArtist();const sections=navLinks.map(a=>$(a.hash)).filter(section=>section&&!section.hidden),threshold=$('.section-nav').getBoundingClientRect().bottom+72;let active=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<=threshold&&(!active||section.getBoundingClientRect().top>=active.getBoundingClientRect().top))active=section;const requested=sections.find(section=>'#'+section.id===location.hash);if(requested&&active&&Math.abs(requested.getBoundingClientRect().top-active.getBoundingClientRect().top)<24)active=requested;if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)active=sections.at(-1);if(!$('.artist-section-bar').classList.contains('is-stuck'))active=null;navLinks.forEach(a=>{const selected=active&&a.hash==='#'+active.id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
function updateStickyArtist(){const header=document.querySelector('.workspace-tools'),bar=$('.artist-section-bar');const stuck=$('.artist-hero').getBoundingClientRect().bottom<=header.getBoundingClientRect().bottom+1;bar.classList.toggle('is-stuck',stuck);$('.sticky-artist').hidden=!stuck;root.style.setProperty('--artist-anchor-offset',(header.getBoundingClientRect().bottom+bar.offsetHeight+16)+'px');}
const stickyResize=new ResizeObserver(()=>{if(!sectionFrame)sectionFrame=requestAnimationFrame(updateActiveSection);});stickyResize.observe(document.querySelector('.workspace-tools'));stickyResize.observe($('.artist-section-bar'));
const onArtistScroll=()=>{if(!sectionFrame)sectionFrame=requestAnimationFrame(updateActiveSection);};window.addEventListener('scroll',onArtistScroll,{passive:true});window.addEventListener('resize',updateActiveSection);updateActiveSection();

let disposeAlbumRows=null;const dialog=$('#detail-dialog');document.querySelector('#center-details').appendChild(dialog);function showDetail(kind,html){disposeAlbumRows?.();disposeAlbumRows=null;dialog.dataset.kind=kind;$('#detail-kind').textContent=kind;$('#detail-body').innerHTML=html;window.noodoWorkspace.showPanel(dialog);dialog.scrollTop=0;}$('#close-detail').addEventListener('click',()=>window.noodoWorkspace.closePanel());
$('#artist-contact').onclick=()=>showDetail('Contacto',`<h2 id="detail-title">Contactar a ${member?.name||artist.artist}</h2><div class="booking-grid"><article><h3>Booking y presentaciones</h3><p>Conciertos, festivales y eventos.</p><dl><dt>${icon('mail')}Correo</dt><dd>No disponible</dd><dt>${icon('phone')}Teléfono</dt><dd>No disponible</dd></dl></article><article><h3>Prensa y colaboraciones</h3><p>Entrevistas, lanzamientos y proyectos creativos.</p><dl><dt>${icon('mail')}Correo</dt><dd>No disponible</dd></dl></article></div>`);

const playlistKey='noodo-playlists-v1';
function readPlaylists(){try{const value=JSON.parse(localStorage.getItem(playlistKey)||'null');if(Array.isArray(value)&&value.length)return value.filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&Array.isArray(p.tracks)).map(p=>({...p,tracks:p.tracks.filter(i=>Number.isInteger(i)&&tracks[i])}));}catch{}return [{id:'my-playlist',name:'Mi playlist',tracks:[]},{id:'later',name:'Para escuchar después',tracks:[]}];}
const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function openPlaylistPicker(trackIndex){
 const song=tracks[trackIndex];let playlists=readPlaylists();
 showDetail('Tu biblioteca',`<h2 id="detail-title">Añadir a playlist</h2><p>${song.title} · ${song.artist}</p><label class="playlist-label" for="playlist-choice">Elige una playlist</label><select id="playlist-choice">${playlists.map(p=>`<option value="${escapeHTML(p.id)}">${escapeHTML(p.name)} · ${p.tracks.length} ${p.tracks.length===1?'canción':'canciones'}</option>`).join('')}</select><div class="playlist-create"><label class="playlist-label" for="new-playlist-name">O crea una nueva</label><div><input id="new-playlist-name" type="text" maxlength="60" placeholder="Nombre de tu playlist"><button class="button secondary" id="create-playlist">Crear</button></div></div><button class="button primary" id="add-to-playlist">Añadir canción</button><p id="playlist-feedback" role="status"></p>`);
 function save(){try{localStorage.setItem(playlistKey,JSON.stringify(playlists));return true;}catch{$('#playlist-feedback').textContent='No se pudo guardar. Revisa el almacenamiento del navegador.';return false;}}
 function paintChoice(){const entry=playlists.find(p=>p.id===$('#playlist-choice').value),added=entry?.tracks.includes(trackIndex);$('#add-to-playlist').disabled=!!added;$('#add-to-playlist').textContent=added?'Ya está en esta playlist':'Añadir canción';}
 $('#playlist-choice').onchange=()=>{$('#playlist-feedback').textContent='';paintChoice();};
 $('#create-playlist').onclick=()=>{const name=$('#new-playlist-name').value.trim();if(!name){$('#playlist-feedback').textContent='Escribe un nombre para la playlist.';$('#new-playlist-name').focus();return;}const duplicate=playlists.find(p=>p.name.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'));if(duplicate){$('#playlist-choice').value=duplicate.id;$('#playlist-feedback').textContent='Esta playlist ya existe. La seleccionamos para ti.';paintChoice();return;}const entry={id:'playlist-'+Date.now(),name,tracks:[]};playlists.push(entry);if(save()){const option=document.createElement('option');option.value=entry.id;option.textContent=name+' · 0 canciones';$('#playlist-choice').append(option);$('#playlist-choice').value=entry.id;$('#new-playlist-name').value='';$('#playlist-feedback').textContent='Playlist creada.';paintChoice();}else playlists.pop();};
 $('#add-to-playlist').onclick=()=>{const entry=playlists.find(p=>p.id===$('#playlist-choice').value);if(!entry||entry.tracks.includes(trackIndex))return;entry.tracks.push(trackIndex);if(save()){$('#playlist-feedback').textContent='Añadida a '+entry.name+'.';$('#playlist-choice').selectedOptions[0].textContent=entry.name+' · '+entry.tracks.length+' '+(entry.tracks.length===1?'canción':'canciones');paintChoice();}else entry.tracks.pop();};
 paintChoice();
}
$$('[data-add-playlist]').forEach(button=>button.onclick=()=>window.noodoLibrary.pick(Number(button.dataset.addPlaylist)));
const songIds=artistTracks.map(({i})=>i);
const albums=[{title:'Entre luces',type:'EP',year:'2026',ids:songIds.slice(0,4)},{title:'Marea adentro',type:'Álbum',year:'2025',ids:songIds},{title:'Raíz eléctrica',type:'Single',year:'2025',ids:songIds.slice(-1)},{title:'Umbral',type:'EP',year:'2024',ids:songIds.slice(1,4)}];
$$('[data-album]').forEach(button=>{
 const album=albums[Number(button.dataset.album)];const coverSlug=['entre-luces','marea-adentro','raiz-electrica','umbral'][Number(button.dataset.album)];button.querySelector('.album-art').innerHTML=`<img src="assets/album-${coverSlug}-v17.png" alt="Portada de ${album.title}" loading="lazy">`;button.querySelector('.muted').textContent=album.type+' · '+album.ids.length+' '+(album.ids.length===1?'canción':'canciones')+' · '+album.year;
 button.addEventListener('click',()=>{
 const duration=album.ids.reduce((sum,i)=>sum+tracks[i].duration,0),cover=button.querySelector('.album-art').outerHTML;
 showDetail('Álbum',`<section class="album-header" aria-labelledby="detail-title"><div class="album-detail-cover" role="img" aria-label="Portada de ${album.title}">${cover}</div><div class="album-header-copy"><span class="album-format">${album.type} · ${album.year}</span><h1 id="detail-title">${album.title}</h1><a class="album-artist-link" href="artist.html?artist=${artistIndex}"><img src="${artist.image}" alt=""><strong>${artist.artist}</strong>${icon('link')}</a><p>${profileKind(artistIndex)} · ${genreNames[artist.genre]} · Cali, Colombia</p><p class="album-bio">${artistBio(artist)}</p><div class="album-actions"><button class="pill primary" id="play-album">${icon('play')}Reproducir</button><span>${album.ids.length} canciones · ${Math.floor(duration/60)} min ${duration%60} s</span></div></div></section><section class="track-section album-songs" aria-label="Canciones de ${album.title}"><div class="track-columns" aria-hidden="true"><span></span><span>Canción / artista</span><span>Género</span><span>Duración</span><span></span></div><div id="album-track-list"></div></section>`);
 window.noodoTrackList.preview(album.ids[0]);selectInfo('artist',false,false);
 disposeAlbumRows=window.noodoTrackList.mount($('#album-track-list'),album.ids);
 $('#play-album').onclick=()=>window.noodoTrackList.play(album.ids[0]);
 });
});
$$('[data-social]').forEach(button=>button.addEventListener('click',()=>showDetail('Redes del artista',`<h2 id="detail-title">${button.dataset.social}</h2><p>El enlace oficial de ${member?.name||artist.artist} todavía no está vinculado.</p>`)));
const photos=[
 {src:member?.image||artist.image,title:'Entre luces'},
 {src:'assets/gallery-rehearsal-v03.png',title:'En el ensayo'},
 {src:'assets/gallery-synth-v03.png',title:'Otra frecuencia'},
 {src:'assets/live-session-v02.png',title:'Un patio, muchas voces'},
 {src:'assets/member-simon-v03.png',title:'Simón Ríos'},
 {src:'assets/gallery-percussion-v03.png',title:'El pulso'},
 {src:'assets/gallery-night-stage-v03.png',title:'Frente al escenario'},
 {src:'assets/gallery-backstage-v03.png',title:'Antes de salir'},
 {src:'assets/member-mar-v03.png',title:'Mar Vera'},
 {src:'assets/gallery-cali-night-v03.png',title:'La ciudad de noche'},
 {src:'assets/gallery-microphone-v03.png',title:'Una voz cerca'},
 {src:'assets/gallery-crowd-v03.png',title:'Nos encontramos'}
].map(photo=>({...photo,caption:photo.title}));
$('#artist-gallery').innerHTML=photos.map((photo,i)=>`<button data-photo="${i}" class="gallery-photo" aria-label="Abrir foto ${i+1}: ${photo.title}"><img src="${photo.src}" alt="${photo.caption}" loading="lazy"><span>${photo.title}${icon('expand')}</span></button>`).join('');
let photoIndex=0,photoOrigin=0;
const galleryGrid=$('#artist-gallery'),galleryViewer=document.createElement('div');galleryViewer.className='gallery-viewer';galleryViewer.hidden=true;galleryViewer.tabIndex=-1;galleryViewer.setAttribute('aria-label','Visor de la galería');galleryGrid.after(galleryViewer);
galleryViewer.innerHTML=`<div class="gallery-viewer-toolbar"><button class="text-button" id="photo-grid">← Galería</button><span id="photo-count" aria-live="polite"></span></div><img id="gallery-large-image" alt=""><div class="gallery-viewer-controls"><button class="icon-button" id="photo-prev" aria-label="Foto anterior">${icon('previous')}</button><span id="photo-caption"></span><button class="icon-button" id="photo-next" aria-label="Foto siguiente">${icon('next')}</button></div>`;
function showPhoto(i){
 if(galleryViewer.hidden){photoOrigin=i;galleryViewer.style.setProperty('--gallery-viewer-height',galleryGrid.getBoundingClientRect().height+'px');galleryGrid.hidden=true;galleryViewer.hidden=false;}
 photoIndex=(i+photos.length)%photos.length;const photo=photos[photoIndex];$('#gallery-large-image').src=photo.src;$('#gallery-large-image').alt=photo.caption;$('#photo-count').textContent=(photoIndex+1)+' / '+photos.length;$('#photo-caption').textContent=photo.title;
}
function closePhoto(){galleryViewer.hidden=true;galleryGrid.hidden=false;galleryGrid.querySelector('[data-photo="'+photoOrigin+'"]').focus({preventScroll:true});}
$('#photo-grid').onclick=closePhoto;$('#photo-prev').onclick=()=>showPhoto(photoIndex-1);$('#photo-next').onclick=()=>showPhoto(photoIndex+1);
galleryViewer.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closePhoto();}else if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex-1);}else if(e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+1);}});
$$('[data-photo]').forEach(b=>b.addEventListener('click',()=>{showPhoto(Number(b.dataset.photo));$('#photo-grid').focus({preventScroll:true});}));
$$('[data-video]').forEach(b=>b.addEventListener('click',()=>{const live=b.dataset.video==='0';showDetail('Multimedia',`<img src="${live?'assets/live-session-v02.png':artist.image}" alt="Portada del video"><h2 id="detail-title">${live?'Entre luces · Sesión en el patio':'Cómo nace una frecuencia'}</h2><p>${live?'Una sesión en vivo pensada para acercar al público al sonido del proyecto.':'Una conversación sobre influencias, composición y la escena musical de Cali.'}</p><p>Video no disponible.</p><p>Artista: ${artist.artist}<br>Formato: ${live?'Live session':'Entrevista'}<br>Producción: NOODO</p>`);}));
$('#concert-list').innerHTML=concertSamples.map((event,i)=>`<article class="concert-row"><time class="event-date" datetime="${event.date}"><span>${event.weekday}</span><strong>${event.day}</strong><span>${event.month}</span></time><img src="${event.image}" alt=""><div class="event-copy"><span class="event-badges"><span>${event.kind}</span>${event.free?'<span class="event-free">Gratis</span>':''}</span><button class="event-title" data-concert="${i}">${event.title}</button><span class="event-place">${icon('pin')}${event.place} · ${event.time}</span></div><div class="concert-actions"><button class="button ticket-action" data-ticket="${i}">${icon('ticket')}<span>${event.free?'Reservar entrada':'Comprar tickets'}</span></button><button class="event-open" data-concert="${i}" aria-label="Ver ${event.title}">↗</button></div></article>`).join('');
$$('[data-concert],[data-ticket]').forEach(button=>button.addEventListener('click',()=>window.noodoEvents.open(Number(button.dataset.concert??button.dataset.ticket))));

return ()=>{disposeAlbumRows?.();disposeArtistRows();window.removeEventListener('noodo:playerchange',paintMiniPlayer);dialog.remove();stickyResize.disconnect();clearTimeout(toastTimer);cancelAnimationFrame(sectionFrame);window.removeEventListener("scroll",onArtistScroll);window.removeEventListener("resize",updateActiveSection);};
};
