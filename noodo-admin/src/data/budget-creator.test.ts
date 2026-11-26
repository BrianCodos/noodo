import {describe,it,expect} from 'vitest';
import {budgetCreator} from './budget-creator';
import {emptyDatabase} from './seed';
import {upsert} from './repository';
import {duplicateBudget} from './budgets';
import type {Budget} from './types';

describe('Autor de creación del presupuesto',()=>{
 it('conserva el creador ante ediciones y atribuye la copia a quien la crea',()=>{
  let db=emptyDatabase();const [creator,editor]=db.partners;
  const budget:Budget={id:'b',name:'Sesión',createdAt:'2026-11-26',categories:[],categoryGroups:[],expenses:[]};
  db=upsert(db,'budgets',budget,'Crear',creator);
  db=upsert(db,'budgets',{...budget,name:'Sesión editada'},'Editar',editor);
  expect(budgetCreator('b',db.activity)).toBe(creator.name);
  const copy=duplicateBudget(budget,'Copia');db=upsert(db,'budgets',copy,'Duplicar',editor);
  expect(budgetCreator(copy.id,db.activity)).toBe(editor.name);
 });
 it('no atribuye registros anteriores sin evidencia al socio actual ni a un editor',()=>{
  expect(budgetCreator('b',[])).toBe('Autor no registrado');
  expect(budgetCreator('b',[{id:'log',projectId:'',collection:'budgets',recordId:'b',action:'Actualización',actor:'Editora',at:'2026-11-26',description:'Editar'}])).toBe('Autor no registrado');
  expect(budgetCreator('b',[{id:'log',projectId:'',collection:'budgets',recordId:'b',action:'Creación',actor:'Sesión local',at:'2026-11-26',description:'Crear'}])).toBe('Autor no registrado');
 });
});
