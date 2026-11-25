const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../dist/view-transitions.js'),'utf8');
function setup(reduced=false){
 let now=0,timerId=0;const timers=new Map();
 function advance(ms){now+=ms;for(const [id,timer] of [...timers])if(timer.at<=now){timers.delete(id);timer.fn();}}
 const preference={matches:reduced,addEventListener(_,fn){this.change=fn;}},scrolls=[],animations=[];
 const node=()=>({hidden:false,scrollTop:600,children:[],attributes:new Map(),classList:{values:new Set(),add(v){this.values.add(v);},remove(v){this.values.delete(v);}},append(child){this.children.push(child);},setAttribute(k,v){this.attributes.set(k,v);},removeAttribute(k){this.attributes.delete(k);},focus(options){this.focused=options;},animate(frames,options){const animation={frames,options,canceled:false,cancel(){this.canceled=true;}};animations.push(animation);return animation;}});
 const context={performance:{now:()=>now},setTimeout(fn,ms){const id=++timerId;timers.set(id,{fn,at:now+ms});return id;},clearTimeout(id){timers.delete(id);},window:{scrollTo:options=>scrolls.push(options)},document:{createElement:node},matchMedia:()=>preference,getComputedStyle:()=>({getPropertyValue:key=>({'--motion-view-duration':'320ms','--motion-skeleton-min-duration':'160ms','--motion-view-distance':'6px','--motion-view-easing':'ease-out'}[key]||'')})};
 vm.createContext(context);vm.runInContext(source,context);
 const center=node(),target=node(),controller=context.window.noodoViewTransitions.create(center);
 return {controller,center,target,preference,scrolls,animations,advance,timers};
}
test('a new section starts at the top and receives a subtle entrance',()=>{
 const s=setup();s.controller.enter(s.target);
 assert.equal(s.scrolls.at(-1).top,0);assert.equal(s.scrolls.at(-1).behavior,'instant');
 assert.equal(s.center.scrollTop,0);assert.equal(s.target.scrollTop,0);assert.equal(s.center.focused.preventScroll,true);
 assert.equal(s.animations[0].options.duration,320);assert.equal(s.animations[0].frames[0].opacity,0);assert.equal(s.animations[0].frames[1].opacity,1);
});
test('rapid section changes cancel the previous entrance without canceling the new one',()=>{
 const s=setup();s.controller.enter(s.target);const first=s.animations[0];
 s.controller.enter(s.target);const second=s.animations[1];first.onfinish();
 assert.equal(first.canceled,true);assert.equal(second.canceled,false);
 s.controller.beginLoading();assert.equal(second.canceled,true);
});
test('loading is announced and the skeleton always clears on the next destination',()=>{
 const s=setup(),skeleton=s.center.children[0];s.controller.beginLoading();
 assert.equal(s.controller.loading,true);assert.equal(s.center.attributes.get('aria-busy'),'true');assert.equal(skeleton.hidden,false);
 s.controller.enter(s.target);
 assert.equal(s.controller.loading,false);assert.equal(skeleton.hidden,true);assert.equal(s.center.attributes.has('aria-busy'),false);assert.equal(s.center.classList.values.has('is-view-loading'),false);
});
test('reduced motion keeps the scroll reset without an entrance animation',()=>{
 const s=setup(true);s.controller.enter(s.target);assert.equal(s.animations.length,0);assert.equal(s.scrolls.at(-1).top,0);
});
test('changing the motion preference stops an in-flight entrance',()=>{
 const s=setup();s.controller.enter(s.target);s.preference.matches=true;s.preference.change();assert.equal(s.animations[0].canceled,true);
});
test('returning to an existing view can preserve its scroll and keyboard focus',()=>{
 const s=setup();s.controller.enter(s.target,{reset:false,focus:false});assert.equal(s.scrolls.length,0);assert.equal(s.target.scrollTop,600);assert.equal(s.center.focused,undefined);assert.equal(s.animations.length,1);
});
test('a fast load keeps the skeleton visible only for its remaining minimum duration',async()=>{
 const s=setup();s.controller.beginLoading();s.advance(30);const done=s.controller.finishLoading();
 s.advance(129);assert.equal(s.controller.loading,true);assert.equal(s.center.children[0].hidden,false);
 s.advance(1);await done;assert.equal(s.controller.loading,false);assert.equal(s.center.attributes.has('aria-busy'),false);
});
test('a slower load is revealed immediately without an additional delay',async()=>{
 const s=setup();s.controller.beginLoading();s.advance(250);await s.controller.finishLoading();
 assert.equal(s.controller.loading,false);assert.equal(s.timers.size,0);
});
test('canceling a pending reveal cannot clear the next section skeleton',async()=>{
 const s=setup();s.controller.beginLoading();const first=s.controller.finishLoading();s.advance(40);
 s.controller.clearLoading();await first;s.controller.beginLoading();const next=s.controller.finishLoading();
 s.advance(120);assert.equal(s.controller.loading,true);
 s.advance(40);await next;assert.equal(s.controller.loading,false);
});
test('reduced motion skips the minimum hold and releases an existing reveal timer',async()=>{
 const s=setup();s.controller.beginLoading();const done=s.controller.finishLoading();
 s.preference.matches=true;s.preference.change();await done;assert.equal(s.timers.size,0);assert.equal(s.controller.loading,false);
 s.controller.beginLoading();await s.controller.finishLoading();assert.equal(s.controller.loading,false);assert.equal(s.timers.size,0);
});
