import type {Activity} from './types';

// Creation history is the source of authorship; later editors are not creators.
export function budgetCreator(budgetId:string,activity:Activity[]):string {
 const creation=activity.filter(entry=>entry.collection==='budgets'&&entry.recordId===budgetId&&entry.action==='Creación')
  .sort((a,b)=>a.at.localeCompare(b.at))[0];
 if(!creation?.actor||['Sesión local','Migración local','Cálculo local'].includes(creation.actor))return 'Autor no registrado';
 return creation.actor;
}
