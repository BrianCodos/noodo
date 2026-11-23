'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const paths={play:'<path d="m8 5 11 7-11 7Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',next:'<path d="m5 5 10 7-10 7ZM19 5v14"/>',previous:'<path d="m19 5-10 7 10 7ZM5 5v14"/>',shuffle:'<path d="M3 5h3c5 0 7 14 12 14h3m-4-4 4 4-4 4M3 19h3c5 0 7-14 12-14h3m-4-4 4 4-4 4"/>',repeat:'<path d="m17 2 4 4-4 4M3 11V6h18M7 22l-4-4 4-4m14-1v5H3"/>',volume:'<path d="M3 9h4l5-5v16l-5-5H3Zm13-2a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16"/>',mute:'<path d="M3 9h4l5-5v16l-5-5H3Zm13 0 6 6m0-6-6 6"/>',heart:'<path d="M12 20 4 12C-2 5 7 1 12 7c5-6 14-2 8 5Z"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',sound:'<path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4"/>',queue:'<path d="M3 5h18M3 11h12M3 17h8m6-3 5 4-5 4Z"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>'};
Object.assign(paths,{ticket:'<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4Z"/><path d="M15 5v3m0 2v4m0 2v3"/>',panel:'<path d="M3 4h18v16H3ZM9 4v16m6-11-3 3 3 3"/>',support:'<path d="M3 11h18v10H3ZM2 7h20v4H2ZM12 7v14"/><path d="M12 7H7a3 3 0 1 1 3-3Zm0 0h5a3 3 0 1 0-3-3Z"/>',music:'<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',calendar:'<path d="M4 5h16v16H4ZM8 2v6M16 2v6M4 11h16"/>',lyrics:'<path d="M4 5h16M4 10h16M4 15h10M4 20h7"/>',link:'<path d="m10 13 4-4m-6 6-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 2 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/>',plus:'<path d="M12 4v16M4 12h16"/>',minus:'<path d="M4 12h16"/>',home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',browse:'<path d="M4 4h16v4H4Zm-1 8h18l-2 9H5Z"/><path d="M10 16h4"/>',bell:'<path d="M5 10a7 7 0 0 1 14 0v6l2 2H3l2-2Zm4 11h6"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>'});
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true" ${name==='heart'?'data-heart':''}>${paths[name]}</svg>`;
$$('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
// The prototype inherits valid semantic color edits from the local design-system editor.
try{const t=JSON.parse(localStorage.getItem('noodo-design-system-v03')||'null')?.tokens;if(t)for(const k of ['background','primary','accent','secondary','textPrimary'])if(/^#[0-9a-f]{6}$/i.test(t[k]))document.documentElement.style.setProperty('--noodo-'+k,t[k]);}catch{}
let genre='all',promoDismissed=false;
let playbackQueue=null;
let selected=0,current=0,elapsed=0,playing=false,shuffle=false,repeat=false,volume=70,lastVolume=70,filter='track',view='home',saved=new Set(),toastTimer;
const fmt=n=>`${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;
function announce(msg){$('#toast').textContent=msg;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2800);}
function row(t,i){return `<div data-row-track="${i}" tabindex="0" role="group" aria-label="${t.title}, ${t.artist}" class="track-row ${i===selected?'current':''}" ${i===current?'aria-current="true"':''}><button class="icon-button track-play" data-track-play="${i}" aria-label="${i===current&&playing?'Pausar':'Reproducir'} ${t.title}">${icon(i===current&&playing?'pause':'play')}</button><img class="track-cover" src="${t.image}" alt=""><div class="track-info"><button class="track-select" data-track-select="${i}" aria-pressed="${i===selected}" aria-label="Seleccionar o reproducir ${t.title}">${t.title}</button><small>${t.artist}</small></div><button class="track-type genre-link" data-track-genre="${t.genre}" aria-label="Ver artistas de ${genreNames[t.genre]}">${genreNames[t.genre]}</button><span class="track-duration">${fmt(t.duration)}</span><button class="icon-button" data-save="${i}" aria-label="${saved.has(i)?'Quitar de guardados':'Guardar'} ${t.title}" aria-pressed="${saved.has(i)}">${icon('heart')}</button><button class="icon-button playlist-add" data-playlist-add="${i}" aria-label="Añadir ${t.title} a playlist" title="Añadir a playlist">${icon('plus')}</button><button class="support-button" data-support="${i}" aria-label="Apoyar a ${t.artist}" title="Apoyar al artista">${icon('support')}<span>Apoyar</span></button></div>`;}
function matches(t,i){const q=$('#search-music').value.trim().toLocaleLowerCase('es');return (genre==='all'||t.genre===genre)&&(filter==='all'||t.kind===filter)&&(view!=='saved'||saved.has(i))&&(!q||`${t.title} ${t.artist} ${t.label}`.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q.normalize('NFD').replace(/[\u0300-\u036f]/g,'')));}
function sessionCard(t,i,options={}){
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const title=escape(options.title??t.title),artist=escape(options.artist??t.artist),meta=escape(options.meta??('Live session · '+genreNames[t.genre]));
 const position=['top','bottom','overlay'].includes(options.infoPosition)?options.infoPosition:'overlay';
 const info=`<div class="session-card-info"><div class="session-card-copy"><h3>${title}</h3>${artist?`<p>${artist}</p>`:''}${meta?`<p class="session-card-meta">${meta}</p>`:''}</div>${options.showSave===false?'':`<button class="icon-button" data-session-save="${i}" aria-label="${saved.has(i)?'Quitar de guardados':'Guardar'} ${title}" aria-pressed="${saved.has(i)}">${icon('heart')}</button>`}</div>`;
 const poster=`<button class="session-open" data-session="${i}" aria-label="Ver ${title}"><span class="session-poster"><img src="${escape(t.image)}" alt="${title}" loading="lazy"><span class="session-play">${icon('play')}</span><span class="session-duration">${fmt(t.duration)}</span></span></button>`;
 return `<article class="session-card" data-info-position="${position}">${position==='top'?info+poster:poster+info}</article>`;
}
function renderList(){updatePromoVisibility();const items=tracks.map((t,i)=>({t,i})).filter(({t,i})=>matches(t,i)),songs=items.filter(({t})=>t.kind!=='session'),sessions=items.filter(({t})=>t.kind==='session');$('#track-list').innerHTML=songs.map(({t,i},position)=>row(t,i)).join('');$('#track-list').hidden=!songs.length;$('.track-columns').hidden=!songs.length;$('#session-list').innerHTML=sessions.map(({t,i})=>sessionCard(t,i)).join('');$('#session-list').hidden=!sessions.length;$('#empty').hidden=items.length>0;$('#tracks-title').textContent=view==='saved'?'Tus guardados':genre!=='all'?genreNames[genre]:filter==='session'?'Originals':view==='home'?'Para escuchar hoy':'Canciones';$('#selection-summary').textContent=items.length+' '+(filter==='session'?(items.length===1?'video':'videos'):(items.length===1?'contenido':'contenidos'));$('#play-selection').hidden=!songs.length;$('#play-selection').disabled=!songs.length;$('#shuffle-selection').hidden=!songs.length;$('#shuffle-selection').disabled=!songs.length;$('#queue-list').innerHTML=tracks.map((t,i)=>({t,i})).filter(({t})=>t.kind!=='session').map(({t,i})=>row(t,i)).join('');paintRowProgress();window.dispatchEvent(new Event('noodo:catalogchange'));}
function openSession(i){const t=tracks[i];if(!t||t.kind!=='session')return;selected=i;renderContext();$('#session-title').textContent=t.title;$('#session-video').poster=t.image;$('#session-video').setAttribute('aria-label',t.title);$('#session-artist').textContent=t.artist;$('#session-artist').href='artist.html?artist='+artistProfileIndex(i);$('#session-description').textContent=t.description;const query=encodeURIComponent(t.artist+' '+t.title);$('#session-youtube').href=t.youtubeURL||'https://www.youtube.com/results?search_query='+query;$('#session-spotify').href=t.spotifyURL||'https://open.spotify.com/search/'+query;window.noodoWorkspace.showPanel($('#session-dialog'));}
function sessionAction(e){const open=e.target.closest('[data-session]'),save=e.target.closest('[data-session-save]');if(open)openSession(Number(open.dataset.session));if(save)toggleSave(Number(save.dataset.sessionSave));}
$('#session-list').onclick=sessionAction;
window.noodoSessionCard={render:sessionCard,mount(element,index,options={}){
 if(tracks[index]?.kind!=='session')return ()=>{};
 const render=()=>{const focused=element.contains(document.activeElement)?document.activeElement.closest('[data-session],[data-session-save]'):null;const attr=focused?.hasAttribute('data-session-save')?'data-session-save':'data-session';element.innerHTML=sessionCard(tracks[index],index,options);if(focused)element.querySelector('['+attr+']')?.focus({preventScroll:true});};
 element.addEventListener('click',sessionAction);window.addEventListener('noodo:catalogchange',render);render();
 return ()=>{element.removeEventListener('click',sessionAction);window.removeEventListener('noodo:catalogchange',render);};
}};
window.noodoSessionCard.mount($('#featured-session-card'),tracks.findIndex(t=>t.kind==='session'));
$('#close-session').onclick=()=>window.noodoWorkspace.closePanel();

function paintTransport(){persistPlayer();const t=tracks[current];$('#toggle-play').innerHTML=icon(playing?'pause':'play');$('#toggle-play').setAttribute('aria-label',playing?'Pausar':'Reproducir');$('#toggle-play').setAttribute('aria-pressed',String(playing));$('#elapsed').textContent=fmt(elapsed);$('#duration').textContent=fmt(t.duration);$('#seek').max=t.duration;$('#seek').value=elapsed;$('#seek').style.setProperty('--range-progress',(elapsed/t.duration*100)+'%');$('#seek').setAttribute('aria-valuetext',`${fmt(elapsed)} de ${fmt(t.duration)}`);$('#play-status').textContent=(playing?'Reproduciendo':'En pausa');document.body.classList.toggle('is-playing',playing);paintRowProgress();paintLyricsProgress();window.dispatchEvent(new CustomEvent('noodo:playerchange',{detail:{current,elapsed,playing,volume}}));}
function paintCurrent(){const t=tracks[current],n=tracks[stepAudio()];$$('[data-current-title]').forEach(e=>e.textContent=t.title);$$('[data-current-artist]').forEach(e=>e.textContent=t.artist);$('#now-image').src=t.image;$('#now-image').alt=t.kind==='session'?'Sesión musical en vivo':'Retrato de '+t.artist;$('#dock-image').src=t.image;$$('[data-playing-image]').forEach(img=>img.src=t.image);$('#now-category').textContent=t.label;$('#now-mood').textContent=t.mood;$('#now-description').textContent=t.description;$('#next-image').src=n.image;$('#next-title').textContent=n.title;$('#next-artist').textContent=n.artist;$('#save-current').setAttribute('aria-label',(saved.has(current)?'Quitar de guardados ':'Guardar ')+t.title);$('#save-current').setAttribute('aria-pressed',String(saved.has(current)));paintTransport();renderList();renderContext();}
function start(i){if(playbackQueue&&!playbackQueue.includes(i))playbackQueue=null;if(tracks[i]?.kind==='session'){openSession(i);return;}selected=i;current=i;elapsed=0;playing=true;paintCurrent();}
function toggle(){if(elapsed===tracks[current].duration)elapsed=0;playing=!playing;paintTransport();renderList();}
function audioIndices(){if(playbackQueue?.length)return playbackQueue;return tracks.map((t,i)=>t.kind==='track'?i:null).filter(i=>i!==null);}
function stepAudio(direction=1){const list=audioIndices();return list[(list.indexOf(current)+direction+list.length)%list.length];}
function next(manual=true){const list=audioIndices(),pos=list.indexOf(current);if(!manual&&!repeat&&!shuffle&&pos===list.length-1){playing=false;elapsed=tracks[current].duration;paintTransport();renderList();return;}current=shuffle?list.filter(i=>i!==current)[Math.floor(Math.random()*(list.length-1))]:stepAudio();selected=current;elapsed=0;paintCurrent();}
function toggleSave(i){saved.has(i)?saved.delete(i):saved.add(i);const message=saved.has(i)?'Guardado.':'Quitado de guardados.';window.noodoLibrary?.syncSaved([...saved]);paintCurrent();announce(message);}
function applyFilter(value){filter=value;$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));renderList();}
function setView(value){view=value;setGenre('all',false);$$('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===value);b.setAttribute('aria-pressed',String(b.dataset.view===value));});applyFilter(value==='session'?'session':value==='saved'?'all':'track');$('.collections').hidden=value!=='home';}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.view==='saved'){window.noodoLibrary.open();return;}window.noodoWorkspace.songs();setView(b.dataset.view);}));
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>applyFilter(b.dataset.filter)));
$('#search-music').addEventListener('input',()=>{window.noodoWorkspace.songs();renderList();});$('#reset-filter').addEventListener('click',()=>{$('#search-music').value='';setView('all');});
$$('[data-start]').forEach(b=>b.addEventListener('click',()=>start(Number(b.dataset.start))));
function listAction(e){const add=e.target.closest('[data-playlist-add]');if(add){window.noodoLibrary.pick(Number(add.dataset.playlistAdd));return;}const genreButton=e.target.closest('[data-track-genre]');if(genreButton){openGenreArtists(genreButton.dataset.trackGenre);return;}const support=e.target.closest('[data-support]');if(support){openSupport(Number(support.dataset.support));return;}const selectButton=e.target.closest('[data-track-select]');if(selectButton){selectTrack(Number(selectButton.dataset.trackSelect));e.currentTarget.querySelector('[data-track-select="'+selectButton.dataset.trackSelect+'"]')?.focus({preventScroll:true});return;}const play=e.target.closest('[data-track-play]'),save=e.target.closest('[data-save]');if(play){const i=Number(play.dataset.trackPlay);selected=i;i===current?toggle():start(i);renderContext();}if(save)toggleSave(Number(save.dataset.save));if(!play&&!save&&!e.target.closest('button,a,input')){const item=e.target.closest('[data-row-track]');if(item)selectTrack(Number(item.dataset.rowTrack));}const origin=play||save;if(origin){const key=play?'data-track-play':'data-save',value=origin.getAttribute(key);const root=e.currentTarget;const replacement=root.querySelector('['+key+'="'+value+'"]');if(replacement)replacement.focus({preventScroll:true});else $('[data-view="saved"]').focus({preventScroll:true});}}
$('#track-list').addEventListener('click',listAction);$('#queue-list').addEventListener('click',listAction);
for(const list of [$('#track-list'),$('#queue-list')])list.addEventListener('keydown',e=>{if(e.target.matches('[data-row-track]')&&['Enter',' '].includes(e.key)){e.preventDefault();const i=Number(e.target.dataset.rowTrack);selectTrack(i);list.querySelector('[data-row-track="'+i+'"]')?.focus({preventScroll:true});}});
$('#toggle-play').addEventListener('click',toggle);$('#next').addEventListener('click',()=>next());$('#previous').addEventListener('click',()=>{current=stepAudio(-1);selected=current;elapsed=0;paintCurrent();});$('#next-preview').addEventListener('click',()=>start(stepAudio()));$('#save-current').addEventListener('click',()=>toggleSave(current));
$('#seek').addEventListener('input',e=>{elapsed=Number(e.target.value);if(elapsed===tracks[current].duration){playing=false;renderList();}paintTransport();});
for(const mode of ['shuffle','repeat'])$('#'+mode).addEventListener('click',()=>{if(mode==='shuffle')shuffle=!shuffle;else repeat=!repeat;const active=mode==='shuffle'?shuffle:repeat;$('#'+mode).setAttribute('aria-pressed',String(active));$('#'+mode).setAttribute('aria-label',(active?'Desactivar ':'Activar ')+(mode==='shuffle'?'mezcla':'repetición'));});
function paintVolume(){persistPlayer();$('#volume').value=volume;$('#volume').style.setProperty('--range-progress',volume+'%');$('#volume').setAttribute('aria-valuetext',volume+' por ciento');$('#mute').innerHTML=icon(volume===0?'mute':'volume');$('#mute').setAttribute('aria-pressed',String(volume===0));$('#mute').setAttribute('aria-label',volume===0?'Restaurar volumen':'Silenciar volumen');window.dispatchEvent(new CustomEvent('noodo:playerchange',{detail:{current,elapsed,playing,volume}}));}
$('#volume').addEventListener('input',e=>{volume=Number(e.target.value);if(volume)lastVolume=volume;paintVolume();});$('#mute').addEventListener('click',()=>{if(volume){lastVolume=volume;volume=0;}else volume=lastVolume||70;paintVolume();});
$('#queue-toggle').addEventListener('click',()=>window.noodoWorkspace.showPanel($('#queue-dialog')));$('#open-queue').addEventListener('click',()=>window.noodoWorkspace.showPanel($('#queue-dialog')));$('#close-queue').addEventListener('click',()=>window.noodoWorkspace.closePanel());
setInterval(()=>{if(!playing)return;elapsed++;if(elapsed>=tracks[current].duration)next(false);else paintTransport();},1000);


function setGenre(value,announce=true){genre=value;$$('[data-genre]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.genre===value)));$('#clear-genre').hidden=value==='all';$('#genre-status').textContent=value==='all'?'Explora doce géneros musicales.':'Género seleccionado: '+genreNames[value];if(announce){applyFilter('all');renderList();}}
$$('[data-genre]').forEach(b=>b.addEventListener('click',()=>openGenreArtists(b.dataset.genre)));
$('#clear-genre').addEventListener('click',()=>setGenre('all'));
const genreSlider=$('#genre-slider');
function moveGenres(direction){genreSlider.scrollBy({left:direction*genreSlider.clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});}
function updateGenreArrows(){$('#genres-prev').disabled=genreSlider.scrollLeft<2;$('#genres-next').disabled=genreSlider.scrollLeft+genreSlider.clientWidth>=genreSlider.scrollWidth-2;}
$('#genres-prev').addEventListener('click',()=>moveGenres(-1));$('#genres-next').addEventListener('click',()=>moveGenres(1));
genreSlider.addEventListener('scroll',updateGenreArrows,{passive:true});window.addEventListener('resize',updateGenreArrows);
genreSlider.addEventListener('keydown',e=>{if(e.target!==genreSlider)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveGenres(e.key==='ArrowRight'?1:-1);}});updateGenreArrows();

$('.wordmark').addEventListener('click',e=>{e.preventDefault();$('#home').click();});
$('#home').addEventListener('click',()=>{window.noodoWorkspace.songs();$('#search-music').value='';setView('home');window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});});
function genreTile(key,index){const styles=['frequency','roots','city'];return `<button class="collection ${styles[index%3]}" data-open-genre="${key}"><span class="${index%3===0?'orb':index%3===1?'art-lines':'art-rings'}" aria-hidden="true"></span><strong>${genreNames[key]}</strong><span class="collection-bottom">Explorar artistas ${icon('arrow')}</span></button>`;}
function openGenres(){$('#genre-directory-grid').innerHTML=Object.keys(genreNames).map(genreTile).join('');window.noodoWorkspace.showPanel($('#genre-directory'));}
// ArtistCollection shares one ArtistCard renderer between list and grid views.
let artistCollectionView='list';try{if(localStorage.getItem('noodo-artist-view')==='grid')artistCollectionView='grid';}catch{}
const artistSocialPaths={Instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>',YouTube:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 6 3-6 3Z"/>',Spotify:'<circle cx="12" cy="12" r="10"/><path d="M6 9c4-2 9-1 12 1M7 12c3-1 7-1 10 1M8 15c3-1 5-1 8 1"/>'};
function artistSaveKey(i){return 'noodo-follow-'+(i===0?'lunamarea':'artista-muestra-'+i);}
function artistIsSaved(i){try{return localStorage.getItem(artistSaveKey(i))==='true';}catch{return false;}}
function renderArtistCard(i){const t=tracks[i],saved=artistIsSaved(i);return `<article class="genre-artist-card artist-card" data-artist-card="${i}"><a class="artist-card-profile" href="artist.html?artist=${i}"><img src="${t.image}" alt="" loading="lazy"><div class="artist-card-copy"><strong>${t.artist}</strong><span>${profileKind(i)} · ${genreNames[t.genre]}</span></div></a><div class="artist-card-actions"><div class="artist-card-socials" aria-label="Redes de ${t.artist}">${Object.entries(artistSocialPaths).map(([name,path])=>`<button class="icon-button" type="button" data-artist-social="${name}" data-artist="${i}" aria-label="${name} de ${t.artist}" title="${name}"><svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg></button>`).join('')}</div><div class="artist-card-playback"><button type="button" class="icon-button" data-artist-save="${i}" aria-pressed="${saved}" aria-label="${saved?'Dejar de guardar':'Guardar'} artista ${t.artist}" title="${saved?'Artista guardado':'Guardar artista'}">${icon('heart')}</button><button type="button" class="pill primary" data-artist-play="${i}" aria-label="Reproducir playlist de ${t.artist}">${icon('play')}<span>Reproducir</span></button></div></div></article>`;}
let disposeArtistPlaylist=null;
function openArtistPlaylist(i){
 const ids=tracks.map((t,index)=>({t,index})).filter(({t,index})=>t.kind==='track'&&artistProfileIndex(index)===i).map(({index})=>index);
 if(!ids.length){toast('Este artista todavía no tiene canciones disponibles.');return;}
 let panel=$('#artist-playlist');if(!panel){panel=document.createElement('section');panel.id='artist-playlist';panel.className='central-panel experience-panel';panel.hidden=true;panel.tabIndex=-1;$('#center-details').append(panel);}
 disposeArtistPlaylist?.();panel.setAttribute('aria-label','Playlist de '+tracks[i].artist);panel.innerHTML=`<button type="button" class="text-button unified-back">← Volver</button><div class="section-heading"><div><h1>${tracks[i].artist}</h1><p>${ids.length} canciones</p></div><button type="button" class="pill primary" data-play-artist-all>${icon('play')}Reproducir todo</button></div><div class="song-list" id="artist-playlist-rows"></div>`;
 disposeArtistPlaylist=window.noodoTrackList.mount(panel.querySelector('.song-list'),ids);panel.querySelector('[data-play-artist-all]').onclick=()=>window.noodoPlayer.playQueue(ids);
 window.noodoWorkspace.showPanel(panel);window.noodoPlayer.playQueue(ids);
}
function mountArtistCollection(container,indices){
 container.classList.add('artist-collection');container.dataset.view=artistCollectionView;
 container.innerHTML=indices.map(renderArtistCard).join('')||'<p class="artist-collection-empty">Aún no hay artistas en este género.</p>';
 container.onclick=e=>{
  const play=e.target.closest('[data-artist-play]');if(play){openArtistPlaylist(Number(play.dataset.artistPlay));return;}
  const save=e.target.closest('[data-artist-save]');if(save){const i=Number(save.dataset.artistSave),next=!artistIsSaved(i);try{localStorage.setItem(artistSaveKey(i),String(next));}catch{toast('No se pudo guardar el artista en este navegador.');return;}
   document.querySelectorAll('[data-artist-save="'+i+'"]').forEach(button=>{button.setAttribute('aria-pressed',String(next));button.setAttribute('aria-label',(next?'Dejar de guardar':'Guardar')+' artista '+tracks[i].artist);button.title=next?'Artista guardado':'Guardar artista';});toast(next?'Artista guardado en Tus artistas.':'Artista eliminado de Tus artistas.');return;}
  const social=e.target.closest('[data-artist-social]');if(social)toast('El enlace oficial de '+social.dataset.artistSocial+' de '+tracks[Number(social.dataset.artist)].artist+' todavía no está vinculado.');
 };

 let toggle=container.previousElementSibling;
 if(!toggle?.classList.contains('artist-view-switch')){
  toggle=document.createElement('div');toggle.className='artist-view-switch';toggle.setAttribute('role','group');toggle.setAttribute('aria-label','Vista de artistas');
  toggle.innerHTML='<button type="button" data-artist-layout="list"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>Lista</button><button type="button" data-artist-layout="grid"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>Cuadrícula</button>';
  container.before(toggle);
 }
 function paint(){container.dataset.view=artistCollectionView;toggle.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.artistLayout===artistCollectionView)));}
 toggle.onclick=e=>{const button=e.target.closest('[data-artist-layout]');if(!button)return;artistCollectionView=button.dataset.artistLayout;try{localStorage.setItem('noodo-artist-view',artistCollectionView);}catch{}paint();};paint();
}
window.noodoArtistCollection={mount:mountArtistCollection,renderCard:renderArtistCard};
function openGenreArtists(key){if(!genreNames[key])return;$('#genre-artists-title').textContent='Artistas · '+genreNames[key];const profiles=[...new Set(tracks.filter(t=>t.genre===key||t.genres?.includes(key)).map(t=>artistProfileIndex(tracks.indexOf(t))))];mountArtistCollection($('#genre-artists-grid'),profiles);window.noodoWorkspace.showPanel($('#genre-artists'));}

$('#browse-genres').addEventListener('click',openGenres);
$('#genre-directory-grid').onclick=e=>{const b=e.target.closest('[data-open-genre]');if(b)openGenreArtists(b.dataset.openGenre);};
$('#genres-back').onclick=()=>window.noodoWorkspace.closePanel();$('#genre-artists-back').onclick=()=>window.noodoWorkspace.closePanel();
window.noodoGenres={open:openGenres,artists:openGenreArtists};
$('#top-queue').addEventListener('click',()=>window.noodoWorkspace.showPanel($('#queue-dialog')));
function playSelection(mix=false){const ids=tracks.map((t,i)=>({t,i})).filter(({t,i})=>t.kind==='track'&&matches(t,i)).map(({i})=>i);window.noodoPlayer.playQueue(ids,mix);}
$('#play-selection').addEventListener('click',()=>playSelection());
$('#shuffle-selection').addEventListener('click',()=>playSelection(true));
function accountPreview(title,copy){$('#account-title').textContent=title;$('#account-copy').textContent=copy;window.noodoWorkspace.showPanel($('#account-dialog'));}
$('#notifications').addEventListener('click',()=>accountPreview('Notificaciones','No tienes notificaciones nuevas.'));
$('#profile').addEventListener('click',()=>accountPreview('Tu perfil','No has iniciado sesión.'));
$('#close-account').addEventListener('click',()=>window.noodoWorkspace.closePanel());

// Original illustrative lyrics; these do not represent released songs.
const lyricSamples={...originalLyrics,
 0:['Se abre la noche sobre el río,','las luces vuelven a encender.','Cada ventana guarda un ritmo,','cada paso nos hace volver.','Nos encontramos entre luces,','la ciudad comienza a responder.'],
 2:['Hoy dejo el ruido en la ventana,','y escucho el aire alrededor.','Hay otra forma de encontrarnos,','un sitio nuevo en la canción.'],
 3:['Tan cerca del ruido,','tan lejos de ayer.','Las calles nos llaman,','volvemos a ver.'],
 4:['Guardo la esquina dentro de mi voz,','cruzo la calle siguiendo el tambor.','Cada palabra dibuja un lugar,','somos historias que quieren sonar.']
};
function paintRowProgress(){const percentage=elapsed/tracks[current].duration*100;$$('[data-row-track]').forEach(el=>{const active=Number(el.dataset.rowTrack)===current;el.classList.toggle('playing',active&&playing);el.style.setProperty('--row-progress',active?percentage+'%':'0%');});}
function renderContext(){const t=tracks[selected];$('#artist-detail-name').textContent=t.artist;$('#artist-detail-image').src=t.image;$('#artist-detail-bio').textContent=t.artist==='Luna Marea'?'Electrónica desde Cali, con voces íntimas, sintetizadores cálidos y raíces del Pacífico. Entre luces abre su universo sonoro.':artistBio(t);$('#artist-detail-genre').textContent=genreNames[t.genre]+' · Cali';$('#event-artist-context').textContent='Contexto de '+t.artist+'. Conciertos y encuentros.';$('#lyrics-title').textContent=t.title;const lines=lyricSamples[selected]||[];$('#lyrics-lines').innerHTML=lines.map((line,i)=>`<button class="lyric-line" data-lyric-time="${Math.floor(i*t.duration/lines.length)}" aria-label="Ir a ${fmt(Math.floor(i*t.duration/lines.length))}: ${line}">${line}</button>`).join('');$('#lyrics-empty').hidden=lines.length>0;$$('#context-view .artist-profile-link,#context-sidebar .artist-profile-link').forEach(link=>link.href='artist.html?artist='+artistProfileIndex(selected));$('#dock-profile').href='artist.html?artist='+artistProfileIndex(current);$('#panel-song [data-current-title]').textContent=t.title;$('#panel-song [data-current-artist]').textContent=t.artist;$('#now-image').src=t.image;$('#now-category').textContent=t.label;$('#now-mood').textContent=t.mood;$('#now-description').textContent=t.description;$('#dock-profile').setAttribute('aria-label','Ver perfil de '+tracks[current].artist);paintLyricsProgress();renderSidebar();}
function paintLyricsProgress(){for(const container of [$('#lyrics-lines'),$('#sidebar-detail')]){const lines=[...container.querySelectorAll('[data-lyric-time]')];let active=-1;lines.forEach((line,i)=>{if(selected===current&&elapsed>=Number(line.dataset.lyricTime))active=i;});lines.forEach((line,i)=>{line.classList.toggle('active',i===active);if(i===active)line.setAttribute('aria-current','true');else line.removeAttribute('aria-current');});}}
let sidebarTab='song';
function sidebarContent(sidebarTab){const t=tracks[selected],profile='artist.html?artist='+artistProfileIndex(selected),name=`<a class="artist-profile-link sidebar-artist-name" href="${profile}">${t.artist}${icon('link')}</a>`;let content='';
 if(sidebarTab==='artist')content=`<img src="${t.image}" alt="${t.artist}">${name}<p class="media-meta">${profileKind(selected)} · ${genreNames[t.genre]} · Cali</p><p>${artistBio(t)}</p>`;
 else if(sidebarTab==='events')content=`${name}<h3>Conciertos</h3><div class="sidebar-events">${concertSamples.map((event,i)=>`<article class="compact-concert"><time datetime="${event.date}"><span>${event.weekday}</span><strong>${event.day}</strong><span>${event.month}</span></time><div class="compact-event-copy"><span class="compact-event-kind">${event.kind}${event.free?' · Gratis':''}</span><strong>${event.title}</strong><p>${event.place} · ${event.time}</p></div><button class="pill primary compact-ticket" data-sidebar-event="${i}" aria-label="${event.free?'Reservar entrada':'Comprar tickets'}: ${event.title}" title="${event.free?'Reservar entrada':'Comprar tickets'}">${icon('ticket')}</button></article>`).join('')}</div>`;
 else if(sidebarTab==='lyrics')content=`<h3>${t.title}</h3>${name}<div class="sidebar-lyrics">${(lyricSamples[selected]||[]).map((line,i,lines)=>`<button class="lyric-line" data-lyric-time="${Math.floor(i*t.duration/lines.length)}">${line}</button>`).join('')||'<p>Letra no disponible.</p>'}</div>`;
 else content=`<img src="${t.image}" alt="${t.artist}"><strong>${t.title}</strong>${name}<p>${t.description}</p><button class="text-button" data-sidebar-queue>Ver cola ${icon('queue')}</button>`;
 return content;
}
function renderSidebar(){
 const detail=$('#sidebar-detail'),mobile=matchMedia('(max-width:760px)').matches,t=tracks[selected];
 if(mobile){
  const profile='artist.html?artist='+artistProfileIndex(selected);
  const events=sidebarContent('events').replace(/<a class="artist-profile-link sidebar-artist-name"[\s\S]*?<\/a>/,'');
  const lyrics=sidebarContent('lyrics').replace(/^[\s\S]*?<div class="sidebar-lyrics">/,'<div class="sidebar-lyrics">');
  detail.innerHTML=`<div class="mobile-detail-overview"><img src="${t.image}" alt="${t.artist}"><div><strong>${t.title}</strong><a class="artist-profile-link sidebar-artist-name" href="${profile}">${t.artist}${icon('link')}</a><p class="media-meta">${genreNames[t.genre]} · Cali</p><p>${t.description}</p></div></div><section class="mobile-detail-section"><h3>Sobre el artista</h3><p>${artistBio(t)}</p></section><section class="mobile-detail-section">${events}</section><section class="mobile-detail-section"><h3>Letra</h3>${lyrics}</section><button class="text-button" data-sidebar-queue>Ver cola ${icon('queue')}</button>`;
  detail.setAttribute('role','region');detail.removeAttribute('aria-labelledby');detail.setAttribute('aria-label','Detalle de la canción');
 }else{detail.innerHTML=sidebarContent(sidebarTab);detail.setAttribute('role','tabpanel');detail.removeAttribute('aria-label');detail.setAttribute('aria-labelledby','tab-'+sidebarTab);}
 paintLyricsProgress();
}
matchMedia('(max-width:760px)').addEventListener('change',renderSidebar);

function selectInfo(name,focus=false,navigate=true){sidebarTab=name;$$('[data-info]').forEach(button=>{const active=button.dataset.info===name;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;$('#panel-'+button.dataset.info).hidden=!active;if(active&&focus)button.focus();});renderSidebar();if(navigate)window.noodoWorkspace.setPanel('info',true);}
$('#sidebar-detail').onclick=e=>{const lyric=e.target.closest('[data-lyric-time]');if(lyric){if(selected!==current)start(selected);elapsed=Number(lyric.dataset.lyricTime);paintTransport();}const event=e.target.closest('[data-sidebar-event]');if(event){openConcert(Number(event.dataset.sidebarEvent));}if(e.target.closest('[data-sidebar-queue]'))window.noodoWorkspace.showPanel($('#queue-dialog'));};

$$('[data-info]').forEach((button,i,list)=>{button.addEventListener('click',()=>selectInfo(button.dataset.info));button.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%list.length;else if(e.key==='ArrowLeft')next=(i+list.length-1)%list.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=list.length-1;else return;e.preventDefault();selectInfo(list[next].dataset.info,true);});});
$('#view-lyrics').addEventListener('click',()=>selectInfo('lyrics',true));
$('#lyrics-lines').addEventListener('click',e=>{const line=e.target.closest('[data-lyric-time]');if(line){if(current!==selected){current=selected;playing=false;}elapsed=Number(line.dataset.lyricTime);paintCurrent();}});
$('#library-queue').addEventListener('click',()=>window.noodoWorkspace.showPanel($('#queue-dialog')));$('#library-genres').addEventListener('click',()=>{$('#browse-genres').click();});
function setPanel(name,open){window.noodoWorkspace.setPanel(name,open);}
function selectTrack(i){if(selected===i){window.noodoPlayer.select(i,true);}else{selected=i;renderList();renderContext();}selectInfo('song',false,false);window.noodoWorkspace.setPanel('info',true);}
const requestedTrack=Number(new URLSearchParams(location.search).get('track'));if(Number.isInteger(requestedTrack)&&requestedTrack>=0&&requestedTrack<tracks.length)current=requestedTrack;
try{const prior=JSON.parse(sessionStorage.getItem('noodo-player-session')||'null');if(prior&&Number.isInteger(prior.current)&&tracks[prior.current]){current=prior.current;elapsed=Math.max(0,Math.min(tracks[current].duration,Number(prior.elapsed)||0));playing=prior.playing===true;volume=Math.max(0,Math.min(100,Number(prior.volume)||0));shuffle=prior.shuffle===true;repeat=prior.repeat===true;saved=new Set((prior.saved||[]).filter(i=>Number.isInteger(i)&&tracks[i]));}}catch{}
const routeTrack=new URLSearchParams(location.search).get('track');if(routeTrack!==null&&Number.isInteger(Number(routeTrack))&&tracks[Number(routeTrack)]&&Number(routeTrack)!==current){current=Number(routeTrack);elapsed=0;playing=false;}
function persistPlayer(){try{sessionStorage.setItem('noodo-player-session',JSON.stringify({current,elapsed,playing,volume,shuffle,repeat,saved:[...saved]}));}catch{}}
window.addEventListener('pagehide',persistPlayer);
window.noodoPlayer={playQueue:(ids,mix=false)=>{playbackQueue=[...new Set(ids)].filter(i=>tracks[i]?.kind==='track');if(!playbackQueue.length){playbackQueue=null;return;}if(mix)for(let i=playbackQueue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[playbackQueue[i],playbackQueue[j]]=[playbackQueue[j],playbackQueue[i]];}start(playbackQueue[0]);},pause:()=>{playing=false;paintTransport();renderList();},resume:()=>{playing=true;paintTransport();renderList();},getState:()=>({current,elapsed,playing,volume}),toggleTrack:i=>{if(!tracks[i])return;if(tracks[i].kind==='session'){openSession(i);return;}selected=i;i===current?toggle():start(i);renderContext();},select:(i,play)=>{if(!Number.isInteger(i)||!tracks[i])return;if(tracks[i].kind==='session'){openSession(i);return;}selected=i;if(i!==current){current=i;elapsed=0;}if(play)playing=true;paintCurrent();persistPlayer();},seek:(i,value)=>{if(!tracks[i]||!Number.isFinite(value))return;if(current!==i){current=i;playing=false;}selected=i;elapsed=Math.max(0,Math.min(tracks[i].duration,value));if(elapsed===tracks[i].duration)playing=false;paintCurrent();},setVolume:value=>{if(!Number.isFinite(value))return;volume=Math.max(0,Math.min(100,value));if(volume)lastVolume=volume;paintVolume();},save:persistPlayer};
let supportTrack=0;
function openSupport(i){supportTrack=i;$('#support-artist').textContent=tracks[i].artist+' · '+tracks[i].title;$('#support-result').textContent='';$('#confirm-support').disabled=false;window.noodoWorkspace.showPanel($('#support-dialog'));}
$('#close-support').addEventListener('click',()=>window.noodoWorkspace.closePanel());
$$('[data-amount]').forEach(button=>button.addEventListener('click',()=>{$$('[data-amount]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));$('#support-result').textContent='';$('#confirm-support').disabled=false;}));
$('#confirm-support').addEventListener('click',()=>{$('#support-result').textContent='Pagos no disponibles por el momento.';$('#confirm-support').disabled=true;});
if(tracks[current].kind==='session'){current=audioIndices()[0];elapsed=0;playing=false;}selected=current;paintCurrent();paintVolume();selectInfo('song',false,false);
for(const mode of ['shuffle','repeat'])$('#'+mode).setAttribute('aria-pressed',String(mode==='shuffle'?shuffle:repeat));


$('#context-back').addEventListener('click',()=>window.noodoWorkspace.songs());

// One campaign slot; the same structure supports artist, song, event or advertising destinations.
const promoCampaign={id:'live-patio-01',kind:'session',label:'NOODO Sessions · Live session',title:'Un patio. Muchas formas de sonar.',description:'Pulso de la ciudad: un encuentro entre voces, raíces y nuevas frecuencias.',image:'assets/live-session-v02.png',action:'Ver sesión',href:'listen.html?session=1'};
const promoKey='noodo-dismissed-promo-'+promoCampaign.id;
$('#promo-banner').dataset.kind=promoCampaign.kind;
$('#promo-label').textContent=promoCampaign.label;$('#promo-title').textContent=promoCampaign.title;$('#promo-description').textContent=promoCampaign.description;$('#promo-image').src=promoCampaign.image;$('#promo-action-label').textContent=promoCampaign.action;$('#promo-cta').href=promoCampaign.href;
try{promoDismissed=sessionStorage.getItem(promoKey)==='1';}catch{}
updatePromoVisibility();
$('#dismiss-promo').onclick=()=>{promoDismissed=true;updatePromoVisibility();try{sessionStorage.setItem(promoKey,'1');}catch{}$('#tracks-title').focus({preventScroll:true});};

function updatePromoVisibility(){const home=view==='home'&&filter==='track'&&genre==='all'&&!$('#search-music').value.trim();$('#promo-banner').hidden=promoDismissed||!home;$('#recommended').hidden=!home;$('#featured-session').hidden=!home;$('#editorial-feature').hidden=!home;$('#new-releases').hidden=!home;}

// Shared song row renderer, styles and actions for catalog, queue, albums and playlists.
window.noodoTrackList={mount(element,indices){
 element.classList.add("song-list");
 function render(){const focus=document.activeElement,attrs=['data-track-play','data-track-select','data-save','data-support','data-playlist-add'];const attr=element.contains(focus)?attrs.find(a=>focus.hasAttribute(a)):null,value=attr?focus.getAttribute(attr):null;const focusedRow=focus?.matches('[data-row-track]')&&element.contains(focus)?focus.dataset.rowTrack:null;element.innerHTML=indices.map(i=>row(tracks[i],i)).join('');paintRowProgress();if(attr)element.querySelector('['+attr+'="'+value+'"]')?.focus({preventScroll:true});else if(focusedRow)element.querySelector('[data-row-track="'+focusedRow+'"]')?.focus({preventScroll:true});}
 function keyboard(e){if(e.target.matches('[data-row-track]')&&['Enter',' '].includes(e.key)){e.preventDefault();selectTrack(Number(e.target.dataset.rowTrack));}}
 element.addEventListener('click',listAction);element.addEventListener('keydown',keyboard);window.addEventListener('noodo:catalogchange',render);render();
 return ()=>{element.removeEventListener('click',listAction);element.removeEventListener('keydown',keyboard);window.removeEventListener('noodo:catalogchange',render);};
},preview(i){if(!tracks[i])return;selected=i;renderContext();renderList();},play:i=>start(i)};

// Eight profile cards; each opens the artist in the persistent player shell.
$('#band-slider').innerHTML=recommendedArtists.map(i=>`<a class="band-card" href="artist.html?artist=${i}"><img src="${tracks[i].image}" alt="" loading="lazy"><strong>${tracks[i].artist}</strong></a>`).join('');
const bandSlider=$('#band-slider');function scrollBands(direction){bandSlider.scrollBy({left:direction*bandSlider.clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
$('#bands-prev').onclick=()=>scrollBands(-1);$('#bands-next').onclick=()=>scrollBands(1);
bandSlider.onkeydown=e=>{if(e.target===bandSlider&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();scrollBands(e.key==='ArrowLeft'?-1:1);}};
$('#genre-slider').innerHTML=Object.keys(genreNames).map(genreTile).join('')+'<button class="collection genre-view-all" data-all-genres><strong>Ver todos los géneros</strong><span class="collection-bottom">Explorar catálogo '+icon('arrow')+'</span></button>';
$('#genre-slider').onclick=e=>{if(e.target.closest('[data-all-genres]'))return openGenres();const button=e.target.closest('[data-open-genre]');if(button)openGenreArtists(button.dataset.openGenre);};
// ReleaseCard uses curated prototype covers and the shared playback state.
const releaseSelection=[['Entre luces','entre-luces'],['Cruzar la noche','marea-adentro'],['Raíz eléctrica','raiz-electrica'],['Aire violeta','umbral']].map(([title,cover])=>({index:tracks.findIndex(t=>t.kind==='track'&&t.title===title&&t.artist==='Luna Marea'),cover:'assets/album-'+cover+'-v17.png'})).filter(item=>item.index>=0);
window.noodoReleaseCard={render({index,cover}){const t=tracks[index];return `<button type="button" class="release-card" data-release-track="${index}" aria-label="Reproducir ${t.title}, ${t.artist}"><span class="release-art"><img src="${cover}" alt="" loading="lazy"><span class="release-play">${icon('play')}</span></span><strong>${t.title}</strong><span>${t.artist}</span></button>`;}};
$('#new-release-cards').innerHTML=releaseSelection.map(window.noodoReleaseCard.render).join('');
$('#new-release-cards').onclick=e=>{const button=e.target.closest('[data-release-track]');if(button)window.noodoPlayer.toggleTrack(Number(button.dataset.releaseTrack));};
function paintReleaseCards(){document.querySelectorAll('[data-release-track]').forEach(button=>{const i=Number(button.dataset.releaseTrack),active=i===current&&playing;button.setAttribute('aria-label',(active?'Pausar ':'Reproducir ')+tracks[i].title+', '+tracks[i].artist);button.setAttribute('aria-pressed',String(active));button.querySelector('.release-play').innerHTML=icon(active?'pause':'play');});}
window.addEventListener('noodo:playerchange',paintReleaseCards);paintReleaseCards();
function openConcert(i){window.noodoEvents.open(i);}
