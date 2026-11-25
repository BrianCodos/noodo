
const pc=$fig.getVarCollection('VariableCollectionId:42:2'),sc=$fig.getVarCollection('VariableCollectionId:42:74');
const P={"ivory":"VariableID:42:3","purple":"VariableID:42:4","lavender":"VariableID:42:5","canvas":"VariableID:42:6","player":"VariableID:42:7","surface":"VariableID:42:8","raised":"VariableID:42:9","muted":"VariableID:42:10","neutral":"VariableID:42:11","focus":"VariableID:42:12","border":"VariableID:42:13","control":"VariableID:42:14","success":"VariableID:42:15","warning":"VariableID:42:16","danger":"VariableID:42:17","info":"VariableID:42:18","n0":"VariableID:42:19","n1":"VariableID:42:20","n2":"VariableID:42:21","n4":"VariableID:42:22","n6":"VariableID:42:23","n8":"VariableID:42:24","n12":"VariableID:42:25","n14":"VariableID:42:26","n16":"VariableID:42:27","n18":"VariableID:42:28","n20":"VariableID:42:29","n22":"VariableID:42:30","n24":"VariableID:42:31","n26":"VariableID:42:32","n32":"VariableID:42:33","n40":"VariableID:42:34","n44":"VariableID:42:35","n46":"VariableID:42:36","n48":"VariableID:42:37","n56":"VariableID:42:38","n60":"VariableID:42:39","n64":"VariableID:42:40","n68":"VariableID:42:41","n72":"VariableID:42:42","n80":"VariableID:42:43","n88":"VariableID:42:44","n96":"VariableID:42:45","n120":"VariableID:42:46","n144":"VariableID:42:47","n160":"VariableID:42:48","n176":"VariableID:42:49","n180":"VariableID:42:50","n200":"VariableID:42:51","n210":"VariableID:42:52","n234":"VariableID:42:53","n240":"VariableID:42:54","n272":"VariableID:42:55","n280":"VariableID:42:56","n290":"VariableID:42:57","n320":"VariableID:42:58","n358":"VariableID:42:59","n390":"VariableID:42:60","n440":"VariableID:42:61","n480":"VariableID:42:62","n540":"VariableID:42:63","n640":"VariableID:42:64","n720":"VariableID:42:65","n760":"VariableID:42:66","n768":"VariableID:42:67","n900":"VariableID:42:68","n960":"VariableID:42:69","n1024":"VariableID:42:70","n1440":"VariableID:42:71","n999":"VariableID:42:72","disabled":"VariableID:42:73"},cache={},created={};
const slug=s=>s.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi,'-').replace(/^-|-$/g,'').slice(0,70);
function primitive(num){const k='n'+num;if(P[k])return $fig.getVar(P[k]);if(!cache['p'+num])cache['p'+num]=pc.numVar({name:'dimension/generated-'+String(num).replace('.','-'),values:{Value:num},scopes:[],codeSyntax:{WEB:'var(--noodo-ref-'+String(num).replace('.','-')+')'}});return cache['p'+num];}
function token(name,num,scope){const key=name;if(!cache[key]){cache[key]=sc.numVar({name,values:{Default:primitive(num)},scopes:[scope],codeSyntax:{WEB:'var(--noodo-'+name.replaceAll('/','-')+')'}});created[name]=cache[key];}return cache[key];}
let updated=0;
const nodes=figma.currentPage.query('*').toArray();
function bindNode(n){
 if(!['FRAME','COMPONENT','INSTANCE','RECTANGLE','TEXT'].includes(n.type))return;
 let p=n.parent,root=n.type==='COMPONENT'?n:null,insideInstance=false;
 while(p&&p.type!=='PAGE'){if(p.type==='INSTANCE'){insideInstance=true;break;}if(p.type==='COMPONENT'){root=p;break;}p=p.parent;}
 if(insideInstance||!root)return;
 const family=root.parent?.type==='COMPONENT_SET'?root.parent.name:root.name;
 const mode=root.name.split(',').filter(s=>/Layout=|Kind=/.test(s)).join('-');
 const prefix='component/'+slug(family.replace('NOODO/',''))+'/'+(mode?slug(mode)+'/':'')+slug(n===root?'container':n.name);
 const props={};
 if(n.type==='TEXT')return;
 for(const prop of ['paddingTop','paddingRight','paddingBottom','paddingLeft','itemSpacing','counterAxisSpacing']){
  if(typeof n[prop]==='number'&&!n.boundVariables?.[prop]){const val=n[prop];const role=val===0?'spacing/none':val===4?'spacing/compact':val===8?'spacing/inline':val===12?'spacing/control':val===16?'spacing/card':val===24?'spacing/section':val===32?'spacing/page':null;props[prop]=role?v(role):token(prefix+'/'+slug(prop),val,'GAP');}
 }
 for(const prop of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']){
  if(typeof n[prop]==='number'&&!n.boundVariables?.[prop]){const val=n[prop];const role=val===0?'radius/none':val===8?'radius/control':val===16?'radius/card':val===24?'radius/panel':val===999?'radius/pill':null;props[prop]=role?v(role):token(prefix+'/radius',val,'CORNER_RADIUS');}
 }
 for(const[prop,sizing]of [['width','layoutSizingHorizontal'],['height','layoutSizingVertical']]){
  if(n[sizing]==='FIXED'&&!n.boundVariables?.[prop])props[prop]=token(prefix+'/'+prop,Math.round(n[prop]*100)/100,'WIDTH_HEIGHT');
 }
 if(n.strokes?.length&&typeof n.strokeWeight==='number'&&!n.boundVariables?.strokeWeight)props.strokeWeight=n.strokeWeight===1?v('border/default'):n.strokeWeight===2?v('border/focus'):token(prefix+'/border',n.strokeWeight,'STROKE_FLOAT');
 if(Object.keys(props).length){$fig.get(n.id).set(props);updated++;}
}
for(const n of nodes)bindNode(n);
await $fig.done();return {updated,variables:Object.fromEntries(Object.entries(created).map(([k,h])=>[k,h.id]))};

