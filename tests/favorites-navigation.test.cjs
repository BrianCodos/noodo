const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'../dist',file),'utf8');

test('desktop and mobile Me gusta open saved music from every player entry point',async()=>{
 const source=read('listen.js');
 const handler=source.split('\n').find(line=>line.startsWith("$$('[data-view]').forEach"));
 for(const file of ['listen.html','artist.html','article.html','event.html']){
  const html=read(file);
  const desktop=html.match(/<button\b[^>]*data-view="([^"]+)"[^>]*>Me gusta<\/button>/);
  const mobile=html.match(/<button\b[^>]*data-mobile-view="([^"]+)"[^>]*aria-label="Me gusta"/);
  assert.ok(desktop,file+' desktop favorite navigation exists');
  assert.ok(mobile,file+' mobile favorite navigation exists');
  assert.equal(desktop[1],'saved');assert.equal(mobile[1],'saved');
  let click;const calls=[];
  vm.runInNewContext(handler,{$$:()=>[{dataset:{view:desktop[1]},addEventListener:(event,fn)=>{click=fn;}}],window:{noodoWorkspace:{songs:async()=>calls.push('songs')}},setView:value=>calls.push(value)});
  await click();assert.deepEqual(calls,['songs','saved']);
 }
});

test('reading the favorites library does not require the community profile gate',()=>{
 const selector=read('community.js').match(/const protectedSelector='([^']+)'/)[1];
 for(const attribute of ['data-view','data-mobile-view'])for(const value of ['saved','all'])assert.ok(!selector.includes(`[${attribute}="${value}"]`));
 assert.ok(selector.includes('[data-save]'),'mutating favorites retains its existing profile requirement');
});

test('favorites only contain saved songs or sessions, while discovery keeps the full catalog',()=>{
 const source=read('listen.js').split('\n').find(line=>line.startsWith('function matches('));
 const context=vm.createContext({genre:'all',filter:'all',view:'saved',saved:new Set([1,3])});
 vm.runInContext(source,context);
 const tracks=[{kind:'track'},{kind:'track'},{kind:'track'},{kind:'session'}];
 assert.deepEqual(tracks.map((track,i)=>i).filter(i=>context.matches(tracks[i],i)),[1,3]);
 context.saved.clear();assert.equal(tracks.filter(context.matches).length,0);
 context.view='all';assert.equal(tracks.filter(context.matches).length,4);
});
