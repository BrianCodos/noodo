const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../dist'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const context={document:{createElement:()=>({}),head:{appendChild(){}},addEventListener(){}},localStorage:{getItem:()=>null}};vm.createContext(context);
for(const n of ['typography.js','player-rules.js','content.js','player-lab.js'])vm.runInContext(read(n),context);
vm.runInContext(read('app.js').split('const $=')[0],context);
test('published typography and inventory match canonical runtime definitions',()=>{
 const data=JSON.parse(read('noodo-design-system-v0.3.json'));
 assert.deepEqual(data.foundations.typography,JSON.parse(vm.runInContext('JSON.stringify(typographySystem)',context)));
 assert.ok(read('noodo-tokens-v0.3.css').startsWith(vm.runInContext('typographyCSS()',context)));
 assert.deepEqual(data.components.map(c=>c.name),JSON.parse(vm.runInContext('JSON.stringify(componentRows.map(r=>r[0]))',context)));
 assert.equal(new Set(data.components.map(c=>c.name)).size,data.components.length);
});
test('all player entry points load the same shell dependencies',()=>{
 const head=n=>read(n).match(/<head>[\s\S]*?<\/head>/)[0];
 for(const n of ['artist.html','article.html','event.html'])assert.equal(head(n),head('listen.html'),n);
});
test('design imports reject malformed colors and strip unknown token properties',()=>{
 for(const value of ['red','url(example)','<script>','#123',null])assert.throws(()=>vm.runInContext('validateState({tokens:{...defaults,primary:'+JSON.stringify(value)+'}})',context));
 const result=vm.runInContext('validateState({tokens:{...defaults,unexpected:"ignored"}})',context);
 assert.equal(result.tokens.unexpected,undefined);
});
test('workspace bundle stays in sync with its component sources',()=>{
 require('node:child_process').execFileSync(process.execPath,[path.join(__dirname,'../scripts/build-workspace.cjs'),'--check']);
});
test('implemented inventory entries link to real sources and local demonstrations',()=>{
 const data=JSON.parse(read('noodo-design-system-v0.3.json'));
 for(const c of data.components){assert.ok(c.implementation);if(c.implementation.source){assert.ok(fs.existsSync(path.join(root,c.implementation.source)),c.name);assert.ok(fs.existsSync(path.join(root,c.implementation.demo.split('?')[0])),c.name);}}
});
