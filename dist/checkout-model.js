/* Deterministic checkout rules. Demo orders are never proof of payment or admission. */
(() => {
 const methods=[
  {id:'card',name:'Tarjeta de crédito o débito',short:'Tarjeta',mark:'▰',detail:'Visa, Mastercard y American Express',instruction:'Los datos de tu tarjeta y las cuotas se completan en la pasarela de pago.'},
  {id:'pse',name:'PSE',short:'PSE',mark:'PSE',detail:'Débito desde tu cuenta bancaria',instruction:'Elige tu banco en PSE, inicia sesión y autoriza el pago. Al terminar, regresa a NOODO.'},
  {id:'nequi',name:'Nequi',short:'Nequi',mark:'N',detail:'Autoriza desde tu celular',instruction:'En la pasarela ingresa tu número Nequi. Abre la aplicación y autoriza la solicitud de pago.'},
  {id:'bancolombia',name:'Botón Bancolombia',short:'Bancolombia',mark:'B',detail:'Transferencia desde tu cuenta',instruction:'Continúa al canal de Bancolombia para iniciar sesión y autorizar la transferencia.'},
  {id:'cash',name:'Efectivo en corresponsal',short:'Efectivo',mark:'$',detail:'Referencia para pago presencial',instruction:'La pasarela entrega la referencia y la fecha límite. La boleta se emite cuando el pago queda confirmado.'}
 ];
 const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(value)+' COP';
 function quote(event,quantities){
  if(!event||!quantities||typeof quantities!=='object'||Array.isArray(quantities))throw Error('Selecciona tus boletas.');
  if(Object.keys(quantities).some(id=>!event.localities.some(l=>l.id===id)))throw Error('Localidad no válida.');
  const lines=event.localities.map(l=>{const quantity=quantities[l.id]??0;if(!Number.isInteger(quantity)||quantity<0||quantity>Math.min(6,l.available))throw Error('Revisa la cantidad de boletas.');return {...l,quantity,subtotal:l.price*quantity};}).filter(l=>l.quantity);
  const quantity=lines.reduce((n,l)=>n+l.quantity,0);
  if(quantity<1||quantity>6)throw Error('Elige entre 1 y 6 boletas por pedido.');
  return {lines,quantity,subtotal:lines.reduce((n,l)=>n+l.subtotal,0),fee:0,total:lines.reduce((n,l)=>n+l.subtotal,0)};
 }
 function createOrder(event,quantities,method){
  const summary=quote(event,quantities);if(summary.total>0&&!methods.some(m=>m.id===method))throw Error('Elige un medio de pago.');
  return {id:'ND-PRUEBA-'+crypto.randomUUID(),eventCode:event.code,quantities:{...quantities},method:summary.total===0?'free':method,total:summary.total,quantity:summary.quantity,createdAt:Date.now(),expiresAt:Date.now()+30*60*1000,status:'pending',demo:true,tickets:[]};
 }
 function transition(order,status,event){
  if(!order.demo||order.status!=='pending'||!['approved','declined','cancelled','expired','error'].includes(status))throw Error('No se puede cambiar este pedido.');
  if(order.eventCode!==event.code||quote(event,order.quantities).total!==order.total)throw Error('El pedido no coincide con el evento.');
  const next={...order,status:Date.now()>order.expiresAt?'expired':status};
  if(next.status==='approved')next.tickets=quote(event,order.quantities).lines.flatMap(l=>Array.from({length:l.quantity},()=>({id:'DEMO-'+crypto.randomUUID(),locality:l.name,price:l.price})));
  return next;
 }
 window.noodoCheckoutModel={methods,money,quote,createOrder,transition};
})();
