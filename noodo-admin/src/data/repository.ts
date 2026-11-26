import {commentPeople,extractMentions} from '../lib/mentions';
import {validateAgreement} from './agreements';
import {validateBudgetApprovals} from './budget-approvals';
import {validateBudget,validateMoneySource,applyBudgetBalances} from './budgets';
import {preserveVersions,currentAttachments} from './file-versions';
import {initialPartners,normalizePartners,ownership,validatePartner,validateAssignment} from './partners';
import {scopeDatabase,validateScope} from './project-scope';
import {taskProgress} from '../lib/task-progress';
import type { Database, Collection, Partner } from './types';
import { sampleDatabase } from './seed';
export const STORAGE_KEY = 'noodo.admin.v1';
export function validateDatabase(value: unknown): asserts value is Database {
 if(!value || typeof value !== 'object') throw new Error('Los datos locales no se pueden leer.');
 const d=value as Database;
 if(d.version!==1 || !['projects','contacts','quotes','meetings','minutes','tasks','documents','activity'].every(k=>Array.isArray(d[k as Collection]))) throw new Error('Formato de datos incompatible. Conservamos los datos originales.');
}
export function normalizeDatabase(value: unknown): Database {
 validateDatabase(value);
 for (const key of ['attachments','followUps','transactions','deliverables','partners','budgets','moneySources'] as const) {
  if(value[key] !== undefined && !Array.isArray(value[key])) throw new Error('Formato de datos incompatible. Conservamos los datos originales.');
 }
 return normalizePartners(scopeDatabase({...value, budgets:value.budgets??[], moneySources:value.moneySources??[], partners:value.partners??initialPartners(), attachments:value.attachments??[], followUps:value.followUps??[], transactions:value.transactions??[], deliverables:value.deliverables??[]}));
}
export function loadDatabase(): Database { const raw=localStorage.getItem(STORAGE_KEY); if(!raw) { const initial=normalizeDatabase(sampleDatabase()); localStorage.setItem(STORAGE_KEY,JSON.stringify(initial)); return initial; } const data:unknown=JSON.parse(raw); const normalized=normalizeDatabase(data); if(JSON.stringify(normalized)!==raw)persistDatabase(normalized); return normalized; }
export function upsert<K extends Collection>(db: Database, collection: K, record: Database[K][number], label: string, author?: Pick<Partner,'id'|'name'>): Database {
 const attribution={actor:author?.name||'Sesión local',...(author?{actorId:author.id}:{})};
 const rows=db[collection] as Array<{id:string}>;
 const before=rows.find(r=>r.id===record.id);
 const has=!!before;
 if (has && collection==='followUps') throw new Error('Este registro se conserva sin sobrescribir. Añade una nueva entrada.');
 if(collection==='followUps'){const note=record as Database['followUps'][number];const {mentions:_ignored,...rest}=note;const mentions=extractMentions(note.body,commentPeople(db,note));record={...rest,...(mentions.length?{mentions}:{})} as typeof record;}
 if(collection==='attachments'){
  const file=record as Database['attachments'][number];const old=before as typeof file|undefined;
  if(old){const {deletedAt:_old,...original}=old;const {deletedAt:_new,...incoming}=file;if(JSON.stringify(original)!==JSON.stringify(incoming))throw new Error('Este registro se conserva sin sobrescribir. Añade una nueva versión.');}
  else if(file.previousId){const previous=db.attachments.find(a=>a.id===file.previousId);if(!previous||previous.projectId!==file.projectId||previous.entityType!==file.entityType||previous.entityId!==file.entityId||!currentAttachments(db.attachments).some(a=>a.id===previous.id)||previous.deletedAt)throw new Error('La versión anterior debe ser la vigente del mismo expediente.');record={...file,groupId:previous.groupId||previous.id,version:(previous.version||1)+1} as typeof record;}
  else record={...file,groupId:file.id,version:1} as typeof record;
 }
 if(collection==='documents')validateAgreement(record as Database['documents'][number],db,before as Database['documents'][number]|undefined);
 if(collection==='documents'||collection==='minutes')record=preserveVersions(before as Database['documents'][number]|Database['minutes'][number]|undefined,record as Database['documents'][number]|Database['minutes'][number]) as typeof record;
 if(collection==='transactions'){const item=record as Database['transactions'][number];if(!Number.isFinite(item.amount)||item.amount<=0)throw new Error('El importe debe ser mayor que cero.');}
 if(collection==='budgets'){const b=record as Database['budgets'][number];validateBudget(b,db,before as typeof b|undefined);validateBudgetApprovals(b,db,before as typeof b|undefined,author);record={...b,isActive:!b.deletedAt&&!b.archivedAt&&!!b.isActive,isPinned:!b.deletedAt&&!!b.isPinned} as typeof record;}
 if(collection==='moneySources')validateMoneySource(record as Database['moneySources'][number]);
 if(collection==='partners'){validatePartner(record as Database['partners'][number],db);record={...record,name:(record as Database['partners'][number]).name.trim(),email:(record as Database['partners'][number]).email.trim()} as typeof record;}
 else if(collection!=='budgets'&&collection!=='moneySources')validateScope(db,collection,record);
 if(collection==='projects'||collection==='tasks'){const item=record as Database['projects'][number]|Database['tasks'][number];record={...item,...ownership(item,db.partners)} as typeof record;validateAssignment(record as typeof item,before as typeof item|undefined,db);}
 if(collection==='tasks'){
  const task=record as Database['tasks'][number];const old=before as typeof task|undefined;
  const children=db.tasks.filter(t=>t.parentId===task.id);
  if(children.length){const progress=taskProgress(task,db.tasks);if(task.done&&progress<100)throw new Error('Completa las subtareas antes de completar esta tarea.');record={...task,progress,done:progress===100,status:progress===100?'Completada':progress>0?'En curso':'Pendiente'} as typeof record;}
  else {const reopening=old?.done&&!task.done;const progress=reopening?(task.progress!==undefined&&task.progress<100?task.progress:0):task.done?100:task.progress??0;record={...task,progress,done:progress===100,status:progress===100?'Completada':progress>0?'En curso':reopening?'Pendiente':task.status==='Completada'?'Pendiente':task.status??'Pendiente'} as typeof record;}
 }
 const projectId = collection==='projects' ? record.id : 'projectId' in record ? record.projectId ?? (collection==='budgets'&&(before as Database['budgets'][number]|undefined)?.projectId||'') : '';
 let next:Database={...db,[collection]:has? rows.map(r=>r.id===record.id?record:r):[...rows,record],activity:[{id:crypto.randomUUID(),projectId,description:label,at:new Date().toISOString(),...attribution,collection,recordId:record.id,action:has?'Actualización':'Creación',before:before?structuredClone(before):null,after:structuredClone(record)},...db.activity]};
 if(collection==='budgets'){
  const b=record as Database['budgets'][number];next.moneySources=applyBudgetBalances(db.moneySources,before as typeof b|undefined,b);
  next.budgets=next.budgets.map(row=>row.id===b.id?{...row,isActive:!b.deletedAt&&!b.archivedAt&&!!b.isActive,isPinned:!b.deletedAt&&!!b.isPinned}:b.isActive&&!b.deletedAt&&!b.archivedAt?{...row,isActive:false}:row);
  next.moneySources.forEach(s=>{const old=db.moneySources.find(o=>o.id===s.id)!;if(old.balance!==s.balance)next.activity.unshift({id:crypto.randomUUID(),projectId:b.projectId||'',description:`Saldo actualizado por presupuesto: ${s.name}`,at:new Date().toISOString(),...attribution,actor:author?.name||'Cálculo local',origin:'Cálculo local',collection:'moneySources',recordId:s.id,action:'Actualización',before:structuredClone(old),after:structuredClone(s)});});
 }
 if(collection==='contacts'&&'projectId' in record&&record.projectId){next={...next,projects:next.projects.map(p=>p.id===record.projectId?{...p,contactIds:Array.from(new Set([...p.contactIds,record.id]))}:p)};}
 if(collection==='tasks'){
  const task=record as Database['tasks'][number];const parent=db.tasks.find(t=>t.id===task.parentId);
  if(parent){const progress=taskProgress(parent,next.tasks);const after={...parent,progress,done:progress===100,status:progress===100?'Completada' as const:progress>0?'En curso' as const:'Pendiente' as const};
   next={...next,tasks:next.tasks.map(t=>t.id===parent.id?after:t),activity:[{id:crypto.randomUUID(),projectId:parent.projectId,description:`Avance calculado de ${parent.title}: ${progress}%`,at:new Date().toISOString(),...attribution,actor:author?.name||'Cálculo local',origin:'Cálculo local',collection:'tasks',recordId:parent.id,action:'Actualización',before:structuredClone(parent),after},...next.activity]};
  }
 }
 if(collection==='partners'){
  for(const key of ['projects','tasks'] as const){next[key]=next[key].map(row=>{
   if(!row.partnerIds?.includes(record.id))return row;
   const after={...row,...ownership(row,next.partners)};if(after.owner===row.owner)return row;
   next.activity.unshift({id:crypto.randomUUID(),projectId:key==='projects'?row.id:(row as Database['tasks'][number]).projectId,collection:key,recordId:row.id,description:`Nombre de responsable actualizado: ${after.owner}`,at:new Date().toISOString(),...attribution,action:'Actualización',before:structuredClone(row),after:structuredClone(after)});return after;
  }) as never;}
 }
 return next;
}
export function persistDatabase(data: Database) { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(data)); } catch { throw new Error('No pudimos guardar en este navegador. Libera espacio o exporta tus datos antes de continuar.'); } }
const openFiles = () => new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('noodo-admin-files',1); request.onupgradeneeded=()=>request.result.createObjectStore('files'); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(new Error('No se pudo abrir el almacenamiento de archivos.'));});
export async function putFile(key: string,file: File) { const db=await openFiles(); try { await new Promise<void>((resolve,reject)=>{const tx=db.transaction('files','readwrite'); tx.objectStore('files').put(file,key); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(new Error('No se pudo guardar el archivo. Revisa el espacio disponible.')); tx.onabort=()=>reject(new Error('La carga del archivo se interrumpió.'));}); } finally { db.close(); } }
export async function getFile(key: string) { const db=await openFiles(); try { return await new Promise<File | undefined>((resolve,reject)=>{const req=db.transaction('files','readonly').objectStore('files').get(key); req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(new Error('No se pudo recuperar el archivo.'));}); } finally {db.close();} }
