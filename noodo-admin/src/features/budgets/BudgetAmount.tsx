import {useState} from 'react';
import {Pencil} from 'lucide-react';
import type {Budget} from '../../data/types';
import {useStore} from '../../data/Store';
import {budgetMetrics} from '../../data/budgets';
import {money} from '../../lib/format';
import {Field,FormActions,IconButton,Alert} from '../../components/ui';
import {Dialog} from '../../components/ui/Dialog';

export function BudgetAmount({budget,categoryId,hideLabel=false}:{budget:Budget;categoryId?:string;hideLabel?:boolean}){
 const {save}=useStore();const [open,setOpen]=useState(false);const [value,setValue]=useState('');const [error,setError]=useState('');
 const category=budget.categories.find(c=>c.id===categoryId);const amount=category?.allocatedAmount??budgetMetrics(budget).total;
 const label=category?`Editar asignación de ${category.name}`:'Editar monto del presupuesto';
 return <div className="budget-metric">{!hideLabel&&<span className="meta">{category?'Asignado':'Presupuesto'}</span>}<div className="budget-editable-amount"><strong>{money(amount)}</strong>{!budget.archivedAt&&!budget.deletedAt&&<IconButton label={label} onClick={()=>{setValue(String(category?.allocatedAmount??budget.totalBudget??''));setError('');setOpen(true);}}><Pencil size={14}/></IconButton>}</div>
 {open&&<Dialog title={label} onClose={()=>setOpen(false)} protectChanges><form onSubmit={e=>{e.preventDefault();try{save('budgets',category?{...budget,categories:budget.categories.map(c=>c.id===category.id?{...c,allocatedAmount:Number(value)}:c)}:{...budget,totalBudget:value===''?undefined:Number(value)},label);setOpen(false);}catch(e){setError((e as Error).message);}}}><Field autoFocus label={category?'Monto asignado (COP)':'Monto total (COP)'} type="number" required={!!category} min="0" step="0.01" value={value} onChange={e=>setValue(e.target.value)} hint={category?undefined:'Vacío o cero: se usa la suma de las categorías.'}/>{error&&<Alert kind="error">{error}</Alert>}<FormActions onCancel={()=>setOpen(false)}/></form></Dialog>}
 </div>;
}
