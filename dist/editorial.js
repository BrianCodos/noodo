'use strict';
// EditorialFeature: data-driven story card and article, sharing the app shell.
window.noodoEditorial=(()=>{
 const stories={
  'luna-marea':{
   artist:0,name:'Luna Marea',category:'Artista recomendado',title:'Luna Marea: escuchar la ciudad después del ruido',
   summary:'Una mirada a las texturas, las pausas y los pequeños detalles que dan forma a su universo electrónico.',
   image:'assets/artist-portrait-v02.png',alt:'Retrato de Luna Marea en el estudio',reading:'3 min de lectura',
   intro:'Hay canciones que no intentan llenar todos los espacios. Prefieren dejar una puerta abierta: una textura que aparece al fondo, un pulso tranquilo, una melodía que tarda en llegar. En el universo de Luna Marea, esa atención al detalle es el punto de partida.',
   sections:[
    {title:'La ciudad como punto de partida',text:'El recorrido propuesto por su catálogo invita a escuchar Cali desde otro lugar. Más allá del movimiento y el volumen, aparecen escenas pequeñas: el regreso a casa, la luz de una ventana, el silencio que queda después de una conversación. La electrónica funciona aquí como un lenguaje para imaginar esos momentos.'},
    {title:'Entre luces y capas de sonido',text:'Entre luces abre la puerta a esta selección. Su pulso nocturno y sus texturas electrónicas sugieren una escucha sin prisa. En lugar de buscar un único instante protagonista, la propuesta pone el acento en cómo conviven las capas: lo que se escucha al frente y lo que se descubre al volver a la canción.'},
    {title:'Un recorrido para escuchar con calma',text:'Cruzar la noche, Aire violeta, De regreso al río y Raíz eléctrica completan el recorrido del perfil. Sus títulos dibujan un mapa de sensaciones y lugares. La invitación es sencilla: empezar por una pista, dejar que avance y regresar a ese detalle que llamó la atención.'},
    {title:'Conocer a quien está detrás',text:'Esta sección de NOODO está pensada para acercarnos a los procesos de los artistas: sus referencias, los espacios donde crean y las preguntas que acompañan cada lanzamiento. Aquí podrán convivir perfiles, conversaciones y diarios de estudio, siempre conectados con la música que escuchamos.'}
   ]
  }
 };
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function card(story,slug){return `<a class="editorial-card" href="article.html?story=${encodeURIComponent(slug)}"><img src="${esc(story.image)}" alt="${esc(story.alt)}" loading="lazy"><div class="editorial-card-copy"><span class="editorial-eyebrow">En primera persona · ${esc(story.reading)}</span><h3>${esc(story.title)}</h3><p>${esc(story.summary)}</p><span class="editorial-read">Leer historia <span aria-hidden="true">↗</span></span></div></a>`;}
 function mount(element,slug='luna-marea'){const story=stories[slug];if(story)element.innerHTML=card(story,slug);}
 function article(slug){
  const story=stories[slug];let panel=document.getElementById('editorial-article');
  if(!panel){panel=document.createElement('article');panel.id='editorial-article';panel.className='central-panel editorial-article';panel.dataset.kind='Editorial';panel.tabIndex=-1;panel.hidden=true;document.getElementById('center-details').append(panel);}
  if(!story){panel.innerHTML='<h1>Historia no disponible</h1><p>Vuelve al inicio para explorar otras historias.</p>';return panel;}
  document.title=story.title+' · NOODO';
  panel.innerHTML=`<header class="editorial-article-header"><span class="editorial-eyebrow">${esc(story.category)} · Perfil editorial</span><h1>${esc(story.title)}</h1><p class="editorial-lead">${esc(story.summary)}</p><p class="editorial-byline">NOODO Editorial · ${esc(story.reading)}</p></header><figure><img src="${esc(story.image)}" alt="${esc(story.alt)}"><figcaption>Muestra editorial del prototipo: artista ficticia y fotografía generada con IA. No es una entrevista real.</figcaption></figure><div class="editorial-prose"><p class="editorial-intro">${esc(story.intro)}</p>${story.sections.map(section=>`<section><h2>${esc(section.title)}</h2><p>${esc(section.text)}</p></section>`).join('')}<aside class="editorial-listen"><h2>Sigue explorando a ${esc(story.name)}</h2><p>Conoce su perfil y escucha las canciones de esta selección.</p><a class="pill primary" href="artist.html?artist=${story.artist}">Conocer al artista</a><button class="pill outline" type="button" data-editorial-play>Escuchar canciones</button></aside></div>`;
  panel.querySelector('[data-editorial-play]').onclick=()=>window.noodoPlayer.playQueue(tracks.map((t,i)=>({t,i})).filter(({t,i})=>t.kind==='track'&&artistProfileIndex(i)===story.artist).map(({i})=>i));
  return panel;
 }
 mount(document.getElementById('editorial-feature-card'));
 return {stories,renderCard:card,mount,article};
})();
