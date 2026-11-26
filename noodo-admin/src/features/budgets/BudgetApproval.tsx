import {useState} from 'react';
import {CheckCircle2} from 'lucide-react';
import type {Budget} from '../../data/types';
import {useStore} from '../../data/Store';
import {budgetPlanSnapshot,createBudgetApproval} from '../../data/budget-approvals';
import {Button,Alert} from '../../components/ui';
import {Dialog} from '../../components/ui/Dialog';

const when=(value:string)=>new Date(value).toLocaleString('es-CO',{timeZone:'America/Bogota',dateStyle:'medium',timeStyle:'short'});
export function BudgetApprovalStatus({budget}:{budget:Budget}){
 const {activePartner,save}=useStore();const [open,setOpen]=useState(false);const [error,setError]=useState('');
 const history=budget.approvals||[];const plan=budgetPlanSnapshot(budget);
 const current=history.filter(a=>a.plan===plan);
 const already=current.some(a=>a.partnerId===activePartner?.id);
 const locked=!!budget.deletedAt||!!budget.archivedAt;
 return <section className="budget-approval" aria-label="Aprobación del presupuesto">
  <div><span className="meta">Aprobación · registro local</span>
   {current.length?current.map(entry=><p key={entry.id}><CheckCircle2 size={16} aria-hidden="true"/><strong>Aprobado por {entry.partnerName}</strong><span className="meta">{when(entry.approvedAt)}</span></p>):<p><strong>{history.length?'Requiere nueva revisión':'Sin aprobación registrada'}</strong></p>}
  </div>
  <Button variant="ghost" onClick={()=>{setError('');setOpen(true);}}>{current.length||history.length?'Ver aprobación':'Registrar aprobación'}</Button>
  {open&&<Dialog title="Aprobación del presupuesto" onClose={()=>setOpen(false)}>
   <p>La aprobación registra al socio activo y la fecha para el monto y la estructura actuales del presupuesto.</p>
   <p className="meta space-top">Registro local de revisión; no es una firma electrónica ni una identidad verificada. Cambiar el proyecto, monto o estructura requiere una nueva revisión.</p>
   {history.length>0&&<div className="space-top">{[...history].reverse().map(entry=><article className="record-entry" key={entry.id}><strong>{entry.partnerName}</strong><p className="meta">{when(entry.approvedAt)} · {entry.plan===plan?'Plan actual':'Plan anterior'}</p></article>)}</div>}
   {error&&<Alert kind="error">{error}</Alert>}
   <div className="form-actions"><Button variant="secondary" onClick={()=>setOpen(false)}>Cerrar</Button>
    {!locked&&<Button disabled={!activePartner||already} onClick={()=>{if(!activePartner)return;try{save('budgets',{...budget,approvals:[...history,createBudgetApproval(budget,activePartner)]},`Aprobación local de ${budget.name} por ${activePartner.name}`);setOpen(false);}catch(e){setError((e as Error).message);}}}>{already?'Aprobación registrada':`Registrar aprobación como ${activePartner?.name||'socio activo'}`}</Button>}
   </div>
  </Dialog>}
 </section>;
}
