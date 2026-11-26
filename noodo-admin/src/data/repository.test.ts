import {describe,it,expect,vi,afterEach} from 'vitest';
import {emptyDatabase} from './seed';
import {loadDatabase,persistDatabase,upsert,STORAGE_KEY} from './repository';
import {duplicateProject} from './duplicate-project';
import {quoteTotals,matches} from '../lib/format';
import type {Project} from './types';
const project=(id='p'):Project=>({id,name:'Proyecto',client:'NOODO',kind:'Proyecto interno',owner:'Socio 1',status:'En curso',deadline:'',description:'',contactIds:[]});
const scoped=()=>({...emptyDatabase(),projects:[project()]});
afterEach(()=>vi.unstubAllGlobals());
describe('Persistencia del expediente',()=>{
 it('editar un proyecto conserva sus relaciones y no crea duplicados',()=>{
 const project:Project={id:'p1',name:'Sesión',client:'noodo',kind:'Evento',owner:'Socio 1',status:'En curso',deadline:'2026-12-01',description:'',contactIds:['c1']};
 const db={...emptyDatabase(),projects:[project],contacts:[{id:'c1',name:'Contacto',company:'',email:'',phone:'',role:'Aliado'}],tasks:[{id:'t1',projectId:'p1',title:'Preparar',owner:'Socio 1',due:'2026-12-01',done:false}]};
 const next=upsert(db,'projects',{...project,name:'Sesión en vivo'},'Proyecto actualizado');
 expect(next.projects).toHaveLength(1);expect(next.projects[0].contactIds).toEqual(['c1']);expect(next.tasks[0].projectId).toBe(next.projects[0].id);expect(db.projects[0].name).toBe('Sesión');
 });
 it('no sustituye datos corruptos por ejemplos',()=>{const setItem=vi.fn();vi.stubGlobal('localStorage',{getItem:()=>'{bad json',setItem});expect(()=>loadDatabase()).toThrow();expect(setItem).not.toHaveBeenCalled();});
 it('informa el fallo de cuota sin fingir que guardó',()=>{vi.stubGlobal('localStorage',{setItem:()=>{throw new Error('QuotaExceeded');}});expect(()=>persistDatabase(emptyDatabase())).toThrow('No pudimos guardar');});
 it('recarga los registros guardados sin regenerar ejemplos',()=>{const db=emptyDatabase();vi.stubGlobal('localStorage',{getItem:(key:string)=>key===STORAGE_KEY?JSON.stringify(db):null});expect(loadDatabase()).toEqual(db);});
});
describe('Cotizaciones y búsqueda',()=>{
 it('calcula cantidades fraccionarias e impuestos con redondeo monetario',()=>{expect(quoteTotals([{description:'Horas',quantity:1.5,price:100000},{description:'Mezcla',quantity:2,price:50000}],19)).toEqual({subtotal:250000,taxes:47500,total:297500});expect(quoteTotals([{description:'A',quantity:3,price:0.1}],19)).toEqual({subtotal:0.3,taxes:0.06,total:0.36});});
 it('encuentra nombres sin depender de tildes o mayúsculas',()=>{expect(matches('Daniel Ríos','rios')).toBe(true);expect(matches('Producción sonora','PRODUCCION')).toBe(true);expect(matches('Sesión','evento')).toBe(false);});
});

describe('Reuniones, conservación y migración',()=>{
 it('migra los datos anteriores conservando las reuniones y el historial',()=>{
 const original={...emptyDatabase(),meetings:[{id:'m1',projectId:'p1',title:'Reunión',date:'2026-11-24',time:'10:00',attendees:'Socios',location:''}]};
 const legacy={...original} as Record<string,unknown>;delete legacy.attachments;delete legacy.followUps;delete legacy.transactions;
 vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify(legacy),setItem:vi.fn()});const next=loadDatabase();expect(next.meetings).toEqual(original.meetings);expect(next.attachments).toEqual([]);expect(next.transactions).toEqual([]);
 });
 it('conserva todas las entradas y las versiones anterior y posterior',()=>{
 const db=scoped();db.activity=Array.from({length:205},(_,i)=>({id:String(i),projectId:'',description:'Anterior',at:'2026-11-24T15:00:00Z'}));
 const m={id:'m',projectId:'p',title:'Original',date:'2026-11-24',time:'10:00',attendees:'Socios',location:''};db.meetings=[m];
 const next=upsert(db,'meetings',{...m,title:'Actualizada'},'Actualización');expect(next.activity).toHaveLength(206);expect(next.activity[0].before).toEqual(m);expect(next.activity[0].after).toMatchObject({title:'Actualizada'});expect(db.meetings[0].title).toBe('Original');
 });
 it('cancelar una reunión mantiene sus actas, tareas y archivos',()=>{
 const db=scoped();db.projects.push(project('otro'));const m={id:'m',projectId:'p',title:'Reunión',date:'2026-11-24',time:'10:00',attendees:'Socios',location:''};db.meetings=[m];db.minutes=[{id:'a',projectId:'p',meetingId:'m',title:'Acta',body:'Temas',decisions:'Acuerdos'}];db.tasks=[{id:'t',projectId:'p',meetingId:'m',title:'Tarea',owner:'Socio 1',due:'2026-11-25',done:false}];
 const next=upsert(db,'meetings',{...m,status:'Cancelada'},'Cancelada');expect(next.meetings).toHaveLength(1);expect(next.minutes).toEqual(db.minutes);expect(next.tasks).toEqual(db.tasks);expect(()=>upsert(next,'meetings',{...m,projectId:'otro'},'Cambio')).toThrow('Conserva el proyecto');
 });
 it('no permite sobrescribir notas de seguimiento',()=>{const n={id:'n',projectId:'p',entityType:'meeting' as const,entityId:'m',body:'Primera nota',createdAt:'2026-11-24T15:00:00Z'};const base=scoped();base.meetings.push({id:'m',projectId:'p',title:'Reunión',date:'2026-11-24',time:'10:00',attendees:'Socios',location:''});const db=upsert(base,'followUps',n,'Nota');expect(()=>upsert(db,'followUps',{...n,body:'Otra'},'Nota')).toThrow('sin sobrescribir');});
 it('sincroniza completar y reabrir tareas desde los controles existentes',()=>{const task={id:'t',projectId:'p',title:'Tarea',owner:'Socio 1',due:'2026-11-25',done:true,status:'En curso' as const};const next=upsert(scoped(),'tasks',task,'Completada');expect(next.tasks[0].status).toBe('Completada');const reopened=upsert(next,'tasks',{...next.tasks[0],done:false},'Reabierta');expect(reopened.tasks[0].status).toBe('Pendiente');});
});

describe('Papelera de proyectos',()=>{
 it('permite borrar y restaurar sin perder relaciones ni historial',()=>{
  const db=scoped();db.tasks=[{id:'t',projectId:'p',title:'Preparar',owner:'Socio 1',due:'',done:false}];db.meetings=[{id:'m',projectId:'p',title:'Revisión',date:'2026-12-01',time:'10:00',attendees:'Equipo',location:''}];db.documents=[{id:'d',projectId:'p',title:'Alcance',version:1,filename:'alcance.txt',createdAt:'',content:'Original',status:'Borrador'}];
  const trashed=upsert(db,'projects',{...db.projects[0],deletedAt:'2026-11-25T00:00:00.000Z'},'Proyecto en papelera');
  expect(trashed.projects[0].deletedAt).toBeTruthy();expect(trashed.tasks).toEqual(db.tasks);expect(trashed.meetings).toEqual(db.meetings);expect(trashed.documents).toEqual(db.documents);
  const restored=upsert(trashed,'projects',{...trashed.projects[0],deletedAt:undefined},'Proyecto restaurado');
  expect(restored.projects).toHaveLength(1);expect(restored.projects[0].id).toBe('p');expect(restored.projects[0].deletedAt).toBeUndefined();expect(restored.activity).toHaveLength(2);expect(restored.activity[1].description).toBe('Proyecto en papelera');expect(restored.tasks).toEqual(db.tasks);
 });
});


describe('Autoría local del LOG',()=>{
 it('captura ID y nombre al guardar sin reatribuir entradas anteriores',()=>{
  const db=scoped();db.activity=[{id:'legacy',projectId:'p',description:'Anterior',at:'2026-11-24T15:00:00Z',actor:'Sesión local'}];
  const first=upsert(db,'projects',{...db.projects[0],name:'Editado'},'Cambio',{id:'partner-brian',name:'Brian Cobaleda'});
  const second=upsert(first,'projects',{...first.projects[0],name:'Editado otra vez'},'Otro cambio',{id:'partner-keyla',name:'Keyla Ortiza'});
  expect(second.activity[0]).toMatchObject({actorId:'partner-keyla',actor:'Keyla Ortiza'});
  expect(second.activity[1]).toMatchObject({actorId:'partner-brian',actor:'Brian Cobaleda'});
  expect(second.activity[2]).toEqual(db.activity[0]);
 });
 it('conserva al autor y distingue cálculos derivados y duplicaciones',()=>{
  const db=scoped();db.tasks=[{id:'root',projectId:'p',title:'Principal',owner:'Socio 1',due:'2026-12-01',done:false}];
  const author={id:'partner-keyla',name:'Keyla Ortiza'};
  const next=upsert(db,'tasks',{id:'child',parentId:'root',projectId:'p',title:'Subtarea',owner:'Socio 1',due:'2026-12-01',done:true},'Completada',author);
  expect(next.activity[0]).toMatchObject({actorId:author.id,actor:author.name,origin:'Cálculo local'});
  const copy=duplicateProject(next,'p','Copia',{tasks:true,quotes:false},author);
  const newEntries=copy.db.activity.filter(a=>!next.activity.some(old=>old.id===a.id));
  expect(newEntries.length).toBeGreaterThan(1);expect(newEntries.every(a=>a.actorId===author.id&&a.actor===author.name)).toBe(true);
 });
});
