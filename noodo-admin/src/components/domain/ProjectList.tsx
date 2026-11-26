import {PrioritySelect} from './PrioritySelect';
import {Fragment,useState} from 'react';
import {Link} from 'react-router-dom';
import {ChevronDown,ChevronRight,CornerDownRight,Eye,Pencil,Trash2,RotateCcw} from 'lucide-react';
import type {Project,Task} from '../../data/types';
import {useStore} from '../../data/Store';
import {DataTable} from '../ui/DataTable';
import {Alert,Avatar,Badge,IconButton,StatusBadge} from '../ui';
import {dateLabel} from '../../lib/format';
import {ownership} from '../../data/partners';
import {taskProgress} from '../../lib/task-progress';
export function ProjectList({projects,onEdit,onDelete,onRestore}:{projects:Project[];onEdit:(project:Project)=>void;onDelete:(project:Project)=>void;onRestore:(project:Project)=>void}){
 const {db,save}=useStore();const [error,setError]=useState('');
 function owners(record:Project|Task){const assignment=ownership(record,db.partners);const people=assignment.partnerIds.map(id=>db.partners.find(p=>p.id===id)).filter(p=>!!p);return <span className="responsible-avatars" role="group" aria-label={`Responsable: ${assignment.owner||'Sin asignar'}`}>{people.length?people.map(p=><Avatar key={p.id} name={p.name} photo={p.photo}/>):<Avatar name={record.owner||'Sin asignar'}/>}</span>;}
 function priority(record:Project|Task,collection:'projects'|'tasks') {const name='name' in record?record.name:record.title;return <PrioritySelect value={record.priority||(collection==='tasks'?'Media':undefined)} label={`Prioridad de ${name}`} disabled={'deletedAt' in record&&!!record.deletedAt} onChange={value=>{try{save(collection,{...record,priority:value},`Prioridad actualizada: ${name}`);setError('');}catch(e){setError((e as Error).message);}}}/>;}

 const [expandedProjects,setExpandedProjects]=useState<string[]>([]);
 const [expandedTasks,setExpandedTasks]=useState<string[]>([]);
 const toggleProject=(id:string)=>setExpandedProjects(ids=>ids.includes(id)?ids.filter(value=>value!==id):[...ids,id]);
 const toggleTask=(id:string)=>setExpandedTasks(ids=>ids.includes(id)?ids.filter(value=>value!==id):[...ids,id]);
 function taskRow(task:Task,all:Task[],child=false){
  const children=all.filter(t=>t.parentId===task.id);
  const expanded=expandedTasks.includes(task.id);
  const progress=taskProgress(task,all);
  const status=task.done?'Completada':task.status==='En curso'?'En curso':'Pendiente';
  return <tr key={task.id} className={`project-list-task ${child?'project-list-subtask':''}`}>
   <td data-label={child?'Subtarea':'Tarea'}><div className="hierarchy-name">
    {children.length?<IconButton label={`${expanded?'Ocultar':'Mostrar'} subtareas de ${task.title}`} aria-expanded={expanded} onClick={()=>toggleTask(task.id)}>{expanded?<ChevronDown size={16}/>:<ChevronRight size={16}/>}</IconButton>:<span className="hierarchy-leaf" aria-hidden="true"><CornerDownRight size={16}/></span>}
    <Link className="table-title" to={`/registros/tasks/${task.id}`}>{task.title}<span>{child?'Subtarea':'Tarea'} · {progress}%{children.length?` · ${children.length} ${children.length===1?'subtarea':'subtareas'}`:''}</span></Link>
   </div></td>
   <td data-label="Estado"><Badge tone={task.done?'success':status==='En curso'?'accent':'neutral'}>{status}</Badge></td>
   <td data-label="Responsable">{owners(task)}</td><td data-label="Prioridad">{priority(task,'tasks')}</td>
   <td data-label="Fecha límite">{dateLabel(task.due)}</td><td data-label="Acciones"><Link className="icon-button" to={`/registros/tasks/${task.id}`} aria-label={`Ver tarea ${task.title}`} title="Ver tarea"><Eye size={16}/></Link></td>
  </tr>;
 }
 return <>{error&&<Alert kind="error">{error}</Alert>}<section className="panel hierarchical-projects" aria-label="Lista de proyectos con tareas y subtareas"><DataTable rows={projects} columns={[
  {key:'name',title:'Proyecto / tarea',sortValue:p=>p.name,render:p=>{const expanded=expandedProjects.includes(p.id);const count=db.tasks.filter(t=>t.projectId===p.id&&!t.parentId).length;return <div className="hierarchy-name"><IconButton label={`${expanded?'Ocultar':'Mostrar'} tareas de ${p.name}`} aria-expanded={expanded} onClick={()=>toggleProject(p.id)}>{expanded?<ChevronDown size={18}/>:<ChevronRight size={18}/>}</IconButton><Link className="table-title project-title-link" aria-label={`Abrir proyecto ${p.name}`} to={`/proyectos/${p.id}`}>{p.name}<span>{p.client} · {count} {count===1?'tarea':'tareas'}</span></Link></div>; }},
  {key:'status',title:'Estado',render:p=><StatusBadge status={p.status}/>},
  {key:'owner',title:'Responsable',render:p=>owners(p)},
  {key:'priority',title:'Prioridad',sortValue:p=>({Baja:1,Media:2,Alta:3}[p.priority!]||0),render:p=>priority(p,'projects')},
  {key:'date',title:'Fecha objetivo',sortValue:p=>p.deadline,render:p=>dateLabel(p.deadline)},
  {key:'actions',title:'Acciones',render:p=><div className="project-row-actions"><Link className="icon-button" to={`/proyectos/${p.id}`} aria-label={`Ver proyecto ${p.name}`} title="Ver proyecto"><Eye size={16}/></Link>{p.deletedAt?<IconButton label={`Restaurar proyecto ${p.name}`} onClick={()=>onRestore(p)}><RotateCcw size={16}/></IconButton>:<><IconButton label={`Editar proyecto ${p.name}`} onClick={()=>onEdit(p)}><Pencil size={16}/></IconButton><IconButton label={`Borrar proyecto ${p.name}`} onClick={()=>onDelete(p)}><Trash2 size={16}/></IconButton></>}</div>}
 ]} renderAfterRow={p=>{
  if(!expandedProjects.includes(p.id))return null;
  const all=db.tasks.filter(t=>t.projectId===p.id);const roots=all.filter(t=>!t.parentId);
  if(!roots.length)return <tr className="project-list-empty"><td colSpan={6}><span>Este proyecto todavía no tiene tareas.</span><Link className="text-link" to={`/proyectos/${p.id}/tareas`}>Ir a tareas</Link></td></tr>;
  return roots.map(task=><Fragment key={task.id}>{taskRow(task,all)}{expandedTasks.includes(task.id)&&all.filter(t=>t.parentId===task.id).map(child=>taskRow(child,all,true))}</Fragment>);
 }}/></section></>;
}
