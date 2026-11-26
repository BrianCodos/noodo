import {describe,it,expect} from 'vitest';
import type {Budget,MoneySource} from './types';
import {budgetGroupMetrics,budgetTrend,emptyBudgetFilters,filterBudgetExpenses,moveBudgetRows} from './budget-views';
import {budgetMetrics} from './budgets';

const budget:Budget={id:'b',name:'Sesión',createdAt:'2026-11-26',totalBudget:1000,
 categoryGroups:[{id:'g',budgetId:'b',name:'Producción',color:'accent'}],
 categories:[{id:'c1',name:'Sonido',allocatedAmount:600,groupId:'g',color:'accent'},{id:'c2',name:'Difusión',allocatedAmount:300,color:'info',isCompleted:true}],
 expenses:[
  {id:'e1',description:'Alquiler',amount:120.25,date:'2026-11-26',categoryId:'c1',moneySourceId:'s',isProjected:false},
  {id:'e2',description:'Micrófono',amount:79.75,date:'2026-11-26',categoryId:'c1',isProjected:true},
  {id:'e3',description:'Pauta',amount:50,date:'2026-10-28',categoryId:'c2',isProjected:false},
  {id:'e4',description:'Anterior',amount:900,date:'2026-10-27',categoryId:'c1',isProjected:false,voidedAt:'2026-10-27'},
  {id:'e5',description:'Futuro',amount:20,date:'2026-11-27',categoryId:'c2',isProjected:true}
 ]};
const sources:MoneySource[]=[{id:'s',name:'Caja producción',type:'cash',balance:1000}];
describe('Paridad funcional del presupuesto con Monymi, conservando reglas NOODO',()=>{
 it('reordena hermanos visibles sin desplazar categorías de otros grupos o retiradas',()=>{
  const rows=[{id:'a'},{id:'other-group'},{id:'retired'},{id:'b'}];
  expect(moveBudgetRows(rows,['a','b'],'b',-1).map(r=>r.id)).toEqual(['b','other-group','retired','a']);
  expect(moveBudgetRows(rows,['a','b'],'a',-1)).toBe(rows);expect(rows[0].id).toBe('a');
 });
 it('iguala total, asignación, compromiso y saldo del escenario de referencia',()=>{
  // Monymi computeBudgetMetrics: asignado=1000, categorías=900,
  // gasto efectivo=200 + max(300,70)=500, disponible=500, saldo=100.
  expect(budgetMetrics(budget)).toMatchObject({total:1000,allocated:900,committed:500,available:500,unassigned:100,actual:170.25,projected:99.75});
  expect(budgetGroupMetrics(budget,'g')).toEqual({count:1,allocated:600,actual:120.25,projected:79.75,committed:200,available:400});
  expect(budgetGroupMetrics(budget)).toMatchObject({count:1,allocated:300,committed:300,available:0});
 });
 it('combina filtros inclusivos de categoría, grupo, cuenta, fechas e importe y busca metadatos',()=>{
  const filters={...emptyBudgetFilters(),groups:['g'],categories:['c1'],sources:['s'],from:'2026-11-26',to:'2026-11-26',min:'120.25',max:'120.25'};
  expect(filterBudgetExpenses(budget,sources,'produccion',filters).map(e=>e.id)).toEqual(['e1']);
  expect(filterBudgetExpenses(budget,sources,'sonido',{...filters,sources:['none'],min:'',max:''}).map(e=>e.id)).toEqual(['e2']);
  expect(filterBudgetExpenses(budget,sources,'',{...emptyBudgetFilters(),groups:['g','none'],sources:['s','none']}).map(e=>e.id)).toEqual(['e5','e1','e2','e3']);
  expect(filterBudgetExpenses(budget,sources,'inexistente',emptyBudgetFilters())).toEqual([]);
  expect(filterBudgetExpenses(budget,sources,'',emptyBudgetFilters())).toHaveLength(4);
 });
 it('separa reales, proyectados y anulados sin modificar los registros',()=>{
  expect(filterBudgetExpenses(budget,sources,'',{...emptyBudgetFilters(),status:'Reales'}).map(e=>e.id)).toEqual(['e1','e3']);
  expect(filterBudgetExpenses(budget,sources,'',{...emptyBudgetFilters(),status:'Proyectados'}).map(e=>e.id)).toEqual(['e5','e2']);
  expect(filterBudgetExpenses(budget,sources,'',{...emptyBudgetFilters(),status:'Anulados'}).map(e=>e.id)).toEqual(['e4']);
  expect(budget.expenses[0].id).toBe('e1');expect(budget.expenses).toHaveLength(5);
 });
 it('construye 30 días consecutivos con ceros, límites de fecha y proyecciones separados',()=>{
  const rows=budgetTrend(budget,'2026-11-26');
  expect(rows).toHaveLength(30);expect(rows[0]).toMatchObject({date:'2026-10-28',total:50});
  expect(rows.at(-1)).toMatchObject({date:'2026-11-26',actual:120.25,projected:79.75,total:200});
  expect(rows.reduce((n,r)=>n+r.total,0)).toBe(250);expect(rows[1].total).toBe(0);
  expect(budgetTrend(budget,'2026-11-26',['c2']).reduce((n,r)=>n+r.total,0)).toBe(50);
  const leap=budgetTrend({...budget,expenses:[]},'2024-03-01');expect(leap.some(d=>d.date==='2024-02-29')).toBe(true);
 });
});
