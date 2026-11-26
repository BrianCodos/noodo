'use strict';
/* One sizing rule for every cover collection. Preview slots respond to actual
   container width, including sidebar changes, without cropping a final card. */
(()=>{
 const stage=document.getElementById('center-stage');
 if(!stage)return;
 const grids=new Map();
 const resize=new ResizeObserver(entries=>entries.forEach(({target})=>layout(target)));
 function layout(grid){
  const width=grid.getBoundingClientRect().width;if(!width)return;
  const style=getComputedStyle(grid),min=parseFloat(style.getPropertyValue('--catalog-card-min'))||180,gap=parseFloat(style.getPropertyValue('--catalog-card-gap'))||16,max=parseInt(style.getPropertyValue('--catalog-card-max-columns'),10)||8;
  const columns=Math.max(2,Math.min(max,Math.floor((width+gap)/(min+gap))));
  if(grid.style.getPropertyValue('--catalog-columns')!==String(columns))grid.style.setProperty('--catalog-columns',columns);
  if(grids.get(grid)?.preview){
   const cards=[...grid.children].filter(card=>!card.hasAttribute('data-catalog-more'));
   const more=grid.querySelector('[data-catalog-more]');
   cards.forEach((card,index)=>{const hidden=index>=columns-1;if(hidden&&card.contains(document.activeElement))more?.focus({preventScroll:true});if(card.hidden!==hidden)card.hidden=hidden;});
  }
 }
 function register(grid,preview=false){
  if(!grid||grids.has(grid))return;
  grids.set(grid,{preview});grid.classList.add('catalog-card-grid');resize.observe(grid);layout(grid);
 }
 function moreTile(label,description,action){
  const button=document.createElement('button');button.type='button';button.className='catalog-more';button.dataset.catalogMore='';button.setAttribute('aria-label',label);
  button.innerHTML='<span class="catalog-more-art"><strong>Ver todas</strong>'+icon('arrow')+'</span><small>'+description+'</small>';
  button.onclick=action;return button;
 }
 function directory(id,title,html,onClick){
  let panel=document.getElementById(id);
  if(!panel){panel=document.createElement('section');panel.id=id;panel.className='central-panel catalog-directory';panel.hidden=true;panel.tabIndex=-1;document.getElementById('center-details').append(panel);}
  panel.setAttribute('aria-label',title);
  panel.innerHTML='<button type="button" class="text-button unified-back">← Volver</button><h1>'+title+'</h1><div class="catalog-card-grid">'+html+'</div>';
  const grid=panel.querySelector('.catalog-card-grid');grid.onclick=onClick||null;register(grid);
  window.noodoWorkspace.showPanel(panel);layout(grid);
 }
 const bandGrid=document.getElementById('band-slider');
 const bandHTML=bandGrid.innerHTML;
 function mountRecommendedGrid(grid){
  grid.innerHTML=bandHTML;grid.setAttribute('aria-label','Bandas recomendadas');
  grid.append(moreTile('Ver todas las bandas','Bandas',()=>directory('all-recommended-artists','Todas las bandas',bandHTML)));
  register(grid,true);
 }
 mountRecommendedGrid(bandGrid);
 window.noodoRecommendedArtists={mount(host){
  host.classList.add('recommended');host.setAttribute('aria-label','Bandas recomendadas');
  host.innerHTML='<div class="section-heading"><h2>Bandas recomendadas</h2></div><div class="band-slider" role="region" aria-label="Bandas recomendadas"></div>';
  mountRecommendedGrid(host.querySelector('.band-slider'));
 }};
 const genreGrid=document.getElementById('genre-slider');
 genreGrid.querySelector('[data-all-genres]')?.remove();
 genreGrid.append(moreTile('Ver todas las categorías musicales','Géneros',()=>window.noodoGenres.open()));
 register(genreGrid,true);
 // Keep the curated releases first, then use the remaining real catalogue entries.
 const featured=new Set(releaseSelection.map(item=>item.index));
 const releases=[...releaseSelection,...tracks.flatMap((track,index)=>track.kind==='track'&&!featured.has(index)?[{index,cover:track.image}]:[])];
 const releaseHTML=releases.map(window.noodoReleaseCard.render).join('');
 const releaseGrid=document.getElementById('new-release-cards');releaseGrid.innerHTML=releaseHTML;
 const releaseAction=e=>{const button=e.target.closest('[data-release-track]');if(button)window.noodoPlayer.toggleTrack(Number(button.dataset.releaseTrack));};
 releaseGrid.append(moreTile('Ver todas las canciones','Canciones',()=>{directory('all-release-cards','Todas las canciones',releaseHTML,releaseAction);paintReleaseCards();}));
 register(releaseGrid,true);paintReleaseCards();
 // Full galleries keep all their items but share the same cover dimensions.
 const fullSelector='.user-playlist-grid,.genre-directory-grid,.album-grid';
 function discover(){
  for(const [grid] of grids)if(!grid.isConnected){resize.unobserve(grid);grids.delete(grid);}
  stage.querySelectorAll(fullSelector).forEach(grid=>register(grid));
 }
 discover();
 let pending=false;
 new MutationObserver(records=>{
  if(!records.some(record=>record.addedNodes.length||record.removedNodes.length)||pending)return;
  pending=true;requestAnimationFrame(()=>{pending=false;discover();});
 }).observe(stage,{childList:true,subtree:true});
})();
