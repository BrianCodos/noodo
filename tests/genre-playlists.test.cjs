const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const context=vm.createContext({window:{}});
for(const name of ['music-data.js','genre-playlists.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',name),'utf8'),context);
const catalog=JSON.parse(vm.runInContext('JSON.stringify(tracks)',context));
const genres=JSON.parse(vm.runInContext('JSON.stringify(genreNames)',context));
const collections=key=>JSON.parse(JSON.stringify(context.window.noodoCuratedPlaylists.forGenre(key)));
test('each genre has three distinct NOODO collections containing only its songs',()=>{
 const ids=new Set();
 for(const key of Object.keys(genres)){
  const lists=collections(key);
  assert.equal(lists.length,3);
  assert.equal(new Set(lists.map(p=>p.name)).size,3);
  for(const playlist of lists){
   assert.equal(playlist.owner,'NOODO');assert.ok(!ids.has(playlist.id));ids.add(playlist.id);
   assert.equal(new Set(playlist.tracks).size,playlist.tracks.length);
   for(const id of playlist.tracks){const track=catalog[id];assert.equal(track.kind,'track');assert.ok(track.genre===key||track.genres?.includes(key));}
  }
  if(lists.every(p=>p.tracks.length))assert.equal(new Set(lists.map(p=>[...p.tracks].sort().join(','))).size,3);
 }
});
test('secondary genres include their artists and empty genres do not borrow unrelated songs',()=>{
 assert.ok(collections('jazz').every(p=>p.tracks.length&&p.tracks.every(id=>catalog[id].artist==='Río Lento')));
 assert.ok(collections('salsa').every(p=>p.tracks.length===0));
 assert.deepEqual(collections('unknown'),[]);
});
test('collections are deterministic and cannot mutate the shared catalog',()=>{
 const first=collections('electronic');
 const editable=context.window.noodoCuratedPlaylists.forGenre('electronic');
 editable[0].tracks.push(-1);editable[0].name='Changed';
 assert.deepEqual(collections('electronic'),first);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(tracks)',context)),catalog);
});
