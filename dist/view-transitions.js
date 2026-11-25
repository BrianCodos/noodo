'use strict';
/* One entrance controller for pages and panels. Playback stays outside it. */
window.noodoViewTransitions={create(center){
 const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)');
 const skeleton=document.createElement('div');
 skeleton.className='view-loading';skeleton.hidden=true;skeleton.setAttribute('role','status');
 skeleton.innerHTML='<span class="view-loading-label">Cargando sección…</span><div class="view-skeleton" aria-hidden="true"><div class="view-skeleton-line view-skeleton-title"></div><div class="view-skeleton-hero"><div class="view-skeleton-art"></div><div class="view-skeleton-copy"><div class="view-skeleton-line view-skeleton-title"></div><div class="view-skeleton-line"></div><div class="view-skeleton-line"></div><div class="view-skeleton-line view-skeleton-short"></div></div></div><div class="view-skeleton-row"></div><div class="view-skeleton-row"></div><div class="view-skeleton-row"></div></div>';
 center.append(skeleton);
 let entrance=null,loading=false;
 function cancelEntrance(){entrance?.cancel();entrance=null;}
 function resetScroll(target){
  window.scrollTo({top:0,left:0,behavior:'instant'});center.scrollTop=0;
  if(target)target.scrollTop=0;
 }
 function clearLoading(){loading=false;skeleton.hidden=true;center.classList.remove('is-view-loading');center.removeAttribute('aria-busy');}
 function enter(target,{reset=true,focus=true}={}){
  cancelEntrance();clearLoading();
  if(!target||target.hidden)return;
  if(reset)resetScroll(target);
  if(focus)center.focus({preventScroll:true});
  if(reducedMotion.matches||!target.animate)return;
  const style=getComputedStyle(center),duration=parseFloat(style.getPropertyValue('--motion-view-duration'))||260;
  const distance=style.getPropertyValue('--motion-view-distance').trim()||'6px';
  const easing=style.getPropertyValue('--motion-view-easing').trim()||'ease-out';
  const animation=target.animate([{opacity:0,transform:'translateY('+distance+')'},{opacity:1,transform:'translateY(0)'}],{duration,easing});
  entrance=animation;
  animation.onfinish=()=>{if(entrance===animation)entrance=null;};
 }
 function beginLoading(){
  cancelEntrance();loading=true;center.setAttribute('aria-busy','true');center.classList.add('is-view-loading');
  skeleton.hidden=false;resetScroll();center.focus({preventScroll:true});
 }
 reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)cancelEntrance();});
 return {enter,beginLoading,clearLoading,get loading(){return loading;}};
}};
