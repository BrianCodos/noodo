import type {Database} from '../data/types';
import catalog from '../data/catalog.json';
export interface Breadcrumb {label:string;to:string}
const sections:Record<string,string>={presupuestos:'Presupuestos',inicio:'Inicio',proyectos:'Proyectos',comunidad:'Comunidad',contactos:'Contactos',calendario:'Calendario',log:'LOG',buscar:'Búsqueda',configuracion:'Configuración',componentes:'Componentes',tareas:'Tareas',cotizaciones:'Cotizaciones',contabilidad:'Contabilidad',legal:'Documentos',actas:'Actas',documentos:'Documentos',eventos:'Eventos',reuniones:'Eventos',actividad:'Actividad'};
export function breadcrumbs(pathname:string,db:Database):Breadcrumb[]{
 const root={label:'Inicio',to:'/inicio'};
 const project=(id:string,section?:string):Breadcrumb[]=>[root,{label:'Proyectos',to:'/proyectos'},{label:db.projects.find(p=>p.id===id)?.name||'Proyecto',to:`/proyectos/${id}`},...(section?[{label:sections[section]||section,to:`/proyectos/${id}/${section}`}]:[])];
 const task=(id:string,seen=new Set<string>()):Breadcrumb[]=>{const t=db.tasks.find(t=>t.id===id);if(!t||seen.has(id))return [root,{label:'Tareas',to:'/tareas'}];seen.add(id);return [...(t.parentId?task(t.parentId,seen):project(t.projectId,'tareas')),{label:t.title,to:`/registros/tasks/${id}`}];};
 const [area,id,detail]=pathname.split('/').filter(Boolean);
 const end=(base:Breadcrumb[],label:string)=>[...base,{label,to:pathname}];
 if(!area||area==='inicio')return [root];
 if(area==='presupuestos'&&id)return end([root,{label:'Presupuestos',to:'/presupuestos'}],db.budgets.find(b=>b.id===id)?.name||'Presupuesto no encontrado');
 if(area==='proyectos'&&id)return project(id,detail);
 if(area==='registros'){
  if(id==='tasks')return db.tasks.some(t=>t.id===detail)?task(detail):end([root,{label:'Tareas',to:'/tareas'}],'Registro no encontrado');
  if(id==='contacts'){const r=db.contacts.find(r=>r.id===detail);return end([root,{label:'Contactos',to:'/contactos'}],r?.name||'Contacto no encontrado');}
  if(id==='activity'){const r=db.activity.find(r=>r.id===detail);return end([root,{label:'LOG',to:'/log'}],r?.description||'Registro no encontrado');}
  if(id==='quotes'||id==='transactions'){const r=db[id].find(r=>r.id===detail);return end(r?project(r.projectId,id==='quotes'?'cotizaciones':'contabilidad'):[root],r?.title||'Registro no encontrado');}
 }
 if(area==='reuniones'){const r=db.meetings.find(r=>r.id===id);return end(r?project(r.projectId,'eventos'):[root],r?.title||'Evento no encontrado');}
 if(area==='documentos'){const r=db.documents.find(r=>r.id===id);const path=end(r?project(r.projectId,'documentos'):[root],r?.title||'Documento no encontrado');if(detail==='firmar'){path[path.length-1].to=`/documentos/${id}`;return end(path,'Firmar documento');}return path;}
 if(area==='visor'){
  if(id==='acta'){const r=db.minutes.find(r=>r.id===detail);return end(r?project(r.projectId,'documentos'):[root],r?.title||'Acta no encontrada');}
  const r=db.attachments.find(r=>r.id===detail);if(r){const taskId=r.entityType==='task'?r.entityId:r.entityType==='deliverable'?db.deliverables.find(d=>d.id===r.entityId)?.taskId:undefined;let base=taskId?task(taskId):project(r.projectId,'documentos');if(r.entityType==='meeting'){const m=db.meetings.find(m=>m.id===r.entityId);if(m)base=[...project(r.projectId,'eventos'),{label:m.title,to:`/reuniones/${m.id}`}];}if(r.entityType==='transaction'){const tx=db.transactions.find(t=>t.id===r.entityId);if(tx)base=[...project(r.projectId,'contabilidad'),{label:tx.title,to:`/registros/transactions/${tx.id}`}];}return end(base,r.filename);}return end([root],'Archivo no encontrado');
 }
 if(area==='catalogo')return end([root,{label:'Búsqueda',to:'/buscar'}],catalog.find(r=>r.id===id)?.title||'Contenido no encontrado');
 return end([root],sections[area]||'Página no encontrada');
}

/** Switch the project, keeping its section but never reusing another project's record ID. */
export function projectSwitchPath(pathname:string,db:Database,targetId:string):string{
 const route=breadcrumbs(pathname,db);const index=route.findIndex(item=>/^\/proyectos\/[^/]+$/.test(item.to));
 const section=index>=0?route[index+1]?.to.split('/')[3]:undefined;
 const allowed=['tareas','cotizaciones','eventos','documentos','contactos','contabilidad','actividad'];
 return `/proyectos/${targetId}${section&&allowed.includes(section)?`/${section}`:''}`;
}
