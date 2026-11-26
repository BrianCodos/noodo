import type {Database,Project,Collection,Task} from './types';
export const INTERNAL_PROJECT='noodo-internal';
export function scopeDatabase(db:Database):Database {
 const next=structuredClone(db);let changed=false;
 const ensure=(id:string)=>{const key=id||INTERNAL_PROJECT;if(!next.projects.some(p=>p.id===key)){next.projects.push({id:key,name:key===INTERNAL_PROJECT?'Gestión interna NOODO':`Proyecto recuperado · ${key}`,client:'NOODO',kind:'Proyecto interno',owner:'Ambos socios',status:'En planeación',deadline:'',description:'Expediente que conserva los registros anteriores. Puedes editar su nombre y alcance.',contactIds:[]});changed=true;}return key;};
 for(const key of ['quotes','meetings','minutes','tasks','documents','transactions','attachments','followUps','deliverables'] as const){next[key]=next[key].map(row=>{if(key==='followUps'&&'entityType' in row&&row.entityType==='budget')return row;const projectId=ensure(row.projectId);if(projectId!==row.projectId){changed=true;return {...row,projectId};}return row;}) as never;}
 for(const c of next.contacts)if(!next.projects.some(p=>p.contactIds.includes(c.id))){const id=ensure(c.projectId||'');next.projects.find(p=>p.id===id)!.contactIds.push(c.id);changed=true;}
 if(changed)next.activity.unshift({id:crypto.randomUUID(),projectId:next.projects.find(p=>p.id===INTERNAL_PROJECT)?.id||next.projects[0]?.id||'',description:'Organización de registros anteriores dentro de proyectos; IDs, archivos e historial conservados.',at:new Date().toISOString(),actor:'Migración local',action:'Migración'});
 return next;
}
export function validateScope<K extends Collection>(db:Database,collection:K,record:Database[K][number]) {
 if(collection==='followUps'&&(record as Database['followUps'][number]).entityType==='budget'){
  const note=record as Database['followUps'][number];const budget=db.budgets.find(b=>b.id===note.entityId);
  if(!budget||(budget.projectId||'')!==note.projectId)throw new Error('El comentario debe pertenecer al presupuesto indicado.');
  if(!note.body.trim())throw new Error('Escribe un comentario.');
  return;
 }
 if(collection==='projects'){
  const project=record as Project;
  if(project.contactIds.some(id=>!db.contacts.some(c=>c.id===id)))throw new Error('Selecciona contactos existentes.');
  const previous=db.projects.find(p=>p.id===project.id);
  if(previous?.contactIds.some(id=>!project.contactIds.includes(id)&&!db.projects.some(p=>p.id!==project.id&&p.contactIds.includes(id))))throw new Error('Vincula el contacto a otro proyecto antes de retirarlo de este.');
  return;
 }
 const before=(db[collection] as {id:string;projectId?:string}[]).find(r=>r.id===record.id);
 if(collection==='contacts'&&!('projectId' in record&&record.projectId)&&db.projects.some(p=>p.contactIds.includes(record.id)))return;
 if(!('projectId' in record)||!record.projectId||!db.projects.some(p=>p.id===record.projectId))throw new Error('Selecciona un proyecto existente. Todo registro debe pertenecer a un proyecto.');
 if(before?.projectId&&before.projectId!==record.projectId)throw new Error('Conserva el proyecto original para mantener sus relaciones.');
 const same=(items:{id:string;projectId:string}[],id:string,label:string)=>{if(!items.some(r=>r.id===id&&r.projectId===record.projectId))throw new Error(`${label} debe pertenecer al mismo proyecto.`);};
 if(collection==='tasks'){
  const t=record as Task;
  if(!t.title.trim()||!t.owner.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(t.due))throw new Error('Completa título, responsable y fecha límite.');
  if(t.startDate&&t.startDate>t.due)throw new Error('La fecha de inicio no puede ser posterior a la fecha límite.');
  if(t.progress!==undefined&&(!Number.isFinite(t.progress)||t.progress<0||t.progress>100))throw new Error('El avance debe estar entre 0 y 100.');
  if(t.parentId){same(db.tasks,t.parentId,'La tarea principal');const p=db.tasks.find(r=>r.id===t.parentId)!;if(p.parentId||p.id===t.id||db.tasks.some(r=>r.parentId===t.id))throw new Error('Solo se admite un nivel de subtareas.');}
  if(before&&(before as Task).parentId!==t.parentId)throw new Error('Conserva la tarea principal original.');
  if(t.meetingId)same(db.meetings,t.meetingId,'La reunión');
 }
 if(collection==='minutes'){const r=record as Database['minutes'][number];if(r.meetingId)same(db.meetings,r.meetingId,'La reunión');}
 if(collection==='deliverables'){
  const r=record as Database['deliverables'][number];same(db.tasks,r.taskId,'La tarea');
  if(!r.title.trim()||!r.criteria.trim()||!r.due)throw new Error('Define nombre, criterios de aceptación y fecha del entregable.');
  if(r.url&&!/^https?:\/\//i.test(r.url))throw new Error('Usa un enlace HTTP o HTTPS válido.');
  if(before&&(before as typeof r).taskId!==r.taskId)throw new Error('Conserva la tarea original del entregable.');
 }
 if(collection==='attachments'||collection==='followUps'){
  const r=record as Database['attachments'][number]|Database['followUps'][number];
  if(r.entityType==='project'){if(r.entityId!==r.projectId)throw new Error('El registro debe pertenecer al proyecto indicado.');return;}
  const items=r.entityType==='meeting'?db.meetings:r.entityType==='transaction'?db.transactions:r.entityType==='deliverable'?db.deliverables:db.tasks;
  same(items,r.entityId,'El registro relacionado');
 }
}
