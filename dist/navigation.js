// Shared disclosure action: interruptible motion, accessible state and persistence.
window.noodoDisclosure={mount({button,panel,section,label,storageKey}){
 let open=true,animation=null;
 try{open=localStorage.getItem(storageKey)!=='collapsed';}catch{}
 function paint(){button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',(open?'Plegar ':'Expandir ')+label);button.title=button.getAttribute('aria-label');panel.inert=!open;section?.classList.toggle('section-collapsed',!open);}
 function setOpen(next,animate=true){
  const height=panel.hidden?0:panel.getBoundingClientRect().height;
  animation?.cancel();animation=null;open=next;
  if(!open&&panel.contains(document.activeElement))button.focus();
  panel.hidden=false;paint();
  const target=open?panel.scrollHeight:0;
  if(animate&&!matchMedia('(prefers-reduced-motion:reduce)').matches&&panel.animate){
   panel.style.overflow='hidden';
   const active=panel.animate([{height:height+'px',opacity:open?0.5:1},{height:target+'px',opacity:open?1:0}],{duration:200,easing:'ease-out'});animation=active;
   active.onfinish=()=>{if(animation!==active)return;panel.hidden=!open;panel.style.overflow='';animation=null;};
  }else{panel.hidden=!open;panel.style.overflow='';}
  try{localStorage.setItem(storageKey,open?'expanded':'collapsed');}catch{}
 }
 button.setAttribute('aria-controls',panel.id);button.onclick=()=>setOpen(!open);setOpen(open,false);
 return {setOpen,destroy(){animation?.cancel();button.onclick=null;panel.hidden=!open;panel.style.overflow='';}};
}};
'use strict';
(()=>{
 const artistView=document.getElementById('artist-view'),listenView=document.getElementById('listen-view'),contextView=document.getElementById('context-view'),details=document.getElementById('center-details');
 const center=document.getElementById('center-stage'),views=[listenView,artistView,contextView];
 const radarView=document.createElement('section');radarView.id='radar-view';radarView.hidden=true;center.append(radarView);views.push(radarView);
 let cleanupArtist=null,fragment=null,routeVersion=0,activePanel=null,returnView=null,returnScroll=0,returnFocus=null;const panelStack=[];const navigationTrail=[];
 const loadFragment=()=>fragment||(fragment=fetch('artist-content.html?v=profile-20').then(r=>{if(!r.ok)throw new Error('No se pudo abrir el perfil');return r.text();}).catch(error=>{fragment=null;throw error;}));
 function updatePanelMode(){document.body.classList.toggle('album-mode',activePanel?.dataset.kind==='Álbum');paintPanels();}
 function closePanel(restore=true){if(!activePanel)return;activePanel.hidden=true;if(restore&&panelStack.length){const previous=panelStack.pop();activePanel=previous.panel;activePanel.hidden=false;updatePanelMode();window.scrollTo({top:previous.scroll,behavior:'instant'});previous.focus?.isConnected&&previous.focus.focus({preventScroll:true});return;}panelStack.length=0;details.hidden=true;activePanel=null;updatePanelMode();if(restore){views.forEach(v=>v.hidden=v!==returnView);window.scrollTo({top:returnScroll,behavior:'instant'});if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});if(location.search.includes('session=')||location.search.includes('event=')){const url=new URL(location.href);url.searchParams.delete('session');url.searchParams.delete('event');history.replaceState({},'',url.pathname+url.search+url.hash);lastRoute=url.pathname+url.search;}}}
 function normalizeBack(container,existing){
  const back=existing||container.querySelector('.unified-back,.center-return,.center-back,[id$="-back"],[id^="close-"],[data-back]')||document.createElement('button');
  back.classList.add('unified-back');if(back.tagName==='BUTTON')back.type='button';
  back.textContent='← Volver';back.setAttribute('aria-label','Volver a la sección anterior');
  if(back.parentElement!==container||container.firstElementChild!==back)container.prepend(back);
  return back;
 }
 function showPanel(panel){
  if(activePanel===panel){normalizeBack(panel);return;}
  if(activePanel)panelStack.push({panel:activePanel,scroll:scrollY,focus:document.activeElement});
  else{returnView=views.find(v=>!v.hidden);returnScroll=scrollY;returnFocus=document.activeElement;}
  if(activePanel)activePanel.hidden=true;
  views.forEach(v=>v.hidden=true);details.hidden=false;panel.hidden=false;activePanel=panel;updatePanelMode();normalizeBack(panel);
  window.scrollTo({top:0,behavior:'instant'});panel.focus({preventScroll:true});closeMobilePanels();
 }
 function showView(view){closePanel(false);views.forEach(v=>v.hidden=v!==view);}
 const mobile=matchMedia('(max-width:760px)');
 let panels={library:true,info:true};try{panels={...panels,...JSON.parse(localStorage.getItem('noodo-workspace-panels')||'{}')};}catch{}
 let mobilePanels={library:false,info:false};
 // Keep navigation available as an icon rail when the library is collapsed.
 const libraryIcons={home:'home',all:'music',session:'play',saved:'heart'};
 document.querySelectorAll('#library-body button').forEach(button=>{
  const label=button.textContent.trim();
  button.setAttribute('aria-label',label);button.title=label;
  for(const node of [...button.childNodes])if(node.nodeType===Node.TEXT_NODE&&node.textContent.trim()){
   const text=document.createElement('span');text.className='library-label';text.textContent=node.textContent;node.replaceWith(text);
  }
  button.dataset.navigation=button.dataset.view||button.id.replace('library-','');
  if(button.dataset.view){const glyph=document.createElement('span');glyph.className='library-icon';glyph.innerHTML=icon(libraryIcons[button.dataset.view]);button.prepend(glyph);}
 });
 // Shared floating label for collapsed library controls, outside sidebar clipping.
 const libraryTooltip=document.createElement('div');libraryTooltip.id='library-tooltip';libraryTooltip.className='library-tooltip';libraryTooltip.setAttribute('role','tooltip');libraryTooltip.hidden=true;document.body.append(libraryTooltip);
 let tooltipOwner=null;
 function hideLibraryTooltip(){if(tooltipOwner)tooltipOwner.removeAttribute('aria-describedby');tooltipOwner=null;libraryTooltip.hidden=true;}
 function showLibraryTooltip(button){
  if(mobile.matches||!document.body.classList.contains('library-collapsed'))return;
  hideLibraryTooltip();tooltipOwner=button;button.removeAttribute('title');libraryTooltip.textContent=button.getAttribute('aria-label')||button.textContent.trim();libraryTooltip.hidden=false;button.setAttribute('aria-describedby','library-tooltip');
  const rect=button.getBoundingClientRect();libraryTooltip.style.left=(rect.right+12)+'px';libraryTooltip.style.top=Math.max(8,Math.min(innerHeight-libraryTooltip.offsetHeight-8,rect.top+(rect.height-libraryTooltip.offsetHeight)/2))+'px';
 }
 document.querySelectorAll('#library-body button,#library-toggle').forEach(button=>{
  button.addEventListener('pointerenter',()=>showLibraryTooltip(button));button.addEventListener('focus',()=>showLibraryTooltip(button));
  button.addEventListener('pointerleave',hideLibraryTooltip);button.addEventListener('blur',hideLibraryTooltip);button.addEventListener('click',hideLibraryTooltip);
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape')hideLibraryTooltip();});window.addEventListener('scroll',hideLibraryTooltip,{passive:true});window.addEventListener('resize',hideLibraryTooltip);
 function paintPanels(){for(const name of ['library','info']){const open=!(name==='info'&&!mobile.matches&&document.body.classList.contains('artist-mode')&&!document.body.classList.contains('album-mode'))&&!!(mobile.matches?mobilePanels[name]:name==='info'?true:panels[name]);document.body.classList.toggle(name+'-collapsed',!open);document.body.classList.toggle(name+'-open',open);const button=document.getElementById(name+'-toggle');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',name==='library'?(open?'Plegar biblioteca':'Abrir biblioteca'):(open?'Cerrar información':'Mostrar información'));button.title=button.getAttribute('aria-label');if(name==='library')document.getElementById('library-body').hidden=mobile.matches&&!open;}const expansion=document.querySelector('.mobile-player-details');if(expansion)expansion.inert=!mobile.matches||!mobilePanels.info;requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));}
 function setPanel(name,open){if(name==='info'&&!mobile.matches){paintPanels();return;}if(mobile.matches){mobilePanels[name]=open;if(open)mobilePanels[name==='library'?'info':'library']=false;}else{panels[name]=open;try{localStorage.setItem('noodo-workspace-panels',JSON.stringify(panels));}catch{}}paintPanels();if(!open)document.getElementById(name+'-toggle').focus({preventScroll:true});}
 function closeMobilePanels(){if(!mobile.matches)return;mobilePanels={library:false,info:false};paintPanels();}
 for(const name of ['library','info']){document.getElementById(name+'-toggle').onclick=()=>setPanel(name,!(mobile.matches?mobilePanels[name]:panels[name]));if(document.getElementById('close-'+name))document.getElementById('close-'+name).onclick=()=>setPanel(name,!(mobile.matches?mobilePanels[name]:panels[name]));}
 mobile.addEventListener('change',()=>{mobilePanels={library:false,info:false};paintPanels();});
 const header=document.querySelector('.player-topbar'),toolbar=document.querySelector('.workspace-tools'),dock=document.querySelector('.player-dock');
 const actions=header.querySelector('.topbar-actions');actions.id='header-options';
 const optionsToggle=document.createElement('button');optionsToggle.type='button';optionsToggle.className='icon-button header-options-toggle';optionsToggle.setAttribute('aria-label','Abrir opciones');optionsToggle.setAttribute('aria-controls',actions.id);optionsToggle.setAttribute('aria-expanded','false');optionsToggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';header.append(optionsToggle);
 for(const button of actions.querySelectorAll('button:not(#info-toggle)')){const label=document.createElement('span');label.className='header-option-label';label.textContent=button.getAttribute('aria-label');button.append(label);}
 function closeOptions(focus=false){header.classList.remove('options-open');optionsToggle.setAttribute('aria-expanded','false');optionsToggle.setAttribute('aria-label','Abrir opciones');if(focus)optionsToggle.focus();}
 optionsToggle.onclick=()=>{const open=!header.classList.contains('options-open');header.classList.toggle('options-open',open);optionsToggle.setAttribute('aria-expanded',String(open));optionsToggle.setAttribute('aria-label',open?'Cerrar opciones':'Abrir opciones');};
 actions.addEventListener('click',e=>{if(e.target.closest('button'))closeOptions();});
 document.addEventListener('click',e=>{if(!actions.contains(e.target)&&!optionsToggle.contains(e.target))closeOptions();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.classList.contains('options-open')){e.preventDefault();e.stopImmediatePropagation();closeOptions(true);}});
 mobile.addEventListener('change',()=>closeOptions());
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
 // Accessible, independently collapsible discovery sections.
 for(const [selector,key,label] of [['.collections','genres','Géneros'],['#recommended','bands','Bandas recomendadas'],['#featured-session','featured-session','Sesión destacada'],['#editorial-feature','editorial','Historias de artistas']]){
  const section=document.querySelector(selector),heading=section.querySelector('.section-heading');
  const body=document.createElement('div');body.id='discovery-'+key;body.className='discovery-section-body';
  [...section.children].filter(child=>child!==heading).forEach(child=>body.append(child));section.append(body);
  const toggle=document.createElement('button');toggle.type='button';toggle.className='icon-button discovery-toggle';
  toggle.setAttribute('aria-controls',body.id);toggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  heading.append(toggle);
  window.noodoDisclosure.mount({button:toggle,panel:body,section,label,storageKey:'noodo-discovery-'+key});
 }
 document.getElementById('top-playlists').onclick=()=>{closeMobilePanels();window.noodoLibrary.open();};
 document.getElementById('library-radar').onclick=()=>navigate('listen.html?section=radar');
 const mobileNav=document.querySelector('.mobile-navigation');
 mobileNav.addEventListener('click',async event=>{
  const button=event.target.closest('[data-mobile-view]');if(!button)return;
  const destination=button.dataset.mobileView;
  closeMobilePanels();
  if(destination==='radar')await navigate('listen.html?section=radar');
  else if(destination==='saved')window.noodoLibrary.open();
  else if(destination==='community')document.getElementById('library-community').click();
  else {await window.noodoWorkspace.songs();setView(destination);}
  center.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
 });
 // Single selection is derived from the visible destination, including sign-in gates.
 function sectionForPanel(panel){
  if(!panel)return null;
  if(panel.dataset.navigation)return panel.dataset.navigation;
  const id=panel.id;
  if(id==='community-page')return 'community';
  if(id.includes('playlist'))return 'saved';
  if(id==='followed-artists')return 'artists';
  if(id.startsWith('genre-'))return 'genres';
  if(id==='queue-dialog')return 'queue';
  if(id==='session-dialog')return 'session';
  if(id==='radar-event-page'||panel.dataset.kind==='RadarEvent')return 'radar';
  return null;
 }
 function syncNavigation(){
  const base=activePanel?returnView:views.find(item=>!item.hidden);
  const current=sectionForPanel(activePanel)||[...panelStack].reverse().map(item=>sectionForPanel(item.panel)).find(Boolean)||(base===radarView?'radar':base===artistView?'artists':base===listenView?view:null);
  document.querySelectorAll('#library-body [data-navigation]').forEach(button=>{
   const selected=button.dataset.navigation===current;
   button.classList.toggle('active',selected);
   button.setAttribute('aria-pressed',String(selected));
   if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
  mobileNav.querySelectorAll('button').forEach(button=>{
   if(button.dataset.mobileView===current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
 }
 window.noodoNavigation={sync:syncNavigation};
 const navigationObserver=new MutationObserver(syncNavigation);
 navigationObserver.observe(center,{attributes:true,attributeFilter:['hidden','data-navigation'],subtree:true,childList:true});
 syncNavigation();
 const shellResize=new ResizeObserver(()=>{if(mobile.matches){const chrome=dock.offsetHeight-expansion.offsetHeight;document.documentElement.style.setProperty('--mobile-player-chrome',chrome+'px');}document.documentElement.style.setProperty('--shell-dock-height',dock.offsetHeight+'px');document.documentElement.style.setProperty('--shell-header-height',header.offsetHeight+'px');document.documentElement.style.setProperty('--shell-top-offset',(header.offsetHeight+toolbar.offsetHeight)+'px');document.documentElement.style.setProperty('--shell-dock-space',(dock.offsetHeight+32+(mobile.matches?mobileNav.offsetHeight:0))+'px');});shellResize.observe(header);shellResize.observe(toolbar);shellResize.observe(dock);shellResize.observe(mobileNav);
 async function renderRoute(url,scroll=true){
  const version=++routeVersion,artistRoute=url.pathname.endsWith('/artist.html');closePanel(false);
  if(artistRoute){
   try{const html=await loadFragment();if(version!==routeVersion)return;cleanupArtist?.();artistView.innerHTML=html;showView(artistView);document.body.classList.add('artist-mode');cleanupArtist=window.mountArtist(artistView);normalizeBack(artistView,artistView.querySelector('.hero-back'));selectInfo(url.hash==='#conciertos'?'events':'artist',false,false);syncNavigation();}
   catch(error){console.error(error);artistView.innerHTML='<section><h1>No pudimos abrir el perfil.</h1><p>La reproducción continúa. <a href="listen.html">Volver a canciones</a></p></section>';showView(artistView);}
  }else{
   cleanupArtist?.();cleanupArtist=null;artistView.innerHTML='';document.body.classList.remove('artist-mode');document.title='NOODO · Escucha la ciudad';
   const i=url.searchParams.get('track');if(i!==null)window.noodoPlayer.select(Number(i),url.searchParams.get('play')==='1');
   const context=url.searchParams.get('context');if(['song','lyrics'].includes(context)){showView(contextView);normalizeBack(contextView);selectInfo(context,false,false);}else{showView(listenView);syncNavigation();}
  }
  if(url.searchParams.get('section')==='radar'){showView(radarView);document.title='Radar · NOODO';syncNavigation();}
  syncNavigation();
  if(url.pathname.endsWith('/article.html'))showPanel(window.noodoEditorial.article(url.searchParams.get('story')||'luna-marea'));
  if(url.pathname.endsWith('/event.html'))showPanel(window.noodoEventPage.render(url.searchParams.get('event')));
  closeMobilePanels();paintPanels();window.dispatchEvent(new Event('resize'));const sessionId=url.searchParams.get('session');if(sessionId!==null&&tracks[Number(sessionId)]?.kind==='session')openSession(Number(sessionId));
  if(url.searchParams.get('section')==='community')window.noodoCommunity.open();
  const eventCode=url.searchParams.get('event');if(eventCode&&!url.pathname.endsWith('/event.html'))window.noodoEvents.openCode(eventCode);
  if(scroll){center.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});const target=url.hash&&document.getElementById(url.hash.slice(1));if(target)target.scrollIntoView({behavior:'instant'});}
 }
 function captureOrigin(){return {href:location.href,scroll:scrollY,musicView:view,panels:[...panelStack.map(item=>item.panel),activePanel].filter(panel=>panel&&panel.id!=='detail-dialog'),baseScroll:returnScroll};}
 async function goBack(){if(activePanel?.id==='playlist-library'&&activePanel.dataset.libraryView==='detail'){window.noodoLibrary.open();return;}if(activePanel?.dataset.kind==='RadarEvent'&&!navigationTrail.length)return navigate('listen.html?section=radar',false);if(['Editorial','RadarEvent'].includes(activePanel?.dataset.kind)){closePanel(false);}else if(activePanel){closePanel();return;}const origin=navigationTrail.pop();if(!origin)return navigate('listen.html',false);window.noodoPlayer.save();const url=new URL(origin.href);history.pushState({},'',url.pathname+url.search+url.hash);lastRoute=url.pathname+url.search;await renderRoute(url,false);if(!url.pathname.endsWith('/artist.html'))setView(origin.musicView);window.scrollTo({top:origin.baseScroll,behavior:'instant'});for(const panel of origin.panels)if(panel.isConnected)showPanel(panel);window.scrollTo({top:origin.scroll,behavior:'instant'});}
 function navigate(href,remember=true){if(remember)navigationTrail.push(captureOrigin());window.noodoPlayer.save();const url=new URL(href,location.href);history.pushState({},'',url.pathname+url.search+url.hash);lastRoute=url.pathname+url.search;return renderRoute(url);}
 window.noodoWorkspace={navigate,showPanel,closePanel,back:goBack,setPanel,songs:()=>{if(location.pathname.endsWith('/listen.html')&&!location.search&&!activePanel&&!listenView.hidden){closeMobilePanels();return;}return navigate('listen.html');},openContext:(name,i)=>{if(name==='artist'||name==='events')return navigate('artist.html?artist='+artistProfileIndex(i)+(name==='events'?'#conciertos':''));return navigate('listen.html?context='+name);}};
 // All section back controls use one handler before legacy listeners run.
 document.addEventListener('click',e=>{
  const back=e.target.closest('.unified-back');
  if(!back||!center.contains(back)||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();e.stopImmediatePropagation();goBack();
 },true);
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download'))return;
  const url=new URL(a.href,location.href);if(url.origin!==location.origin||!['listen.html','artist.html','article.html','event.html'].some(name=>url.pathname.endsWith('/'+name))||a.getAttribute('href').startsWith('#'))return;
  e.preventDefault();if(a.matches('.hero-back'))goBack();else navigate(url.href);
 });
 document.addEventListener('keydown',e=>{if(e.key!=='Escape'||e.defaultPrevented||document.querySelector('dialog[open]'))return;if(activePanel){e.preventDefault();if(['Editorial','RadarEvent'].includes(activePanel.dataset.kind)||(activePanel.id==='playlist-library'&&activePanel.dataset.libraryView==='detail'))goBack();else closePanel();}else closeMobilePanels();});
 let lastRoute=location.pathname+location.search;
 window.addEventListener('popstate',()=>{const nextRoute=location.pathname+location.search;if(nextRoute===lastRoute&&!activePanel)return;lastRoute=nextRoute;renderRoute(new URL(location.href));});
 paintPanels();renderRoute(new URL(location.href),true);
})();
