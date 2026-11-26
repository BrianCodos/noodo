import {readFileSync,writeFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {designSystemDirectory as directory} from './design-system-path.mjs';
const music=readFileSync(new URL('music-data.js',directory),'utf8');
const data=runInNewContext(music+'\n;({tracks,artistBiographies,genreNames})',{}, {timeout:1000});
const sandbox={window:{}};
runInNewContext(readFileSync(new URL('event-data.js',directory),'utf8'),sandbox,{timeout:1000});
const artists=new Map();
const records=[];
for(const [i,t] of data.tracks.entries()){
 const index=t.profileIndex??i;
 if(!artists.has(t.artist)){artists.set(t.artist,true);records.push({id:`artist-${index}`,kind:'Artista',title:t.artist,text:data.artistBiographies[t.artist]||t.description,subtitle:data.genreNames[t.genre]||t.genre,path:`artist.html?artist=${index}`});}
 records.push({id:`track-${i}`,kind:t.kind==='session'?'Sesión':'Canción',title:t.title,subtitle:t.artist,text:t.description,path:t.kind==='session'?`listen.html?session=${i}`:`listen.html?track=${i}`});
}
for(const e of sandbox.window.noodoRadarEvents)records.push({id:`event-${e.code}`,kind:'Evento',title:e.name,subtitle:e.artist,text:e.description,path:`event.html?event=${e.code}`,date:e.dateISO,time:e.time,place:e.place});
// Editorial module is local source; remove only its mount side effect to export its data.
const editorial=readFileSync(new URL('editorial.js',directory),'utf8').replace("mount(document.getElementById('editorial-feature-card'));",'');
runInNewContext(editorial,sandbox,{timeout:1000});
for(const [slug,e] of Object.entries(sandbox.window.noodoEditorial.stories))records.push({id:`story-${slug}`,kind:'Artículo',title:e.title,subtitle:e.name,text:[e.summary,e.intro,...e.sections.map(s=>s.title+'\n'+s.text)].join('\n\n'),path:`article.html?story=${slug}`});
writeFileSync(new URL('../src/data/catalog.json',import.meta.url),JSON.stringify(records,null,2)+'\n');
console.log(`Catálogo indexado: ${records.length} registros desde las fuentes de noodo.`);
