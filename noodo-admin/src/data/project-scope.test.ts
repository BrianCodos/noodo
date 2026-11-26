import {describe,it,expect,vi,afterEach} from 'vitest';
import {emptyDatabase} from './seed';
import {normalizeDatabase,upsert,loadDatabase,persistDatabase} from './repository';
import {taskProgress,projectProgress} from '../lib/task-progress';
import type {Project,Task,Database} from './types';
const p:Project={id:'p',name:'Proyecto',client:'NOODO',kind:'Interno',owner:'Brian Cobaleda',partnerIds:['partner-brian'],status:'En curso',deadline:'',description:'',contactIds:[]};
const task:Task={id:'t',projectId:'p',title:'Producción',owner:'Brian Cobaleda',partnerIds:['partner-brian'],due:'2026-12-15',done:false,progress:0};
const fixture=():Database=>({...emptyDatabase(),projects:[p,{...p,id:'other'}],tasks:[task]});
afterEach(()=>vi.unstubAllGlobals());
describe('Expediente obligatorio',()=>{
 it('conserva comentarios de proyecto independientes, acumulativos y locales',()=>{
  const note={id:'project-note',projectId:'p',entityType:'project' as const,entityId:'p',body:'Acordamos revisar el alcance.',createdAt:'2026-11-25T01:00:00Z',authorId:'partner-brian',authorName:'Brian Cobaleda'};
  let db=upsert(fixture(),'followUps',note,'Comentario del proyecto');
  db=upsert(db,'followUps',{...note,id:'task-note',entityType:'task',entityId:'t',body:'Nota de tarea'},'Comentario de tarea');
  expect(()=>upsert(db,'followUps',{...note,id:'cross',projectId:'other'},'Comentario cruzado')).toThrow('proyecto indicado');
  expect(()=>upsert(db,'followUps',{...note,body:'Sobrescribir'},'Editar')).toThrow('sin sobrescribir');
  let raw='';vi.stubGlobal('localStorage',{setItem:(_key:string,value:string)=>raw=value,getItem:()=>raw});persistDatabase(db);const restored=loadDatabase();
  expect(restored.followUps.filter(n=>n.entityType==='project'&&n.entityId==='p')).toEqual([note]);
  expect(restored.followUps.filter(n=>n.entityType==='task')).toHaveLength(1);
  expect(restored.activity.find(a=>a.recordId===note.id)).toMatchObject({projectId:'p',after:note});
 });
 it('rechaza tareas y cotizaciones sin proyecto o con proyecto inexistente',()=>{
  for(const projectId of ['', 'missing'])expect(()=>upsert(fixture(),'tasks',{...task,id:'new',projectId},'Crear')).toThrow('proyecto existente');
  expect(()=>upsert(fixture(),'quotes',{id:'q',projectId:'',title:'Q',items:[],tax:0,status:'Borrador',validUntil:'',notes:''},'Crear')).toThrow('proyecto existente');
 });
 it('migra sin pérdida e idempotentemente documentos corporativos, proyectos ausentes y contactos',()=>{
  const db=emptyDatabase();db.documents=[{id:'doc',projectId:'',title:'Acuerdo',filename:'legal.pdf',blobKey:'blob',version:2,createdAt:'2026-11-20',content:'Texto',status:'Borrador'}];db.tasks=[{...task,projectId:'missing'}];db.contacts=[{id:'c',name:'Contacto',company:'',email:'',phone:'',role:'Aliado'}];
  const next=normalizeDatabase(db);expect(next.documents[0]).toEqual({...db.documents[0],projectId:'noodo-internal'});expect(next.tasks).toEqual(db.tasks);expect(next.projects.find(p=>p.id==='missing')).toBeDefined();expect(next.projects.find(p=>p.id==='noodo-internal')?.contactIds).toEqual(['c']);expect(normalizeDatabase(next)).toEqual(next);expect(db.documents[0].projectId).toBe('');
 });
 it('impide relaciones cruzadas entre proyectos y cambios de expediente',()=>{
  expect(()=>upsert(fixture(),'tasks',{...task,id:'child',projectId:'other',parentId:'t'},'Crear')).toThrow('mismo proyecto');
  expect(()=>upsert(fixture(),'tasks',{...task,projectId:'other'},'Mover')).toThrow('Conserva el proyecto');
  expect(()=>upsert(fixture(),'minutes',{id:'a',projectId:'p',meetingId:'missing',title:'Acta',body:'',decisions:''},'Crear')).toThrow('mismo proyecto');
 });
 it('vincula nuevos contactos al proyecto en una sola operación',()=>{const db=upsert(fixture(),'contacts',{id:'c',projectId:'p',name:'Responsable',company:'',email:'',phone:'',role:'Aliado'},'Contacto');expect(db.projects[0].contactIds).toEqual(['c']);});
});
describe('Subtareas, entregas y avance',()=>{
 it('calcula el avance del padre, conserva historial y reabre al añadir trabajo',()=>{
  let db=upsert(fixture(),'tasks',{...task,id:'child',parentId:'t',progress:50},'Subtarea');expect(db.tasks.find(t=>t.id==='t')).toMatchObject({progress:50,status:'En curso',done:false});
  db=upsert(db,'tasks',{...db.tasks.find(t=>t.id==='child')!,progress:100,done:true},'Completar');expect(db.tasks.find(t=>t.id==='t')?.done).toBe(true);
  db=upsert(db,'tasks',{...task,id:'child2',parentId:'t'},'Nueva subtarea');expect(db.tasks.find(t=>t.id==='t')).toMatchObject({progress:50,done:false});expect(projectProgress(db.tasks)).toBe(50);expect(db.activity.some(a=>a.recordId==='t'&&a.before&&a.after)).toBe(true);
 });
 it('no completa un padre mientras haya subtareas incompletas ni redondea a 100',()=>{let db=upsert(fixture(),'tasks',{...task,id:'c1',parentId:'t',done:true},'Crear');db=upsert(db,'tasks',{...task,id:'c2',parentId:'t',progress:99},'Crear');expect(taskProgress(db.tasks[0],db.tasks)).toBe(99);expect(()=>upsert(db,'tasks',{...db.tasks[0],done:true},'Completar')).toThrow('Completa las subtareas');});
 it('permite corregir el porcentaje de una hoja completada y rechaza fechas y porcentajes inválidos',()=>{let db=upsert(fixture(),'tasks',{...task,done:true},'Completar');db=upsert(db,'tasks',{...db.tasks[0],done:false,progress:45,status:'En curso'},'Reabrir');expect(db.tasks[0].progress).toBe(45);for(const progress of [-1,101,NaN])expect(()=>upsert(db,'tasks',{...task,progress},'Editar')).toThrow('entre 0 y 100');expect(()=>upsert(db,'tasks',{...task,startDate:'2027-01-01'},'Editar')).toThrow('inicio');});
 it('rechaza ciclos y más de un nivel de subtareas',()=>{expect(()=>upsert(fixture(),'tasks',{...task,parentId:'t'},'Editar')).toThrow('nivel');const db=upsert(fixture(),'tasks',{...task,id:'child',parentId:'t'},'Crear');expect(()=>upsert(db,'tasks',{...task,id:'grandchild',parentId:'child'},'Crear')).toThrow('nivel');});
 it('conserva comentarios y entregables independientes y sus archivos después de recargar',()=>{
  let db=upsert(fixture(),'tasks',{...task,id:'child',parentId:'t',requirements:'WAV sin compresión'},'Subtarea');db=upsert(db,'followUps',{id:'note',projectId:'p',entityType:'task',entityId:'child',body:'Revisar mezcla',createdAt:'2026-11-24',authorId:'partner-brian',authorName:'Brian Cobaleda'},'Comentario');
  db=upsert(db,'deliverables',{id:'d',projectId:'p',taskId:'child',title:'Máster',criteria:'WAV 48 kHz',due:'2026-12-15',status:'En revisión',url:'https://example.com/master'},'Entrega');db=upsert(db,'attachments',{id:'file',projectId:'p',entityType:'deliverable',entityId:'d',filename:'master.txt',blobKey:'blob',size:10,createdAt:'2026-11-24'},'Archivo');
  let raw='';vi.stubGlobal('localStorage',{setItem:(_key:string,value:string)=>raw=value,getItem:()=>raw});persistDatabase(db);const loaded=loadDatabase();expect(loaded).toEqual(db);expect(loaded.tasks.find(t=>t.id==='child')?.requirements).toBe('WAV sin compresión');expect(loaded.followUps[0]).toMatchObject({authorId:'partner-brian',authorName:'Brian Cobaleda'});expect(()=>upsert(loaded,'followUps',{...loaded.followUps[0],authorName:'Otro socio'},'Editar')).toThrow('sin sobrescribir');expect(loaded.followUps.filter(n=>n.entityId==='t')).toHaveLength(0);expect(loaded.deliverables[0].taskId).toBe('child');expect(loaded.attachments[0].blobKey).toBe('blob');expect(()=>upsert(db,'deliverables',{...db.deliverables[0],url:'javascript:alert(1)'},'Editar')).toThrow('HTTP');
 });
});
