const {test}=require('node:test'),assert=require('node:assert/strict');
const theme=require('../dist/theme.js');
test('corrupt or hostile saved theme values cannot enter CSS',()=>{
 const input={accent:'url(https://invalid)',radius:NaN,font:'url(font)',background:'#fff',primary:'#123456'};
 const t=theme.normalize(input);assert.equal(t.accent,theme.defaults.accent);assert.equal(t.radius,16);assert.equal(t.font,'system');assert.equal(t.primary,'#123456');assert.deepEqual(theme.normalize(null),theme.defaults);
});
test('theme covers every editable color, radius and typography with semantic foregrounds',()=>{
 const v=theme.variables({...theme.defaults,accent:'#FFFFFF',radius:0});
 assert.equal(v['--radius-card'],'0px');assert.equal(v['--radius-field'],'0px');assert.equal(v['--noodo-on-soft'],theme.defaults.background);
 for(const k of ['primary','accent','background','secondary','textPrimary','neutral'])assert.ok(v['--noodo-'+k]);
 assert.ok(v['--font-family-ui']);assert.ok(theme.contrast(v['--noodo-on-soft'],v['--noodo-accent'])>=4.5);
});
test('storage changes, removal and blocked storage update or restore safe defaults',()=>{
 let saved=JSON.stringify({tokens:{...theme.defaults,radius:24}});const handlers={},vars={};
 const win={localStorage:{getItem:()=>saved},document:{documentElement:{style:{setProperty:(k,v)=>vars[k]=v}}},addEventListener:(type,fn)=>handlers[type]=fn};
 theme.install(win);assert.equal(vars['--radius-card'],'24px');saved=null;handlers.storage({key:theme.key});assert.equal(vars['--radius-card'],'16px');
 saved='{broken';handlers.storage({key:null});assert.equal(vars['--noodo-background'],theme.defaults.background);
 win.localStorage.getItem=()=>{throw Error('blocked')};assert.doesNotThrow(()=>handlers.storage({key:theme.key}));
 handlers['noodo:themechange']({detail:{...theme.defaults,radius:20}});assert.equal(vars['--radius-card'],'20px');
});
test('CSS export is generated from the same values as the live theme',()=>{
 const tokens={...theme.defaults,radius:24,secondary:'#302040'};
 for(const [key,value] of Object.entries(theme.variables(tokens)))assert.ok(theme.toCSS(tokens).includes(key+': '+value+';'));
});
