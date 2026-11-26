import {Plus} from 'lucide-react';
import {Button,SearchField} from '../ui';
export function TaskToolbar({progress,completed,total,subtasks,query,onQuery,onCreate,filtered,onClear}:{progress:number;completed:number;total:number;subtasks:number;query:string;onQuery:(value:string)=>void;onCreate:()=>void;filtered:boolean;onClear:()=>void}) {
 return <div className="task-toolbar" role="group" aria-label="Controles de tareas"><h2>Tareas y entregables</h2><div className="task-toolbar-progress" title="Avance del proyecto"><progress value={progress} max={100} aria-label="Avance del proyecto"/><strong>{progress}%</strong></div><span className="meta">{completed}/{total} tareas · {subtasks} subtareas</span><div className="task-toolbar-search"><SearchField value={query} onChange={onQuery} placeholder="Buscar tarea…"/></div>{filtered&&<Button variant="ghost" onClick={onClear}>Limpiar filtros</Button>}<Button onClick={onCreate}><Plus size={17}/>Nueva tarea</Button></div>;
}
export function ColumnFilter({label,value,onChange,options}:{label:string;value:string;onChange:(value:string)=>void;options:{value:string;label:string}[]}) {
 return <select className="column-filter" aria-label={`Filtrar por ${label.toLowerCase()}`} title={`Filtrar por ${label.toLowerCase()}`} data-active={value!=='Todos'} value={value} onChange={e=>onChange(e.target.value)}><option value="Todos">{label} · Todos</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>;
}
