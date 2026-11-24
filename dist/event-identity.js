/* Public event identity and locally generated, standards-compliant QR codes. */
(() => {
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const legacy=typeof concertSamples==='undefined'?[]:concertSamples.map((e,i)=>({
  code:'ND-2026-'+String(i+1).padStart(3,'0'),name:e.title,artist:'NOODO · Música local',category:e.kind,
  dateISO:e.date,date:e.day+' '+e.month.toUpperCase(),day:e.weekday.toUpperCase(),time:e.time,
  place:e.place,organizer:'NOODO',image:e.image,description:e.description,price:e.free?0:45000,currency:'COP',coordinates:[-76.5395,3.4455],
  localities:[{id:'general',name:'General',price:e.free?0:45000,available:84,description:'Acceso general · Sin numeración'},{id:'preferencial',name:'Preferencial',price:e.free?0:75000,available:18,description:'Zona cercana al escenario · Sin numeración'}]
 }));
 const events=[...window.noodoRadarEvents,...legacy];
 function find(key){const value=String(key??'').trim().toUpperCase();return /^\d+$/.test(value)?window.noodoRadarEvents[Number(value)]:events.find(e=>e.code===value);}
 function url(event){return new URL('event.html?event='+encodeURIComponent(event.code),location.href).href;}
 function qr(value,label='Código QR'){
  const code=qrcode(0,'M');code.addData(value);code.make();
  return code.createSvgTag({cellSize:4,margin:16,scalable:true}).replace('<svg ','<svg role="img" aria-label="'+escape(label)+'" ');
 }
 function block(event){return `<section class="event-identity" aria-label="Código y QR del evento"><a class="event-identity-qr" href="${escape(url(event))}" aria-label="Abrir ${escape(event.name)}">${qr(url(event),'QR del evento '+event.code)}</a><div><span>Código del evento</span><strong>${escape(event.code)}</strong><p>Escanea para abrir la página del evento. Este QR no es una boleta de ingreso.</p><button type="button" class="text-button" data-copy-event-code="${event.code}">Copiar código</button></div></section>`;}
 document.addEventListener('click',async e=>{const b=e.target.closest('[data-copy-event-code]');if(!b)return;try{await navigator.clipboard.writeText(b.dataset.copyEventCode);b.textContent='Código copiado';}catch{b.textContent=b.dataset.copyEventCode;}});
 window.noodoEventIdentity={events,find,url,qr,block,escape};
})();
