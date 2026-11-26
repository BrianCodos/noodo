import {describe,it,expect} from 'vitest';
import {normalizeRich,richFromText,richToHtml,richToText} from './rich-text';
import {emptyDatabase} from '../data/seed';
import {normalizeDatabase,upsert} from '../data/repository';
describe('Descripción enriquecida',()=>{
 it('conserva texto anterior, saltos y caracteres especiales sin interpretarlos como HTML',()=>{
  const text='Alcance <b>literal</b> & música\n\nSegunda línea';const rich=richFromText(text);
  expect(richToText(rich)).toBe(text);expect(richToHtml(rich)).toContain('&lt;b&gt;literal&lt;/b&gt; &amp; música');
 });
 it('rechaza etiquetas y atributos ejecutables al renderizar datos importados',()=>{
  const nodes=[{tag:'script',children:['alert(1)']},{tag:'p',align:'justify; background:url(x)',onclick:'bad',children:[{tag:'img',src:'bad',children:[]},'<img onerror="bad">']},{tag:'mark',style:'bad',children:['Seguro']}];
  expect(richToHtml(nodes)).toBe('<p>&lt;img onerror=&quot;bad&quot;&gt;</p><mark>Seguro</mark>');
 });
 it('conserva formato, texto compatible e historial del proyecto tras normalizar',()=>{
  const rich=normalizeRich([{tag:'p',align:'justify',children:[{tag:'strong',children:['Objetivo']},' y ',{tag:'mark',children:['alcance']}]},{tag:'ul',children:[{tag:'li',children:['Primera entrega']}]}]);
  let db=emptyDatabase();db.projects.push({id:'p',name:'Prueba',client:'NOODO',kind:'Interno',owner:'Brian Cobaleda',status:'En curso',deadline:'',description:'Antes',contactIds:[]});
  db=upsert(db,'projects',{...db.projects[0],description:richToText(rich),descriptionRich:rich},'Alcance actualizado');
  const loaded=normalizeDatabase(JSON.parse(JSON.stringify(db)));expect(loaded.projects[0].descriptionRich).toEqual(rich);expect(loaded.projects[0].description).toBe('Objetivo y alcance\nPrimera entrega');expect(loaded.activity[0].before).toMatchObject({description:'Antes'});
 });
});
