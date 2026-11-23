/* Relocate the existing player, retaining a single playback state and control IDs. */
(() => {
 const dock=document.querySelector('.player-dock'),center=document.getElementById('center-stage');
 const anchor=document.createComment('Default bottom player position');dock.before(anchor);
 const sidebar=document.createElement('aside');sidebar.id='section-player-sidebar';sidebar.setAttribute('aria-label','Reproductor de música');sidebar.hidden=true;center.after(sidebar);
 let previous=false;
 function update(){const community=document.getElementById('community-page'),radar=document.getElementById('radar-view');const active=Boolean(community&&!community.hidden&&!community.closest('[hidden]')||radar&&!radar.hidden&&!radar.closest('[hidden]'));
 if(active===previous)return;previous=active;document.body.classList.toggle('section-player-mode',active);sidebar.hidden=!active;if(active)sidebar.append(dock);else anchor.after(dock);window.dispatchEvent(new Event('resize'));}
 new MutationObserver(update).observe(center,{subtree:true,attributes:true,attributeFilter:['hidden'],childList:true});update();
})();
