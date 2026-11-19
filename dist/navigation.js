'use strict';
(()=>{
 const artistView=document.getElementById('artist-view'),listenView=document.getElementById('listen-view'),contextView=document.getElementById('context-view'),details=document.getElementById('center-details');
 const center=document.getElementById('center-stage'),views=[listenView,artistView,contextView];
 let cleanupArtist=null,fragment=null,routeVersion=0,activePanel=null,returnView=null,returnScroll=0,returnFocus=null;const panelStack=[];const navigationTrail=[];
 const loadFragment=()=>fragment||(fragment=fetch('artist-content.html?v=profile-20').then(r=>{if(!r.ok)throw new Error('No se pudo abrir el perfil');return r.text();}).catch(error=>{fragment=null;throw error;}));
 function updatePanelMode(){document.body.classList.toggle('album-mode',activePanel?.dataset.kind==='Álbum');paintPanels();}
 function closePanel(restore=true){if(!activePanel)return;activePanel.hidden=true;if(restore&&panelStack.length){const previous=panelStack.pop();activePanel=previous.panel;activePanel.hidden=false;updatePanelMode();window.scrollTo({top:previous.scroll,behavior:'instant'});previous.focus?.isConnected&&previous.focus.focus({preventScroll:true});return;}panelStack.length=0;details.hidden=true;activePanel=null;updatePanelMode();if(restore){views.forEach(v=>v.hidden=v!==returnView);window.scrollTo({top:returnScroll,behavior:'instant'});if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});if(location.search.includes('session=')||location.search.includes('event=')){const url=new URL(location.href);url.searchParams.delete('session');url.searchParams.delete('event');history.replaceState({},'',url.pathname+url.search+url.hash);lastRoute=url.pathname+url.search;}}}
 function showPanel(panel){if(activePanel&&activePanel!==panel)panelStack.push({panel:activePanel,scroll:scrollY,focus:document.activeElement});if(!activePanel){returnView=views.find(v=>!v.hidden);returnScroll=scrollY;returnFocus=document.activeElement;}if(activePanel)activePanel.hidden=true;views.forEach(v=>v.hidden=true);details.hidden=false;panel.hidden=false;activePanel=panel;updatePanelMode();const back=panel.querySelector('.center-return,.center-back,[id$="-back"],[id^="close-"],[data-back]');if(back){back.classList.add('unified-back');if(back.parentElement!==panel)panel.prepend(back);back.textContent='← Volver';back.setAttribute('aria-label','Volver a la vista anterior');}window.scrollTo({top:0,behavior:'instant'});panel.focus({preventScroll:true});closeMobilePanels();}
 function showView(view){closePanel(false);views.forEach(v=>v.hidden=v!==view);}
 const mobile=matchMedia('(max-width:760px)');
 let panels={library:true,info:true};try{panels={...panels,...JSON.parse(localStorage.getItem('noodo-workspace-panels')||'{}')};}catch{}
 let mobilePanels={library:false,info:false};
 function paintPanels(){for(const name of ['library','info']){const open=!(name==='info'&&!mobile.matches&&document.body.classList.contains('artist-mode')&&!document.body.classList.contains('album-mode'))&&!!(mobile.matches?mobilePanels[name]:name==='info'?true:panels[name]);document.body.classList.toggle(name+'-collapsed',!open);document.body.classList.toggle(name+'-open',open);const button=document.getElementById(name+'-toggle');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',name==='library'?(open?'Plegar biblioteca':'Abrir biblioteca'):(open?'Cerrar información':'Mostrar información'));button.title=button.getAttribute('aria-label');if(name==='library')document.getElementById('library-body').hidden=!open;}const expansion=document.querySelector('.mobile-player-details');if(expansion)expansion.inert=!mobile.matches||!mobilePanels.info;requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));}
 function setPanel(name,open){if(name==='info'&&!mobile.matches){paintPanels();return;}if(mobile.matches){mobilePanels[name]=open;if(open)mobilePanels[name==='library'?'info':'library']=false;}else{panels[name]=open;try{localStorage.setItem('noodo-workspace-panels',JSON.stringify(panels));}catch{}}paintPanels();if(!open)document.getElementById(name+'-toggle').focus({preventScroll:true});}
 function closeMobilePanels(){if(!mobile.matches)return;mobilePanels={library:false,info:false};paintPanels();}
 for(const name of ['library','info']){document.getElementById(name+'-toggle').onclick=()=>setPanel(name,!(mobile.matches?mobilePanels[name]:panels[name]));if(document.getElementById('close-'+name))document.getElementById('close-'+name).onclick=()=>setPanel(name,!(mobile.matches?mobilePanels[name]:panels[name]));}
 mobile.addEventListener('change',()=>{mobilePanels={library:false,info:false};paintPanels();});
 const header=document.querySelector('.player-topbar'),toolbar=document.querySelector('.workspace-tools'),dock=document.querySelector('.player-dock');
 const infoToggle=document.getElementById('info-toggle');
 const infoPanel=document.getElementById('context-sidebar');
 const panelHome=document.createComment('Desktop contextual sidebar');infoPanel.before(panelHome);
 const expansion=document.createElement('div');expansion.className='mobile-player-details';expansion.inert=true;dock.append(expansion);
 const infoHome=document.createComment('Desktop information control');
 infoToggle.before(infoHome);
 function placeInfoControl(){
  if(mobile.matches){dock.append(infoToggle);expansion.append(infoPanel);}else{infoHome.after(infoToggle);panelHome.after(infoPanel);}
 }
 placeInfoControl();mobile.addEventListener('change',placeInfoControl);
 infoToggle.onclick=()=>{const opening=!(mobile.matches?mobilePanels.info:panels.info);if(opening&&mobile.matches)selectInfo('artist',false,false);setPanel('info',opening);};
 const infoHeading=document.createElement('div');infoHeading.className='mobile-info-heading';
 infoHeading.innerHTML='<strong>Información de la reproducción</strong><button type="button" class="icon-button" aria-label="Cerrar información del reproductor">'+icon('close')+'</button>';
 infoHeading.querySelector('button').onclick=()=>setPanel('info',false);
 document.getElementById('context-sidebar').prepend(infoHeading);
 // Accessible, independently collapsible discovery sections.
 for(const [selector,key,label] of [['.collections','genres','Géneros'],['#recommended','bands','Bandas recomendadas']]){
  const section=document.querySelector(selector),heading=section.querySelector('.section-heading');
  const body=document.createElement('div');body.id='discovery-'+key;body.className='discovery-section-body';
  [...section.children].filter(child=>child!==heading).forEach(child=>body.append(child));section.append(body);
  const toggle=document.createElement('button');toggle.type='button';toggle.className='icon-button discovery-toggle';
  toggle.setAttribute('aria-controls',body.id);toggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  let collapsed=false;try{collapsed=localStorage.getItem('noodo-discovery-'+key)==='collapsed';}catch{}
  function paint(){body.hidden=collapsed;section.classList.toggle('section-collapsed',collapsed);toggle.setAttribute('aria-expanded',String(!collapsed));toggle.setAttribute('aria-label',(collapsed?'Expandir ':'Plegar ')+label);toggle.title=toggle.getAttribute('aria-label');}
  toggle.onclick=()=>{collapsed=!collapsed;paint();try{localStorage.setItem('noodo-discovery-'+key,collapsed?'collapsed':'expanded');}catch{}};
  heading.append(toggle);paint();
 }
 document.getElementById('top-playlists').onclick=()=>{closeMobilePanels();window.noodoLibrary.open();};
 const mobileNav=document.querySelector('.mobile-navigation');
 mobileNav.addEventListener('click',async event=>{
  const button=event.target.closest('[data-mobile-view]');if(!button)return;
  const destination=button.dataset.mobileView;
  closeMobilePanels();
  if(destination==='saved')window.noodoLibrary.open();
  else if(destination==='community')document.getElementById('library-community').click();
  else {await window.noodoWorkspace.songs();setView(destination);}
  center.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
 });
 function syncMobileNavigation(){
  const panelId=activePanel?.id||'';
  const current=activePanel?(panelId.includes('playlist')?'saved':panelId.includes('community')?'community':null):!listenView.hidden?view:null;
  mobileNav.querySelectorAll('button').forEach(button=>{
   if(button.dataset.mobileView===current)button.setAttribute('aria-current','page');
   else button.removeAttribute('aria-current');
  });
 }
 const mobileNavObserver=new MutationObserver(syncMobileNavigation);
 mobileNavObserver.observe(center,{attributes:true,attributeFilter:['hidden'],subtree:true});
 mobileNavObserver.observe(document.querySelector('.music-views'),{attributes:true,attributeFilter:['aria-pressed'],subtree:true});
 syncMobileNavigation();
 const shellResize=new ResizeObserver(()=>{document.documentElement.style.setProperty('--shell-dock-height',dock.offsetHeight+'px');document.documentElement.style.setProperty('--shell-header-height',header.offsetHeight+'px');document.documentElement.style.setProperty('--shell-top-offset',(header.offsetHeight+toolbar.offsetHeight)+'px');document.documentElement.style.setProperty('--shell-dock-space',(dock.offsetHeight+32+(mobile.matches?mobileNav.offsetHeight:0))+'px');});shellResize.observe(header);shellResize.observe(toolbar);shellResize.observe(dock);shellResize.observe(mobileNav);
 async function renderRoute(url,scroll=true){
  const version=++routeVersion,artistRoute=url.pathname.endsWith('/artist.html');closePanel(false);
  if(artistRoute){
   try{const html=await loadFragment();if(version!==routeVersion)return;cleanupArtist?.();artistView.innerHTML=html;showView(artistView);document.body.classList.add('artist-mode');cleanupArtist=window.mountArtist(artistView);const back=artistView.querySelector('.hero-back');if(back){back.classList.add('unified-back');back.textContent='← Volver';back.setAttribute('aria-label','Volver a la vista anterior');}selectInfo(url.hash==='#conciertos'?'events':'artist',false,false);document.querySelectorAll('[data-view]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});}
   catch(error){console.error(error);artistView.innerHTML='<section><h1>No pudimos abrir el perfil.</h1><p>La reproducción continúa. <a href="listen.html">Volver a canciones</a></p></section>';showView(artistView);}
  }else{
   cleanupArtist?.();cleanupArtist=null;artistView.innerHTML='';document.body.classList.remove('artist-mode');document.title='NOODO · Escucha la ciudad';
   const i=url.searchParams.get('track');if(i!==null)window.noodoPlayer.select(Number(i),url.searchParams.get('play')==='1');
   const context=url.searchParams.get('context');if(['song','lyrics'].includes(context)){showView(contextView);selectInfo(context,false,false);}else{showView(listenView);document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view));});}
  }
  closeMobilePanels();paintPanels();window.dispatchEvent(new Event('resize'));const sessionId=url.searchParams.get('session');if(sessionId!==null&&tracks[Number(sessionId)]?.kind==='session')openSession(Number(sessionId));
  const eventCode=url.searchParams.get('event');if(eventCode)window.noodoEvents.openCode(eventCode);
  if(scroll){center.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});const target=url.hash&&document.getElementById(url.hash.slice(1));if(target)target.scrollIntoView({behavior:'instant'});}
 }
 function captureOrigin(){return {href:location.href,scroll:scrollY,musicView:view,panels:[...panelStack.map(item=>item.panel),activePanel].filter(panel=>panel&&panel.id!=='detail-dialog'),baseScroll:returnScroll};}
 async function goBack(){const origin=navigationTrail.pop();if(!origin)return navigate('listen.html',false);window.noodoPlayer.save();const url=new URL(origin.href);history.pushState({},'',url.pathname+url.search+url.hash);lastRoute=url.pathname+url.search;await renderRoute(url,false);if(!url.pathname.endsWith('/artist.html'))setView(origin.musicView);window.scrollTo({top:origin.baseScroll,behavior:'instant'});for(const panel of origin.panels)if(panel.isConnected)showPanel(panel);window.scrollTo({top:origin.scroll,behavior:'instant'});}
 function navigate(href,remember=true){if(remember)navigationTrail.push(captureOrigin());window.noodoPlayer.save();const url=new URL(href,location.href);history.pushState({},'',url.pathname+url.search+url.hash);lastRoute=url.pathname+url.search;return renderRoute(url);}
 window.noodoWorkspace={navigate,showPanel,closePanel,setPanel,songs:()=>{if(location.pathname.endsWith('/listen.html')&&!location.search&&!activePanel&&!listenView.hidden){closeMobilePanels();return;}return navigate('listen.html');},openContext:(name,i)=>{if(name==='artist'||name==='events')return navigate('artist.html?artist='+artistProfileIndex(i)+(name==='events'?'#conciertos':''));return navigate('listen.html?context='+name);}};
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download'))return;
  const url=new URL(a.href,location.href);if(url.origin!==location.origin||!['listen.html','artist.html'].some(name=>url.pathname.endsWith('/'+name))||a.getAttribute('href').startsWith('#'))return;
  e.preventDefault();if(a.matches('.hero-back'))goBack();else navigate(url.href);
 });
 document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(activePanel){e.preventDefault();closePanel();}else closeMobilePanels();});
 let lastRoute=location.pathname+location.search;
 window.addEventListener('popstate',()=>{const nextRoute=location.pathname+location.search;if(nextRoute===lastRoute&&!activePanel)return;lastRoute=nextRoute;renderRoute(new URL(location.href));});
 paintPanels();renderRoute(new URL(location.href),true);
})();
