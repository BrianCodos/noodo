import {useState,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {Link2,Unlink,Eye,Wallet} from 'lucide-react';
import {useStore} from '../../data/Store';
import {budgetMetrics} from '../../data/budgets';
import {money,matches} from '../../lib/format';
import {Button,IconButton,SectionHeader,Select,SearchField,Alert,Badge,EmptyState,FormActions} from '../../components/ui';
import {DataTable} from '../../components/ui/DataTable';
import {Dialog} from '../../components/ui/Dialog';
import {Workspace,DetailPanel} from '../../components/ui/DetailPanel';
export function ProjectBudgets({projectId,legacy}:{projectId:string;legacy?:ReactNode}){
 const {db,save}=useStore();const [assign,setAssign]=useState(false);const [selected,setSelected]=useState('');const [query,setQuery]=useState('');const [error,setError]=useState('');
 const linked=db.budgets.filter(b=>b.projectId===projectId&&!b.deletedAt);const available=db.budgets.filter(b=>!b.projectId&&!b.deletedAt&&!b.archivedAt);const rows=linked.filter(b=>matches(b.name,query));
 return <><SectionHeader title="Presupuestos del proyecto" action={<Button onClick={()=>{setError('');setSelected('');setAssign(true);}}><Link2 size={18}/>Asignar presupuesto</Button>}/><p className="meta">Crea primero el presupuesto en Presupuestos y asígnalo aquí para consultar su ejecución.</p><div className="filter-bar space-top"><SearchField placeholder="Buscar presupuesto…" value={query} onChange={setQuery}/><Link className="button button-ghost" to="/presupuestos"><Wallet size={16}/>Ir a Presupuestos</Link></div>{error&&!assign&&<Alert kind="error">{error}</Alert>}<Workspace detail={<DetailPanel title="Presupuestos vinculados"><p>Los importes, categorías y gastos se actualizan desde el presupuesto original.</p><p className="meta space-top">Desvincular retira el presupuesto de este proyecto y conserva sus datos en Presupuestos.</p></DetailPanel>}>
 {linked.length?<section className="panel"><DataTable rows={rows} columns={[
 {key:'name',title:'Presupuesto',sortValue:b=>b.name,render:b=><Link className="table-title" to={`/presupuestos/${b.id}`}>{b.name}</Link>},
 {key:'total',title:'Monto total',render:b=>money(budgetMetrics(b).total)},
 {key:'actual',title:'Gasto real',render:b=>money(budgetMetrics(b).actual)},
 {key:'projected',title:'Proyectado',render:b=>money(budgetMetrics(b).projected)},
 {key:'available',title:'Disponible',render:b=>money(budgetMetrics(b).available)},
 {key:'state',title:'Estado',render:b=><Badge tone={b.archivedAt?'neutral':'accent'}>{b.archivedAt?'Archivado':'Activo'}</Badge>},
 {key:'actions',title:'Acciones',render:b=><div className="inline"><Link className="icon-button" title="Ver presupuesto" aria-label={`Ver presupuesto ${b.name}`} to={`/presupuestos/${b.id}`}><Eye size={16}/></Link><IconButton label={`Desvincular presupuesto ${b.name}`} onClick={()=>{try{save('budgets',{...b,projectId:undefined},`Presupuesto desvinculado del proyecto: ${b.name}`);setError('');}catch(e){setError((e as Error).message);}}}><Unlink size={16}/></IconButton></div>}
 ]}/></section>:<EmptyState title="Sin presupuestos asignados" description="Selecciona un presupuesto existente o crea uno en la sección Presupuestos."/>}
 {legacy&&<details className="legacy-quotes space-top"><summary>Cotizaciones anteriores</summary><div className="space-top">{legacy}</div></details>}
 </Workspace>{assign&&<Dialog title="Asignar presupuesto" onClose={()=>setAssign(false)}><form onSubmit={e=>{e.preventDefault();try{const budget=db.budgets.find(b=>b.id===selected);if(!budget||budget.projectId||budget.deletedAt||budget.archivedAt)throw new Error('Selecciona un presupuesto activo sin proyecto asignado.');save('budgets',{...budget,projectId},`Presupuesto asignado al proyecto: ${budget.name}`);setAssign(false);}catch(e){setError((e as Error).message);}}}>{available.length?<Select label="Presupuesto existente" value={selected} required onChange={e=>setSelected(e.target.value)}><option value="">Selecciona un presupuesto</option>{available.map(b=><option key={b.id} value={b.id}>{b.name} · {money(budgetMetrics(b).total)}</option>)}</Select>:<EmptyState title="No hay presupuestos disponibles" description="Crea uno primero o desvincúlalo de su proyecto actual." action={<Link className="button button-secondary" to="/presupuestos">Ir a Presupuestos</Link>}/>}<p className="meta">Solo se muestran presupuestos activos que aún no están asignados a otro proyecto.</p>{error&&<Alert kind="error">{error}</Alert>}{available.length>0&&<FormActions onCancel={()=>setAssign(false)}/>}</form></Dialog>}</>;
}
