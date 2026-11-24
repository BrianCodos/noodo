const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const ctx={window:{},crypto:require('node:crypto').webcrypto,URL,location:{href:'http://127.0.0.1:4174/event.html'},document:{addEventListener(){}}};
vm.createContext(ctx);
for(const name of ['music-data.js','event-data.js','vendor/qrcode.js','event-identity.js','checkout-model.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx);
const I=ctx.window.noodoEventIdentity,M=ctx.window.noodoCheckoutModel,e=I.find('ND-R26-001');
test('all event codes and QR destinations are unique; old event codes still resolve',()=>{
 assert.equal(I.events.length,14);assert.equal(new Set(I.events.map(e=>e.code)).size,14);
 assert.equal(new Set(I.events.map(e=>I.url(e))).size,14);
 assert.equal(new Set(I.events.map(e=>I.qr(I.url(e)))).size,14);
 for(const event of I.events){assert.equal(I.find(event.code),event);assert.ok(fs.existsSync(path.join(root,event.image)));assert.ok(I.qr(I.url(event)).includes('<svg'));}
 assert.equal(I.find('0'),e);assert.equal(I.find('ND-2026-003').name,'NOODO Night');assert.equal(I.find('not-an-event'),undefined);
});
test('quantity, locality and total validation',()=>{
 assert.equal(M.quote(e,{general:2,preferencial:1}).total,130000);
 for(const q of [{},{general:0},{general:7},{general:-1},{general:1.5},{general:'1'},{general:4,preferencial:3},{missing:1}])assert.throws(()=>M.quote(e,q));
 assert.throws(()=>M.createOrder(e,{general:1},'unknown'));
});
test('pending and every unsuccessful payment produce no tickets',()=>{
 for(const status of ['declined','cancelled','error','expired']){const o=M.createOrder(e,{general:2},'pse');assert.equal(o.tickets.length,0);const next=M.transition(o,status,e);assert.equal(next.status,status);assert.equal(next.tickets.length,0);assert.throws(()=>M.transition(next,'approved',e));}
});
test('approval issues one unique ticket per selected locality and cannot replay',()=>{
 const o=M.createOrder(e,{general:2,preferencial:1},'card'),next=M.transition(o,'approved',e);
 assert.equal(next.tickets.length,3);assert.equal(new Set(next.tickets.map(t=>t.id)).size,3);
 assert.equal(next.tickets.filter(t=>t.locality==='General').length,2);
 assert.throws(()=>M.transition(next,'approved',e));assert.equal(o.status,'pending');
 assert.notEqual(M.createOrder(e,{general:1},'card').id,o.id);
});
test('expired, tampered, cross-event and non-demo orders cannot issue admissions',()=>{
 const o=M.createOrder(e,{general:1},'nequi');
 const expired=M.transition({...o,expiresAt:Date.now()-1},'approved',e);assert.equal(expired.status,'expired');assert.equal(expired.tickets.length,0);
 assert.throws(()=>M.transition({...o,total:1},'approved',e));assert.throws(()=>M.transition(o,'approved',I.find('ND-R26-003')));assert.throws(()=>M.transition({...o,demo:false},'approved',e));
});
test('free events skip the payment method and retain distinct demo tickets',()=>{
 const free=I.find('ND-R26-002'),o=M.createOrder(free,{general:2},null),done=M.transition(o,'approved',free);
 assert.equal(o.total,0);assert.equal(o.method,'free');assert.equal(done.tickets.length,2);
});
