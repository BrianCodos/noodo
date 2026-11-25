const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context=vm.createContext({window:{},URL});
for(const file of ['search-index.js','external-navigation.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',file),'utf8'),context);
const {find}=context.window.noodoSearchIndex;
const entries=[
 {type:'track',title:'A media luz',subtitle:'Río Lento',keywords:'Soul'},
 {type:'artist',title:'Río Lento',subtitle:'Banda · Soul'},
 {type:'event',title:'Vinilos al atardecer',subtitle:'Selectores del Sur · Alameda',code:'ND-R26-008'},
 {type:'playlist',title:'Raíz del Pacífico',subtitle:'NOODO',keywords:'Fusión Pacífico'},
 {type:'session',title:'Pulso de la ciudad',subtitle:'Cimarrón Sonoro'},
 {type:'community',title:'Buscamos guitarrista',subtitle:'Foro',keywords:'Proyecto indie en Cali'}
];
test('unified search ignores accents, case and extra spaces across content types',()=>{
 assert.equal(find(entries,'  RIO   lento ')[0].type,'artist');
 assert.equal(find(entries,'RAIZ PACIFICO')[0].type,'playlist');
 assert.equal(find(entries,'cimarron')[0].type,'session');
 assert.equal(find(entries,'guitarrista cali')[0].type,'community');
});
test('events can be found by zone or public code without losing music results',()=>{
 assert.equal(find(entries,'alameda')[0].title,'Vinilos al atardecer');
 assert.equal(find(entries,'nd-r26-008')[0].type,'event');
 assert.equal(find(entries,'rio lento').length,2);
 assert.equal(find(entries,'unknown').length,0);
 assert.equal(find(entries,'   ').length,0);
});
test('search ranking prefers exact names and never mutates the source catalog',()=>{
 const before=JSON.stringify(entries);
 assert.equal(find(entries,'Río Lento')[0].type,'artist');
 assert.equal(JSON.stringify(entries),before);
});
test('external confirmation accepts only actual HTTPS Google Maps destinations',()=>{
 const {mapsURL}=context.window.noodoExternalNavigation;
 for(const value of ['https://www.google.com/maps/dir/?api=1&destination=3.45,-76.54','https://maps.google.com/?q=Cali'])assert.equal(mapsURL(value),value);
 for(const value of ['javascript:alert(1)','http://www.google.com/maps','https://www.google.com.evil.test/maps','https://www.google.com/search?q=maps','https://www.google.com/maps-malicious','invalid'])assert.equal(mapsURL(value),null);
});
