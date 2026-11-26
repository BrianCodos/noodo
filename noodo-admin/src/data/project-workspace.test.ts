import {describe,it,expect} from 'vitest';
import {emptyDatabase} from './seed';
import {upsert,normalizeDatabase} from './repository';
import {duplicateProject} from './duplicate-project';
import {currentAttachments,attachmentVersions} from './file-versions';
import type {Document,Attachment} from './types';
function fixture(){let db=emptyDatabase();db=upsert(db,'projects',{id:'p',name:'Proyecto',client:'NOODO',kind:'Evento',owner:'Brian Cobaleda',partnerIds:['partner-brian'],status:'En curso',deadline:'2026-12-15',description:'Alcance',contactIds:[]},'Crear');return db;}
describe('Versiones y papelera',()=>{
 it('resubir conserva contenido, blobs y auditoría; borrar y restaurar no crean versiones falsas',()=>{
  let db=fixture();const doc:Document={id:'doc',projectId:'p',title:'Propuesta',version:1,filename:'primero.pdf',blobKey:'blob-original',content:'',createdAt:'2026-11-24',status:'Borrador'};
  db=upsert(db,'documents',doc,'Crear');db=upsert(db,'documents',{...db.documents[0],filename:'segundo.pdf',blobKey:'blob-nuevo'},'Resubir');
  expect(db.documents[0].version).toBe(2);expect(db.documents[0].versions).toMatchObject([{blobKey:'blob-original',filename:'primero.pdf',version:1}]);
  const latest=structuredClone(db.documents[0]);db=upsert(db,'documents',{...latest,deletedAt:'2026-11-24'},'Papelera');expect(db.documents[0].version).toBe(2);
  db=upsert(db,'documents',{...db.documents[0],deletedAt:undefined},'Restaurar');expect(db.documents[0]).toEqual({...latest,deletedAt:undefined});expect(normalizeDatabase(db).documents).toEqual(db.documents);expect(db.activity.some(a=>a.description==='Resubir'&&(a.before as Document).blobKey==='blob-original')).toBe(true);
 });
 it('conserva versiones de actas de texto y nuevas versiones de archivo',()=>{let db=fixture();db=upsert(db,'minutes',{id:'m',projectId:'p',meetingId:'',title:'Acta',body:'Primera reunión',decisions:'Decisión original'},'Acta');db=upsert(db,'minutes',{...db.minutes[0],decisions:'Nuevo acuerdo'},'Editar');db=upsert(db,'minutes',{...db.minutes[0],filename:'acta.pdf',blobKey:'pdf'},'Subir');expect(db.minutes[0].version).toBe(3);expect(db.minutes[0].versions?.[0].content).toContain('Decisión original');expect(db.minutes[0].versions?.[1].content).toContain('Nuevo acuerdo');});
 it('mantiene adjuntos acumulativos con una versión vigente y rechaza sobrescrituras o ramas',()=>{
  let db=fixture();const file:Attachment={id:'a',projectId:'p',entityType:'project',entityId:'p',filename:'uno.txt',blobKey:'uno',size:10,createdAt:'2026-11-24'};
  db=upsert(db,'attachments',file,'Archivo');db=upsert(db,'attachments',{...file,id:'b',previousId:'a',filename:'dos.txt',blobKey:'dos'},'Versión');expect(currentAttachments(db.attachments).map(a=>a.id)).toEqual(['b']);expect(attachmentVersions(db.attachments[1],db.attachments)).toHaveLength(2);
  expect(()=>upsert(db,'attachments',{...db.attachments[1],blobKey:'otro'},'Cambiar')).toThrow('sin sobrescribir');expect(()=>upsert(db,'attachments',{...file,id:'c',previousId:'a'},'Rama')).toThrow('vigente');
  db=upsert(db,'attachments',{...db.attachments[1],deletedAt:'2026-11-24'},'Papelera');expect(currentAttachments(db.attachments).filter(a=>!a.deletedAt)).toHaveLength(0);expect(db.attachments).toHaveLength(2);db=upsert(db,'attachments',{...db.attachments[1],deletedAt:undefined},'Restaurar');expect(currentAttachments(db.attachments)[0].blobKey).toBe('dos');
 });
});
describe('Duplicación de proyecto',()=>{
 it('copia estructura con IDs nuevos y reinicia ejecución sin modificar el original',()=>{
  let db=fixture();db=upsert(db,'contacts',{id:'contact',projectId:'p',name:'Contacto',company:'',email:'',phone:'',role:'Aliado'},'Contacto');
  const task={id:'t',projectId:'p',title:'Principal',owner:'Brian Cobaleda',partnerIds:['partner-brian'],due:'2026-12-15',done:true};db=upsert(db,'tasks',task,'Tarea');db=upsert(db,'tasks',{...task,id:'child',parentId:'t',title:'Subtarea'},'Subtarea');db=upsert(db,'deliverables',{id:'d',projectId:'p',taskId:'child',title:'Entrega',criteria:'Criterios',due:'2026-12-15',status:'Entregado',url:'https://example.com/file'},'Entrega');db=upsert(db,'quotes',{id:'q',projectId:'p',title:'Cotización',items:[],tax:0,status:'Aceptada',validUntil:'2026-12-15',notes:''},'Cotizar');
  const original=structuredClone(db);const {db:next,project}=duplicateProject(db,'p','Copia',{tasks:true,quotes:true});expect(db).toEqual(original);expect(project.id).not.toBe('p');expect(project.contactIds).toEqual(['contact']);expect(project.status).toBe('En planeación');
  const copies=next.tasks.filter(t=>t.projectId===project.id);expect(copies).toHaveLength(2);expect(copies.every(t=>!t.done&&t.progress===0)).toBe(true);expect(copies.find(t=>t.parentId)?.parentId).toBe(copies.find(t=>!t.parentId)?.id);expect(next.deliverables.find(d=>d.projectId===project.id)).toMatchObject({taskId:copies.find(t=>t.parentId)?.id,status:'Pendiente',url:''});expect(next.quotes.find(q=>q.projectId===project.id)?.status).toBe('Borrador');expect(next.documents).toEqual(db.documents);expect(next.activity.length).toBeGreaterThan(db.activity.length);
  const minimal=duplicateProject(db,'p','Vacío',{tasks:false,quotes:false});expect(minimal.db.tasks).toEqual(db.tasks);expect(minimal.db.quotes).toEqual(db.quotes);
 });
});
