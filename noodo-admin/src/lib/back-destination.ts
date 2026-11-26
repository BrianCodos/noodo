import type {Database} from '../data/types';
export function backDestination(pathname:string,db:Database):{to:string;label:string}|null {
 const parts=pathname.split('/').filter(Boolean);const [area,id,detail]=parts;
 const project=(pid:string,section='')=>({to:`/proyectos/${pid}${section?`/${section}`:''}`,label:'Volver al proyecto'});
 if(!area||area==='inicio')return null;
 if(area==='presupuestos'&&id)return {to:'/presupuestos',label:'Volver a presupuestos'};
 if(area==='proyectos'&&id)return {to:'/proyectos',label:'Todos los proyectos'};
 if(area==='documentos'){if(detail==='firmar')return {to:`/documentos/${id}`,label:'Volver al documento'};const d=db.documents.find(d=>d.id===id);if(d)return project(d.projectId,'documentos');}
 if(area==='reuniones'){const m=db.meetings.find(m=>m.id===id);if(m)return project(m.projectId,'eventos');}
 if(area==='registros'){
  if(id==='tasks'){const t=db.tasks.find(t=>t.id===detail);if(t)return t.parentId?{to:`/registros/tasks/${t.parentId}`,label:'Volver a la tarea principal'}:project(t.projectId,'tareas');}
  if(id==='transactions'){const t=db.transactions.find(t=>t.id===detail);if(t)return project(t.projectId,'contabilidad');}
  if(id==='quotes'){const q=db.quotes.find(q=>q.id===detail);if(q)return project(q.projectId,'cotizaciones');}
  if(id==='contacts'){const p=db.projects.find(p=>p.contactIds.includes(detail));if(p)return project(p.id,'contactos');}
  if(id==='activity')return {to:'/log',label:'Volver al LOG'};
 }
 if(area==='visor'){
  const a=id==='acta'?db.minutes.find(a=>a.id===detail):undefined;
  if(a)return a.meetingId?{to:`/reuniones/${a.meetingId}`,label:'Volver a la reunión'}:project(a.projectId,'documentos');
  const f=db.attachments.find(a=>a.id===detail);
  if(f){if(f.entityType==='meeting')return {to:`/reuniones/${f.entityId}`,label:'Volver a la reunión'};if(f.entityType==='deliverable'){const d=db.deliverables.find(d=>d.id===f.entityId);if(d)return {to:`/registros/tasks/${d.taskId}`,label:'Volver a la tarea'};}if(f.entityType==='task')return {to:`/registros/tasks/${f.entityId}`,label:'Volver a la tarea'};if(f.entityType==='transaction')return {to:`/registros/transactions/${f.entityId}`,label:'Volver al movimiento'};return project(f.projectId);}
 }
 if(area==='catalogo')return {to:'/buscar',label:'Volver a la búsqueda'};
 return {to:'/inicio',label:'Volver al inicio'};
}
