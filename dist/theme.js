/* Shared theme contract for catalogue, player and checkout. No DOM dependency in tests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.noodoTheme=api;api.install(root);}})(typeof window==='undefined'?this:window,function(){
 'use strict';
 const key='noodo-design-system-v03';
 const defaults={primary:'#6F36E1',accent:'#C397F4',background:'#110B1B',secondary:'#291E3B',textPrimary:'#F5F2E9',neutral:'#77747A',radius:16,font:'system'};
 const family='-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
 function normalize(input){const t={...defaults};for(const k of ['primary','accent','background','secondary','textPrimary','neutral'])if(typeof input?.[k]==='string'&&/^#[0-9a-f]{6}$/i.test(input[k]))t[k]=input[k].toUpperCase();if(Number.isInteger(input?.radius)&&input.radius>=0&&input.radius<=28&&input.radius%2===0)t.radius=input.radius;return t;}
 function luminance(hex){const c=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
 function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 function mix(a,b,weight){return '#'+a.slice(1).match(/../g).map((v,i)=>Math.round(parseInt(v,16)*weight+parseInt(b.slice(1+i*2,3+i*2),16)*(1-weight)).toString(16).padStart(2,'0')).join('').toUpperCase();}
 function foreground(bg,t){return contrast(t.textPrimary,bg)>=contrast(t.background,bg)?t.textPrimary:t.background;}
 function variables(input){const t=normalize(input),v={};for(const k of ['primary','accent','background','secondary','textPrimary','neutral'])v['--noodo-'+k]=t[k];
 Object.assign(v,{'--noodo-surface':t.secondary===defaults.secondary&&t.background===defaults.background?'#1C1429':mix(t.secondary,t.background,.55),'--noodo-player-background':t.background===defaults.background?'#09060F':mix(t.background,'#000000',.55),'--noodo-text-secondary':t.textPrimary===defaults.textPrimary&&t.background===defaults.background?'#BCB7C2':mix(t.textPrimary,t.background,.75),'--noodo-on-action':foreground(t.primary,t),'--noodo-on-soft':foreground(t.accent,t),'--noodo-focus':t.accent,'--noodo-border-control':mix(t.accent,t.textPrimary,.6),'--noodo-border-subtle':mix(t.accent,t.background,.25),'--noodo-radius-card':t.radius+'px','--noodo-radius-field':t.radius*.5+'px','--noodo-radius-panel':t.radius*1.5+'px','--radius-card':t.radius+'px','--radius-compact':t.radius*.75+'px','--radius-field':t.radius*.5+'px','--radius-panel':t.radius*1.5+'px','--catalog-card-radius':t.radius+'px','--radius':t.radius+'px','--font-family-ui':family,'--font':family});return v;}
 function toCSS(input){return ':root{\n'+Object.entries(variables(input)).map(([k,v])=>'  '+k+': '+v+';').join('\n')+'\n}\n';}
 function apply(input,doc){if(!doc)return;const v=variables(input);for(const [k,value] of Object.entries(v))doc.documentElement.style.setProperty(k,value);}
 function install(win){function refresh(){let tokens;try{tokens=JSON.parse(win.localStorage.getItem(key)||'null')?.tokens;}catch{}apply(tokens,win.document);}refresh();win.addEventListener('storage',e=>{if(e.key===key||e.key===null)refresh();});win.addEventListener('noodo:themechange',e=>apply(e.detail,win.document));}
 return {key,defaults,normalize,variables,toCSS,contrast,apply,install};
});
