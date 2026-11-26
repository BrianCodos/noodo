import type {Budget,MoneySource} from './types';
import {categoryMetrics,cents} from './budgets';
import {matches} from '../lib/format';

export interface BudgetFilters {groups:string[];categories:string[];sources:string[];from:string;to:string;min:string;max:string;status:string}
export const emptyBudgetFilters=():BudgetFilters=>({groups:[],categories:[],sources:[],from:'',to:'',min:'',max:'',status:'Todos'});
export const inBudgetGroups=(groupId:string|undefined,groups:string[])=>!groups.length||groups.includes(groupId||'none');
// Reorder the displayed siblings without moving hidden or retired records.
export function moveBudgetRows<T extends {id:string}>(all:T[],visibleIds:string[],id:string,direction:number):T[]{
 const visible=new Set(visibleIds);const siblings=all.filter(row=>visible.has(row.id));
 const index=siblings.findIndex(row=>row.id===id),target=index+direction;
 if(index<0||target<0||target>=siblings.length)return all;
 [siblings[index],siblings[target]]=[siblings[target],siblings[index]];
 let next=0;return all.map(row=>visible.has(row.id)?siblings[next++]:row);
}
export function filterBudgetExpenses(budget:Budget,sources:MoneySource[],query:string,filters:BudgetFilters){
 return budget.expenses.filter(e=>{
  const category=budget.categories.find(c=>c.id===e.categoryId);const source=sources.find(s=>s.id===e.moneySourceId);
  return matches([e.description,category?.name,source?.name].join(' '),query)
   &&inBudgetGroups(category?.groupId,filters.groups)
   &&(!filters.categories.length||filters.categories.includes(e.categoryId))
   &&(!filters.sources.length||filters.sources.includes(e.moneySourceId||'none'))
   &&(!filters.from||e.date>=filters.from)&&(!filters.to||e.date<=filters.to)
   &&(filters.min===''||cents(e.amount)>=cents(Number(filters.min)))&&(filters.max===''||cents(e.amount)<=cents(Number(filters.max)))
   &&(filters.status==='Anulados'?!!e.voidedAt:!e.voidedAt&&(filters.status==='Todos'||(filters.status==='Proyectados'?e.isProjected:!e.isProjected)));
 }).sort((a,b)=>b.date.localeCompare(a.date));
}
export function budgetGroupMetrics(budget:Budget,groupId?:string){
 const rows=budget.categories.filter(c=>!c.deletedAt&&(c.groupId||'')===(groupId||''));
 const metrics=rows.map(c=>categoryMetrics(budget,c.id));
 const sum=(key:'allocated'|'actual'|'projected'|'committed')=>metrics.reduce((total,row)=>total+cents(row[key]),0)/100;
 const allocated=sum('allocated'),committed=sum('committed');
 return {count:rows.length,allocated,actual:sum('actual'),projected:sum('projected'),committed,available:(cents(allocated)-cents(committed))/100};
}
export function budgetTrend(budget:Budget,endDate:string,categoryIds?:string[]){
 const end=new Date(`${endDate}T12:00:00Z`);
 return Array.from({length:30},(_,index)=>{
  const day=new Date(end);day.setUTCDate(end.getUTCDate()-29+index);const date=day.toISOString().slice(0,10);
  const rows=budget.expenses.filter(e=>!e.voidedAt&&e.date===date&&(!categoryIds||categoryIds.includes(e.categoryId)));
  const actual=rows.filter(e=>!e.isProjected).reduce((n,e)=>n+cents(e.amount),0)/100;
  const projected=rows.filter(e=>e.isProjected).reduce((n,e)=>n+cents(e.amount),0)/100;
  return {id:date,date,actual,projected,total:(cents(actual)+cents(projected))/100};
 });
}
