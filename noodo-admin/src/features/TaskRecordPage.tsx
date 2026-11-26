import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Link2} from 'lucide-react';
import type {Task} from '../data/types';
import {useStore} from '../data/Store';
import {TaskDetailContent,TaskEditor} from './Tasks';
import {PageHeader,Button,Avatar,SectionHeader,Field} from '../components/ui';
import {Workspace,DetailPanel} from '../components/ui/DetailPanel';
import {Dialog} from '../components/ui/Dialog';
import {FollowUps} from '../components/domain/RecordExtras';
export function TaskRecordPage({task}:{task:Task}){
 const {db,notify}=useStore();const [edit,setEdit]=useState(false);const [link,setLink]=useState('');
 const project=db.projects.find(p=>p.id===task.projectId);const ids=new Set([...(task.partnerIds||[]),...(project?.partnerIds||[])]);const people=db.partners.filter(p=>ids.has(p.id));const children=db.tasks.filter(t=>t.parentId===task.id);
 async function copy(){const url=new URL(`/registros/tasks/${task.id}`,window.location.origin).href;try{await navigator.clipboard.writeText(url);notify('Enlace único de la tarea copiado.');}catch{setLink(url);}}
 return <><PageHeader title={task.title} action={<><Button variant="secondary" onClick={copy} title="Copiar enlace local de esta tarea"><Link2 size={16}/>Copiar enlace</Button><Button onClick={()=>setEdit(true)}>Editar tarea</Button></>}/><Workspace detail={<DetailPanel title="Comentarios de la tarea"><p className="meta">{task.title}</p><div className="task-discussion-people" aria-label="Personas involucradas">{people.map(p=><span key={p.id} title={p.name}><Avatar name={p.name} photo={p.photo} small/></span>)}<span className="meta">{people.length?people.map(p=>p.name).join(' · '):task.owner}</span></div><FollowUps key={task.id} conversation title="Comentarios" entityType="task" entityId={task.id} projectId={task.projectId}/></DetailPanel>}><TaskDetailContent task={task}/>{children.length>0&&<section className="panel panel-padded space-top"><SectionHeader title="Subtareas"/>{children.map(t=><Link key={t.id} className="context-link" to={`/registros/tasks/${t.id}`}>{t.title}</Link>)}</section>}</Workspace>{edit&&<TaskEditor initial={task} projectId={task.projectId} onClose={()=>setEdit(false)}/ >}{link&&<Dialog title="Enlace único de la tarea" onClose={()=>setLink('')}><Field label="Enlace de la tarea" value={link} readOnly onFocus={e=>e.target.select()}/><p className="meta">Este enlace abre la tarea en el entorno local; sus datos siguen guardados en este navegador.</p></Dialog>}</>;
}
