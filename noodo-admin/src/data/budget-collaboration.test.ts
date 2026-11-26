import {describe,it,expect} from 'vitest';
import {emptyDatabase,sampleDatabase} from './seed';
import {upsert,normalizeDatabase} from './repository';
import {budgetPlanSnapshot,createBudgetApproval} from './budget-approvals';
import {duplicateBudget} from './budgets';
import {mentionTarget} from '../lib/mentions';
import {buildSearchIndex} from '../lib/search';
import type {Budget} from './types';

const budget=():Budget=>({id:'budget',name:'Producción',totalBudget:2000000,createdAt:'2026-11-26',categories:[],categoryGroups:[],expenses:[]});
function fixture(){const db=emptyDatabase();db.budgets=[budget()];return db;}
describe('Comentarios y aprobación local de presupuestos',()=>{
 it('conserva comentarios generales sin inventar proyectos, con menciones y destino propio',()=>{
  let db=fixture();const person=db.partners[1];
  const note={id:'note',projectId:'',entityType:'budget' as const,entityId:'budget',body:`@${person.name} revisa el monto`,createdAt:'2026-11-26T12:00:00Z'};
  db=upsert(db,'followUps',note,'Comentario');
  expect(db.followUps[0].mentions).toEqual([{partnerId:person.id,name:person.name}]);
  const restored=normalizeDatabase(JSON.parse(JSON.stringify(db)));
  expect(restored.projects).toEqual([]);expect(restored.followUps).toEqual(db.followUps);
  expect(mentionTarget(note)).toBe('/presupuestos/budget#comment-note');
  expect(buildSearchIndex(restored).find(row=>row.id==='Seguimiento:note')?.url).toBe('/presupuestos/budget#comment-note');
  expect(()=>upsert(db,'followUps',{...note,body:'Reemplazo'},'Editar')).toThrow('sin sobrescribir');
  expect(()=>upsert(db,'followUps',{...note,id:'bad',entityId:'missing'},'Comentario')).toThrow('presupuesto indicado');
 });
 it('mantiene el hilo y la procedencia al vincular o desvincular el presupuesto',()=>{
  let db=fixture();db.projects=sampleDatabase().projects;
  db=upsert(db,'followUps',{id:'first',projectId:'',entityType:'budget',entityId:'budget',body:'Comentario general',createdAt:'2026-11-26'},'Nota');
  db=upsert(db,'budgets',{...db.budgets[0],projectId:'p1'},'Vincular');
  db=upsert(db,'followUps',{id:'second',projectId:'p1',entityType:'budget',entityId:'budget',body:'Comentario vinculado',createdAt:'2026-11-26'},'Nota');
  db=upsert(db,'budgets',{...db.budgets[0],projectId:undefined},'Desvincular');
  const restored=normalizeDatabase(db);
  expect(restored.followUps).toEqual(db.followUps);expect(restored.followUps.map(n=>n.projectId)).toEqual(['','p1']);
 });
 it('registra autor y plan, conserva historial y exige revisión tras cambiar el monto',()=>{
  let db=fixture();const author=db.partners[0];const entry=createBudgetApproval(db.budgets[0],author);
  db=upsert(db,'budgets',{...db.budgets[0],approvals:[entry]},'Aprobación',author);
  expect(db.activity[0]).toMatchObject({actorId:author.id,after:{approvals:[entry]}});
  expect(entry.plan).toBe(budgetPlanSnapshot(db.budgets[0]));
  db=upsert(db,'budgets',{...db.budgets[0],totalBudget:3000000},'Cambiar monto',author);
  expect(entry.plan).not.toBe(budgetPlanSnapshot(db.budgets[0]));
  expect(db.budgets[0].approvals).toEqual([entry]);
  expect(()=>upsert(db,'budgets',{...db.budgets[0],approvals:[]},'Borrar')).toThrow('Conserva');
  expect(()=>upsert(db,'budgets',{...db.budgets[0],approvals:[{...entry,partnerName:'Otra persona'}]},'Reescribir')).toThrow('Conserva');
  expect(duplicateBudget(db.budgets[0],'Copia').approvals).toBeUndefined();
  expect(normalizeDatabase(JSON.parse(JSON.stringify(db))).budgets[0].approvals).toEqual([entry]);
 });
 it('rechaza atribuciones ajenas o planes desactualizados y no invalida por preferencias',()=>{
  const db=fixture();const author=db.partners[0];const original=budget();const entry=createBudgetApproval(original,author);
  expect(()=>upsert(db,'budgets',{...original,approvals:[entry]},'Aprobación',db.partners[1])).toThrow('socio activo');
  expect(()=>upsert(db,'budgets',{...original,totalBudget:1,approvals:[entry]},'Aprobación',author)).toThrow('presupuesto actual');
  expect(budgetPlanSnapshot({...original,isPinned:true,isActive:true,archivedAt:'2026-11-26'})).toBe(entry.plan);
  expect(budgetPlanSnapshot({...original,categories:[{id:'c',name:'Sonido',allocatedAmount:100,color:'accent'}]})).not.toBe(entry.plan);
 });
});
