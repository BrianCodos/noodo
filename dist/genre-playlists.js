'use strict';
/* NOODO editorial collections use catalog IDs and never modify personal playlists. */
(()=>{
 const titles={
  electronic:['Pulso electrónico','Órbita nocturna','Frecuencias abiertas'],
  pacific:['Raíz del Pacífico','Marimba y ciudad','Voces del litoral'],
  indie:['Fuera del centro','Guitarras de cerca','Rutas independientes'],
  hiphop:['Voces del asfalto','Rimas de esquina','La ciudad responde'],
  tropical:['Patio tropical','Ritmos del río','Tarde de encuentro'],
  experimental:['Otras frecuencias','Paisajes del aire','Sin mapa'],
  rock:['Ciudad amplificada','Guitarras al frente','Después del ruido'],
  pop:['Pop de azotea','Días de neón','Canciones para volver'],
  metal:['Pulso de acero','Bajo el concreto','Volumen abierto'],
  jazz:['Jazz junto al río','Conversaciones sin prisa','Sesión de medianoche'],
  soul:['Alma de la ciudad','A media luz','Voces que abrazan'],
  salsa:['Clave de Cali','Encuentro salsero','La pista nos llama']
 };
 function forGenre(key){
  if(!Object.hasOwn(titles,key))return [];
  const artists=new Map();
  tracks.forEach((track,id)=>{
   if(track.kind!=='track'||!(track.genre===key||track.genres?.includes(key)))return;
   if(!artists.has(track.artist))artists.set(track.artist,[]);
   artists.get(track.artist).push(id);
  });
  const groups=[...artists.values()],ordered=[];
  for(let row=0;groups.some(group=>row<group.length);row++)for(const group of groups)if(row<group.length)ordered.push(group[row]);
  const size=Math.min(8,ordered.length,Math.max(3,Math.ceil(ordered.length*.65)));
  return titles[key].map((name,edition)=>{
   const start=Math.floor(edition*ordered.length/3);
   return {id:'noodo-'+key+'-'+(edition+1),name,owner:'NOODO',genre:key,edition,
    description:['Una puerta de entrada a los sonidos de '+genreNames[key]+'.','Otra selección para descubrir las voces de '+genreNames[key]+'.','Sigue explorando la escena de '+genreNames[key]+' con NOODO.'][edition],
    tracks:[...ordered.slice(start),...ordered.slice(0,start)].slice(0,size)};
  });
 }
 window.noodoCuratedPlaylists={forGenre};
})();
