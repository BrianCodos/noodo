/* Reusable sidebar: the original controls and playback state travel with the view. */
(() => {
 const dock=document.querySelector('.player-dock'),center=document.getElementById('center-stage');
 if(!dock||!center)return;
 const anchor=document.createComment('Default bottom player position');dock.before(anchor);
 const svg=body=>`<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
 const panelIcon=svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16m-6-11 3 3-3 3"/>');
 const playIcon=svg('<path d="m8 5 11 7-11 7Z"/>'),pauseIcon=svg('<path d="M8 5v14M16 5v14"/>');
 const sidebar=document.createElement('aside');sidebar.id='section-player-sidebar';sidebar.setAttribute('aria-label','Reproductor de música');sidebar.hidden=true;
 sidebar.innerHTML=`<div class="section-player-heading"><h2>Reproductor</h2><button type="button" class="icon-button" id="section-player-toggle" aria-controls="section-player-body">${panelIcon}</button></div><button type="button" class="icon-button section-player-mini-play" aria-label="Reproducir" hidden>${playIcon}</button><div id="section-player-body"><section class="section-player-queue" aria-labelledby="section-player-queue-title"><div class="section-queue-heading"><h3 id="section-player-queue-title">Cola de reproducción</h3><span class="section-queue-count"></span></div><div class="section-queue-list" tabindex="-1" role="group" aria-label="Canciones en la cola"></div></section></div>`;
 center.after(sidebar);
 const body=sidebar.querySelector('#section-player-body'),toggle=sidebar.querySelector('#section-player-toggle'),mini=sidebar.querySelector('.section-player-mini-play'),list=sidebar.querySelector('.section-queue-list');
 const desktop=matchMedia('(min-width:761px)');
 let active=false,collapsed=false,queueSignature='',disposeQueue=null;
 try{collapsed=localStorage.getItem('noodo-section-player-collapsed')==='true';}catch{}
 const dockTools=dock.querySelector('.dock-tools'),mute=document.getElementById('mute'),volume=document.getElementById('volume');
 const volumeControl=document.createElement('div');volumeControl.className='section-volume';volumeControl.hidden=true;
 volumeControl.innerHTML=`<button type="button" class="icon-button" aria-label="Abrir volumen" aria-expanded="false" aria-controls="section-volume-panel">${mute.innerHTML}</button><div id="section-volume-panel" class="section-volume-panel" role="group" aria-label="Control de volumen" hidden></div>`;
 dock.querySelector('.dock-center').append(volumeControl);
 const volumeToggle=volumeControl.querySelector('button'),volumePanel=volumeControl.querySelector('.section-volume-panel');
 function closeVolume(){volumePanel.hidden=true;volumeToggle.setAttribute('aria-expanded','false');volumeToggle.setAttribute('aria-label','Abrir volumen');}
 volumeToggle.onclick=()=>{const open=volumePanel.hidden;volumePanel.hidden=!open;volumeToggle.setAttribute('aria-expanded',String(open));volumeToggle.setAttribute('aria-label',open?'Cerrar volumen':'Abrir volumen');if(open)volume.focus();};
 document.addEventListener('click',event=>{if(!volumeControl.contains(event.target))closeVolume();});
 function setCollapsed(value){
  closeVolume();collapsed=Boolean(value);document.body.classList.toggle('section-player-collapsed',active&&collapsed);
  toggle.setAttribute('aria-expanded',String(!collapsed));toggle.setAttribute('aria-label',collapsed?'Abrir reproductor':'Plegar reproductor');toggle.title=toggle.getAttribute('aria-label');
  body.inert=collapsed;body.setAttribute('aria-hidden',String(collapsed));mini.hidden=!collapsed;
  try{localStorage.setItem('noodo-section-player-collapsed',String(collapsed));}catch{}
 }
 function renderQueue(){
  if(!active||!window.noodoPlayer)return;
  const state=window.noodoPlayer.getState(),queue=window.noodoPlayer.getQueue();
  mini.innerHTML=state.playing?pauseIcon:playIcon;mini.setAttribute('aria-label',state.playing?'Pausar':'Reproducir');mini.title=mini.getAttribute('aria-label');
  volumeToggle.innerHTML=document.getElementById('mute').innerHTML;
  const ids=queue.map(track=>track.id),signature=JSON.stringify(ids);if(signature===queueSignature)return;queueSignature=signature;
  disposeQueue?.();disposeQueue=window.noodoTrackList.mount(list,ids,{queue:true,compact:true});
  sidebar.querySelector('.section-queue-count').textContent=queue.length;

 }
 function update(){
  const community=document.getElementById('community-page'),radar=document.getElementById('radar-view');
  const next=desktop.matches&&Boolean(community&&!community.hidden&&!community.closest('[hidden]')||radar&&!radar.hidden&&!radar.closest('[hidden]'));
  if(next===active)return;active=next;document.body.classList.toggle('section-player-mode',active);sidebar.hidden=!active;
  if(active){body.prepend(dock);volumePanel.append(mute,volume);volumeControl.hidden=false;queueSignature='';renderQueue();}else{closeVolume();volumeControl.hidden=true;dockTools.append(mute,volume);anchor.after(dock);disposeQueue?.();disposeQueue=null;}
  setCollapsed(collapsed);window.dispatchEvent(new Event('resize'));
 }
 toggle.addEventListener('click',()=>setCollapsed(!collapsed));
 mini.addEventListener('click',()=>window.noodoPlayer.getState().playing?window.noodoPlayer.pause():window.noodoPlayer.resume());

 sidebar.addEventListener('keydown',event=>{if(event.key==='Escape'&&!volumePanel.hidden){event.stopPropagation();closeVolume();volumeToggle.focus();return;}if(event.key==='Escape'&&!collapsed){event.preventDefault();event.stopPropagation();setCollapsed(true);toggle.focus();}});
 document.addEventListener('click',event=>{if(active&&event.target.closest('#queue-toggle,#top-queue')){event.preventDefault();event.stopImmediatePropagation();setCollapsed(false);list.focus({preventScroll:true});}},true);
 window.addEventListener('noodo:playerchange',renderQueue);window.addEventListener('noodo:catalogchange',renderQueue);
 new MutationObserver(update).observe(center,{subtree:true,attributes:true,attributeFilter:['hidden'],childList:true});
 desktop.addEventListener('change',update);
 window.noodoSectionPlayer={open:()=>setCollapsed(false),close:()=>setCollapsed(true)};
 update();
})();
