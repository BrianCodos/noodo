import {useState} from 'react';
import {Filter} from 'lucide-react';
import type {Budget,MoneySource} from '../../data/types';
import {emptyBudgetFilters,type BudgetFilters} from '../../data/budget-views';
import {Button,Field,Select,Alert} from '../../components/ui';
import {Dialog} from '../../components/ui/Dialog';

export function BudgetFilterControl({budget,sources,value,onChange,movements}:{budget:Budget;sources:MoneySource[];value:BudgetFilters;onChange:(value:BudgetFilters)=>void;movements:boolean}){
 const [draft,setDraft]=useState(value);const [open,setOpen]=useState(false);const [error,setError]=useState('');
 const count=value.groups.length+(movements?value.categories.length+value.sources.length+[value.from,value.to,value.min,value.max,value.status==='Todos'?'':value.status].filter(Boolean).length:0);
 const toggle=(key:'groups'|'categories'|'sources',id:string)=>setDraft(d=>({...d,[key]:d[key].includes(id)?d[key].filter(v=>v!==id):[...d[key],id]}));
 const choices=(label:string,key:'groups'|'categories'|'sources',options:{id:string;name:string}[])=><fieldset className="budget-filter-options"><legend>{label}</legend>{options.map(option=><label key={option.id}><input type="checkbox" checked={draft[key].includes(option.id)} onChange={()=>toggle(key,option.id)}/>{option.name}</label>)}</fieldset>;
 return <><Button variant="secondary" onClick={()=>{setDraft(value);setError('');setOpen(true);}}><Filter size={16}/>Filtros{count?` (${count})`:''}</Button>{count>0&&<Button variant="ghost" onClick={()=>onChange(emptyBudgetFilters())}>Limpiar filtros</Button>}
 {open&&<Dialog title="Filtrar presupuesto" onClose={()=>setOpen(false)}><form onSubmit={e=>{e.preventDefault();if(movements&&draft.from&&draft.to&&draft.from>draft.to)return setError('La fecha inicial debe ser anterior o igual a la final.');if(movements&&draft.min!==''&&draft.max!==''&&Number(draft.min)>Number(draft.max))return setError('El importe mínimo no puede superar el máximo.');onChange(draft);setOpen(false);}}>
 <p className="meta">Sin selección se incluyen todas las opciones.</p>
 {choices('Grupos','groups',[...budget.categoryGroups.filter(g=>!g.deletedAt),{id:'none',name:'Sin grupo'}])}
 {movements&&<>{choices('Categorías','categories',budget.categories.filter(c=>!c.deletedAt||budget.expenses.some(e=>e.categoryId===c.id)).map(c=>({id:c.id,name:c.name+(c.deletedAt?' (retirada)':'')})))}
 {choices('Cuentas de pago','sources',[...sources.filter(s=>budget.expenses.some(e=>e.moneySourceId===s.id)),{id:'none',name:'Sin cuenta vinculada'}])}
 <div className="form-grid"><Field label="Desde" type="date" value={draft.from} onChange={e=>setDraft({...draft,from:e.target.value})}/><Field label="Hasta" type="date" value={draft.to} onChange={e=>setDraft({...draft,to:e.target.value})}/><Field label="Importe mínimo (COP)" type="number" min="0" step="0.01" value={draft.min} onChange={e=>setDraft({...draft,min:e.target.value})}/><Field label="Importe máximo (COP)" type="number" min="0" step="0.01" value={draft.max} onChange={e=>setDraft({...draft,max:e.target.value})}/></div>
 <Select label="Estado de los gastos" value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}>{['Todos','Reales','Proyectados','Anulados'].map(v=><option key={v}>{v}</option>)}</Select></>}
 {error&&<Alert kind="error">{error}</Alert>}<div className="form-actions"><Button type="button" variant="ghost" onClick={()=>{setDraft(emptyBudgetFilters());setError('');}}>Restablecer</Button><Button type="button" variant="secondary" onClick={()=>setOpen(false)}>Cancelar</Button><Button type="submit">Aplicar filtros</Button></div>
 </form></Dialog>}</>;
}
