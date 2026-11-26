const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'../dist',name),'utf8');

test('Artistas opens the full unique catalog using the shared artist cards',()=>{
 const source=read('experience.js');
 const start=source.indexOf(' function openArtists(){');
 const end=source.indexOf('\n window.noodoLibrary=',start);
 const host={},recommendations={},el={dataset:{},querySelector:selector=>{if(selector==='#artist-recommendations')return recommendations;assert.equal(selector,'#all-artists-grid');return host;}};
 let shown=false,mounted=false,recommended=false,active;
 const context=vm.createContext({
  tracks:[{artist:'Luna'},{artist:'Luna'},{artist:'Bruma'}],
  artistProfileIndex:index=>index===1?0:index,
  panel:(id,title)=>{assert.equal(id,'artist-directory');assert.equal(title,'Artistas');return el;},
  show:(target,html)=>{assert.equal(target,el);assert.ok(html.includes('<h1>Artistas</h1>'));shown=true;},
  window:{noodoRecommendedArtists:{mount:target=>{assert.equal(target,recommendations);recommended=true;}},noodoArtistCollection:{mount:(target,ids)=>{assert.equal(target,host);assert.deepEqual(Array.from(ids),[0,2]);mounted=true;}}},
  activate:value=>{active=value;}
 });
 vm.runInContext(source.slice(start,end)+'\nopenArtists();',context);
 assert.ok(shown&&mounted&&recommended);assert.equal(active,'artists');assert.equal(el.dataset.navigation,'artists');
});

test('artist browsing is public while saving or following still requires a profile',()=>{
 const selector=read('community.js').match(/const protectedSelector='([^']+)'/)[1];
 assert.ok(!selector.includes('#library-artists'));
 assert.ok(selector.includes('[data-artist-save]'));
 assert.ok(selector.includes('[data-follow]'));
 assert.ok(read('experience.js').includes("document.getElementById('library-artists').onclick=openArtists"));
});
