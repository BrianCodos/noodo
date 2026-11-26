import type {Budget,BudgetApproval,Database,Partner} from './types';

// Approval covers the plan, not subsequent expense execution or display preferences.
export function budgetPlanSnapshot(budget:Budget):string {
 const byId=<T extends {id:string}>(rows:T[])=>rows.sort((a,b)=>a.id.localeCompare(b.id));
 return JSON.stringify({name:budget.name,projectId:budget.projectId||'',totalBudget:budget.totalBudget||0,
  categories:byId(budget.categories.filter(c=>!c.deletedAt).map(c=>({id:c.id,name:c.name,allocatedAmount:c.allocatedAmount,groupId:c.groupId||''}))),
  groups:byId(budget.categoryGroups.filter(g=>!g.deletedAt).map(g=>({id:g.id,name:g.name})))
 });
}

export function createBudgetApproval(budget:Budget,partner:Pick<Partner,'id'|'name'>):BudgetApproval {
 return {id:crypto.randomUUID(),partnerId:partner.id,partnerName:partner.name,approvedAt:new Date().toISOString(),plan:budgetPlanSnapshot(budget)};
}

export function validateBudgetApprovals(budget:Budget,db:Database,previous?:Budget,author?:Pick<Partner,'id'|'name'>){
 const entries=budget.approvals||[];
 if(!Array.isArray(entries)||new Set(entries.map(a=>a.id)).size!==entries.length)throw new Error('El historial de aprobación no es válido.');
 if(previous?.approvals?.some(old=>!entries.some(a=>JSON.stringify(a)===JSON.stringify(old))))throw new Error('Conserva el historial de aprobación sin sobrescribirlo.');
 for(const entry of entries.filter(a=>!previous?.approvals?.some(old=>old.id===a.id))){
  if(!author||entry.partnerId!==author.id||entry.partnerName!==author.name||!db.partners.some(p=>p.id===author.id&&p.active))throw new Error('Registra la aprobación con el socio activo.');
  if(budget.deletedAt||budget.archivedAt)throw new Error('Reabre el presupuesto antes de registrar una aprobación.');
  if(!entry.id||!Number.isFinite(Date.parse(entry.approvedAt))||entry.plan!==budgetPlanSnapshot(budget))throw new Error('La aprobación debe corresponder al presupuesto actual.');
 }
}
