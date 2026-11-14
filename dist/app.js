'use strict';
const storageKey='noodo-design-system-v01';
const allowedFonts={system:'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',arial:'Arial,Helvetica,sans-serif',georgia:'Georgia,"Times New Roman",serif'};
const colorNames={cream:'Crema',lavender:'Lavanda',coal:'Carbón',graphite:'Grafito',fog:'Niebla'};
let state={tokens:{...defaults},notes:{},checks:{}};
let storageAvailable=true;
function validateState(input){
  if(!input||typeof input!=='object'||!input.tokens||typeof input.tokens!=='object')throw new Error('El archivo no contiene tokens del sistema.');
  const tokens={...defaults};
  for(const key of Object.keys(colorNames)){if(typeof input.tokens[key]!=='string'||!/^#[0-9a-f]{6}$/i.test(input.tokens[key]))throw new Error('Hay colores inválidos. Usa un JSON exportado desde este catálogo.');tokens[key]=input.tokens[key].toUpperCase();}
  if(!Number.isInteger(input.tokens.radius)||input.tokens.radius<0||input.tokens.radius>28||input.tokens.radius%2!==0)throw new Error('El radio debe ser un número par entre 0 y 28.');
  if(!Object.hasOwn(allowedFonts,input.tokens.font))throw new Error('La familia de prueba no es válida.');
  tokens.radius=input.tokens.radius;tokens.font=input.tokens.font;
  const notes={},checks={};
  for(const [id] of reviewQuestions){if(input.notes&&Object.hasOwn(input.notes,id)){if(typeof input.notes[id]!=='string'||input.notes[id].length>10000)throw new Error('Una nota es inválida o demasiado larga.');notes[id]=input.notes[id];}}
  for(const id of ['masters','typography','tokens','components','approval'])checks[id]=input.checks?.[id]===true;
  return {tokens,notes,checks};
}
try{const stored=localStorage.getItem(storageKey);if(stored)state=validateState(JSON.parse(stored));}catch(e){storageAvailable=false;}
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
let toastTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),4500);}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));storageAvailable=true;}catch(e){storageAvailable=false;}$('#save-status').textContent=storageAvailable?'Guardado solo en este navegador. Exporta para compartir o conservar una copia.':'No se pudo guardar en este navegador. Exporta el JSON para conservar los cambios.';}
function luminance(hex){const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
function contrastPairs(){const t=state.tokens;return [['Crema / carbón',t.cream,t.coal],['Carbón / lavanda',t.coal,t.lavender],['Texto secundario / superficie','#BCB7C2','#1B1A1D'],['Niebla / grafito',t.fog,t.graphite],['Crema / lavanda',t.cream,t.lavender]];}
function renderContrast(){
  $('#contrast-results').innerHTML=contrastPairs().slice(0,2).map(([name,a,b])=>{const r=ratio(a,b);return `<div class="contrast-result ${r>=4.5?'pass':'fail'}"><span>${name}</span><b>${r.toFixed(2)}:1 · ${r>=4.5?'Pasa':'Revisar'}</b></div>`;}).join('');
  const page=$('#page-contrast');if(page)page.innerHTML=contrastPairs().map(([name,a,b])=>{const r=ratio(a,b);return `<div class="panel"><div style="background:${b};color:${a};padding:20px;border-radius:8px;font-size:22px;margin-bottom:18px">Música y conexiones</div><b>${name} · ${r.toFixed(2)}:1</b><p class="small">${r>=4.5?'Cumple el umbral para texto normal.':r>=3?'Solo alcanza el umbral de texto grande; no usar en texto pequeño.':'No alcanza el umbral para texto normal ni grande. Reservar para decoración.'}</p></div>`;}).join('');
}
function applyTokens(){
  for(const key of Object.keys(colorNames))document.documentElement.style.setProperty('--'+key,state.tokens[key]);
  document.documentElement.style.setProperty('--radius',state.tokens.radius+'px');document.documentElement.style.setProperty('--font',allowedFonts[state.tokens.font]);document.documentElement.style.setProperty('--on-accent',state.tokens.coal);
  $$('#token-controls input').forEach(input=>{input.value=state.tokens[input.dataset.color];input.nextElementSibling.nextElementSibling.textContent=input.value.toUpperCase();});
  $('#radius').value=state.tokens.radius;$('#radius-value').textContent=state.tokens.radius+' px';$('#font-choice').value=state.tokens.font;
  const swatches=$('#swatches');if(swatches)swatches.innerHTML=Object.entries(colorNames).map(([key,name])=>{const bg=state.tokens[key],fg=ratio(bg,'#111111')>ratio(bg,'#F5F2E9')?'#111111':'#F5F2E9';return `<article class="swatch"><div class="swatch-color" style="background:${bg};color:${fg}">${name}</div><div class="swatch-body"><code>${bg}</code><p>${key=== 'fog'?'Uso secundario, revisar contraste.':key==='lavender'?'Acento e interacción.':key==='cream'?'Texto principal.':key==='coal'?'Fondo base.':'Superficie elevada.'}</p></div></article>`;}).join('');
  renderContrast();
}
function snapshot(){return {schemaVersion:'noodo.design-system/0.1',status:'draft',exportedAt:new Date().toISOString(),source:{document:'NOODO_Dossier_Integral_Noviembre_2026.pdf',identityPages:[1,2,3,4,5,6,8,9],notes:'Valores base del dossier; reglas UI propuestas. Eventos propios NOODO; boletería posterior.'},tokens:{...state.tokens},semanticTokens:{background:{canvas:'{coal}',surface:'#1B1A1D',raised:'{graphite}'},text:{primary:'{cream}',secondary:'#BCB7C2',onAction:'{coal}'},action:{primary:'{lavender}'},border:{control:'#817987',subtle:'#3C3941'},feedback:{success:'#91D6AE',warning:'#E7C482',danger:'#F29C9C',info:'#9DC9EC'}},foundations:{spacing:[4,8,12,16,24,32,48,64],radii:{field:8,card:state.tokens.radius,panel:24,pill:999},touchTarget:44,typography:{reference:'PP Neue Montreal (dossier p. 9)',preview:state.tokens.font,status:'Pending official webfont files',scale:{display:{desktop:[64,68],mobile:[40,44],weight:600},title:{desktop:[40,44],mobile:[32,38],weight:600},heading:{size:28,lineHeight:34,weight:600},body:{size:16,lineHeight:26,weight:400},label:{size:14,lineHeight:20,weight:600},caption:{size:12,lineHeight:18,weight:400}}},breakpoints:{mobile:0,tablet:768,desktop:1024},motion:{fast:120,standard:180,surface:240,reducedMotion:'disable nonessential motion'}},components:componentRows.map(([name,family,scope,states,contract,section])=>({name,family,scope,states,contract,section})),notes:{...state.notes},checks:{...state.checks},checklistMeaning:'Personal review only; does not represent joint approval.'};}
function download(name,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportJSON(){download('noodo-design-system-v0.1.json',JSON.stringify(snapshot(),null,2),'application/json');toast('JSON exportado con tokens, inventario y tus notas.');}
function exportCSS(){const t=state.tokens;download('noodo-tokens-v0.1.css',`/* NOODO v0.1 — propuesta en revisión. Fuente: dossier, p. 9. */\n:root {\n${Object.keys(colorNames).map(k=>'  --noodo-'+k+': '+t[k]+';').join('\n')}\n  --noodo-surface: #1B1A1D;\n  --noodo-text-secondary: #BCB7C2;\n  --noodo-border-control: #817987;\n  --noodo-border-subtle: #3C3941;\n  --noodo-success: #91D6AE;\n  --noodo-warning: #E7C482;\n  --noodo-danger: #F29C9C;\n  --noodo-info: #9DC9EC;\n  --noodo-action: var(--noodo-lavender);\n  --noodo-on-action: var(--noodo-coal);\n  --noodo-font-preview: ${allowedFonts[t.font]};\n  --noodo-radius-card: ${t.radius}px;\n  --noodo-radius-field: 8px;\n  --noodo-radius-panel: 24px;\n  --noodo-target: 44px;\n${[4,8,12,16,24,32,48,64].map(n=>'  --noodo-space-'+n+': '+n+'px;').join('\n')}\n  --noodo-motion-fast: 120ms;\n  --noodo-motion-standard: 180ms;\n  --noodo-motion-surface: 240ms;\n}\n/* Validar contraste después de cambiar la paleta. PP Neue Montreal no está incluida. */\n`,'text/css');toast('Tokens CSS exportados.');}
$('#token-controls').innerHTML=Object.entries(colorNames).map(([key,name])=>`<label class="color-control"><input type="color" data-color="${key}" value="${state.tokens[key]}" aria-label="Color ${name}"><span>${name}</span><code>${state.tokens[key]}</code></label>`).join('');
$('#navigation').innerHTML=navItems.map(([id,num,title,group])=>(group?`<div class="nav-group">${group}</div>`:'')+`<a class="nav-link" href="#${id}" data-nav="${id}"><span class="num">${num}</span>${title}</a>`).join('');
function openEditor(){if(!$('#editor').open)$('#editor').showModal();$('#open-editor').setAttribute('aria-expanded','true');}
$('#open-editor').addEventListener('click',openEditor);$('#close-editor').addEventListener('click',()=>$('#editor').close());$('#editor').addEventListener('close',()=>$('#open-editor').setAttribute('aria-expanded','false'));
$('#token-controls').addEventListener('input',e=>{const key=e.target.dataset.color;if(!Object.hasOwn(colorNames,key))return;state.tokens[key]=e.target.value.toUpperCase();applyTokens();save();});
$('#radius').addEventListener('input',e=>{state.tokens.radius=Number(e.target.value);applyTokens();save();});
$('#font-choice').addEventListener('change',e=>{state.tokens.font=e.target.value;applyTokens();save();});
$('#export').addEventListener('click',exportJSON);$('#export-editor').addEventListener('click',exportJSON);$('#export-css').addEventListener('click',exportCSS);
$('#reset').addEventListener('click',()=>{state.tokens={...defaults};applyTokens();save();toast('Ajustes visuales restablecidos; tus notas se conservan.');});
$('#import-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1024*1024)throw new Error('El archivo supera 1 MB.');const input=JSON.parse(await file.text());if(input.schemaVersion!=='noodo.design-system/0.1')throw new Error('Versión de archivo no compatible.');const next=validateState(input);state=next;applyTokens();save();renderPage(false);toast('Ajustes y notas importados.');}catch(error){toast('No se importó el archivo: '+error.message);}finally{e.target.value='';}});
let activePage='overview',pageTimers=[];
function cleanTimers(){for(const id of pageTimers){clearTimeout(id);clearInterval(id);}pageTimers=[];}
function after(ms,fn){const id=setTimeout(fn,ms);pageTimers.push(id);return id;}
function renderInventory(){const body=$('#inventory-body');if(!body)return;const scope=$('#inventory-filter').value;const normalize=s=>s.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');const term=normalize($('#search').value.trim());const aliases={boton:'button',botones:'button',reproductor:'player',artista:'artist',entrada:'ticket',entradas:'ticket',evento:'event',eventos:'event',campo:'field',formulario:'form'};const query=aliases[term]||term;const rows=componentRows.filter(r=>(scope==='all'||r[2]===scope)&&(!term||normalize(r.join(' ')).includes(term)||normalize(r.join(' ')).includes(query)));$('#inventory-count').textContent=`${rows.length} de ${componentRows.length} componentes o familias documentados`;
 body.innerHTML=rows.length?rows.map(([name,family,stage,states,contract,section])=>`<tr><td><a href="#${section}">${name}</a><br><small class="muted">${family}</small></td><td><span class="tag ${stage==='Posterior'?'future':''}">${stage}</span></td><td>${states}</td><td>${contract}</td></tr>`).join(''):'<tr><td colspan="4">No hay componentes que coincidan. Prueba con “artista”, “player”, “evento” o “botón”.</td></tr>';
}
function renderPage(focus=true){
 cleanTimers();const route=location.hash.slice(1);activePage=Object.hasOwn(pages,route)?route:'overview';$('#main').innerHTML=pages[activePage]();$('#breadcrumb').textContent=navItems.find(x=>x[0]===activePage)[2];
 $$('.nav-link').forEach(a=>{if(a.dataset.nav===activePage)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.title=`NOODO · ${$('#breadcrumb').textContent} — Design system`;
 applyTokens();bindPage();if(focus){window.scrollTo(0,0);$('#main').focus({preventScroll:true});}
}
function bindPage(){
 $$('[data-toast]',$('#main')).forEach(b=>b.addEventListener('click',()=>toast(b.dataset.toast)));
 $$('[data-open-editor]').forEach(b=>b.addEventListener('click',openEditor));
 $('#export-review')?.addEventListener('click',exportJSON);
 $$('[data-note]').forEach(el=>{el.value=state.notes[el.dataset.note]||'';el.maxLength=10000;el.addEventListener('input',()=>{state.notes[el.dataset.note]=el.value;save();});});
 $$('[data-check]').forEach(el=>{el.checked=state.checks[el.dataset.check]===true;el.addEventListener('change',()=>{state.checks[el.dataset.check]=el.checked;save();});});
 $('#inventory-filter')?.addEventListener('change',renderInventory);renderInventory();
 $('#sample-form')?.addEventListener('submit',e=>{e.preventDefault();const input=e.currentTarget.elements.project;const valid=input.value.trim().length>0;input.setAttribute('aria-invalid',String(!valid));$('#project-help').textContent=valid?'La muestra está completa. No se enviaron datos.':'Escribe el nombre del proyecto para continuar.';$('#project-help').className=valid?'':'error';if(!valid)input.focus();else toast('Validación correcta. Esta muestra no envía datos.');});
 $$('[data-chip-group] .chip').forEach(btn=>btn.addEventListener('click',()=>{const group=btn.parentElement;$$('.chip',group).forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));group.nextElementSibling.textContent='Selección: '+btn.textContent+' · muestra sin catálogo de artistas';}));
 const tabs=$$('[role=tab]');function activateTab(tab){tabs.forEach(t=>{const yes=t===tab;t.setAttribute('aria-selected',String(yes));t.tabIndex=yes?0:-1;$('#'+t.getAttribute('aria-controls')).hidden=!yes;});}
 tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activateTab(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(index+1)%tabs.length;else if(e.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();activateTab(tabs[next]);tabs[next].focus();});});
 $('#open-demo')?.addEventListener('click',()=>$('#demo-dialog').showModal());
 let pagination=1;$$('[data-page]').forEach(btn=>btn.addEventListener('click',()=>{pagination=Math.max(1,Math.min(3,pagination+(btn.dataset.page==='next'?1:-1)));$('#page-demo').textContent=`Página ${pagination} de 3`;$('[data-page=prev]').disabled=pagination===1;$('[data-page=next]').disabled=pagination===3;}));
 $('#provider-demo')?.addEventListener('click',()=>{const b=$('#provider-demo');b.disabled=true;b.textContent='Cargando muestra…';$('#provider-status').textContent='Simulando la carga del proveedor.';after(900,()=>{b.disabled=false;b.textContent='Reintentar muestra';$('#provider-status').textContent='Estado de ejemplo: proveedor no disponible. En producto se ofrece reintento o enlace oficial de música.';});});
 bindPlayer();
 $('#event-state')?.addEventListener('change',e=>{const map={Anunciado:['info','Consulta la información del encuentro.'],Reprogramado:['warning','Fecha actual por confirmar. Se informará el nuevo horario.'],Cancelado:['error','Este encuentro no se realizará.'],Finalizado:['success','El encuentro ha terminado.']};const [cls,msg]=map[e.target.value];$('#event-state-result').className='notice '+cls;$('#event-state-result').textContent=e.target.value+' · '+msg;});
 let qty=1;function updateQty(){const value='$ '+new Intl.NumberFormat('es-CO').format(qty*50000)+' COP';$('#qty').value=qty;$('#subtotal').textContent=value;$('#total').textContent=value;$('#qty-minus').disabled=qty===1;$('#qty-plus').disabled=qty===4;}
 $('#qty-minus')?.addEventListener('click',()=>{qty=Math.max(1,qty-1);updateQty();});$('#qty-plus')?.addEventListener('click',()=>{qty=Math.min(4,qty+1);updateQty();});
 $('#demo-upload')?.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const valid=['image/png','image/jpeg'].includes(f.type)&&f.size<=5*1024*1024;e.target.setAttribute('aria-invalid',String(!valid));$('#upload-feedback').textContent=valid?'Archivo seleccionado localmente: '+f.name+'. No se ha subido.':'Archivo rechazado: usa PNG o JPG de máximo 5 MB.';$('#upload-feedback').className=valid?'':'error';if(!valid)e.target.value='';});
 $('#retry-demo')?.addEventListener('click',()=>{const b=$('#retry-demo');b.disabled=true;$('#retry-status').textContent='Probando reintento…';after(800,()=>{b.disabled=false;$('#retry-status').textContent='Muestra recuperada. No se hizo ninguna petición a un servidor.';});});
}
function bindPlayer(){if(!$('#player-play'))return;let playing=false,position=0;const play=$('#player-play'),slider=$('#player-progress');function update(){play.innerHTML=icon(playing?'pause':'play');play.setAttribute('aria-label',playing?'Pausar simulación silenciosa':'Iniciar simulación silenciosa');play.setAttribute('aria-pressed',String(playing));slider.value=position;slider.setAttribute('aria-valuetext',`${Math.floor(position/60)} minutos y ${position%60} segundos`);$('#player-time').textContent=`${Math.floor(position/60)}:${String(position%60).padStart(2,'0')}`;}
 play.addEventListener('click',()=>{if(position===180)position=0;playing=!playing;update();});slider.addEventListener('input',()=>{position=Number(slider.value);if(position===180)playing=false;update();});$('#player-restart').addEventListener('click',()=>{position=0;update();});$('#player-end').addEventListener('click',()=>{position=180;playing=false;update();});pageTimers.push(setInterval(()=>{if(playing){position++;if(position>=180){position=180;playing=false;}update();}},1000));update();}
$('#demo-dialog').addEventListener('close',()=>{if($('#demo-dialog').returnValue==='confirm')toast('Acción de muestra confirmada.');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('[role=tooltip]').forEach(el=>{el.style.visibility='hidden';});});document.addEventListener('focusin',()=>$$('[role=tooltip]').forEach(el=>{el.style.visibility='';}));document.addEventListener('pointerover',()=>$$('[role=tooltip]').forEach(el=>{el.style.visibility='';}));
$('#search').addEventListener('input',()=>{if(activePage!=='inventory')location.hash='inventory';else renderInventory();});
$('.skip').addEventListener('click',e=>{e.preventDefault();$('#main').focus();$('#main').scrollIntoView();});
window.addEventListener('hashchange',()=>renderPage());
renderPage(false);applyTokens();save();
