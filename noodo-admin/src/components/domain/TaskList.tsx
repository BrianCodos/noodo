import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useStore} from '../../data/Store';
import {dateLabel,today} from '../../lib/format';
import {Alert,EmptyState} from '../ui';
import type {Task} from '../../data/types';
export function TaskList({tasks}:{tasks:Task[]}) {const {db,save}=useStore();const [error,setError]=useState('');if(!tasks.length)return <EmptyState title="Todo al día" description="Los compromisos aparecerán aquí."/>;return <>{error&&<Alert kind="error">{error}</Alert>}<div className="task-list">{tasks.map(t=><div className={`task-row ${t.done?'task-done':''}`} key={t.id}><input type="checkbox" aria-label={`Completar: ${t.title}`} checked={t.done} disabled={db.tasks.some(c=>c.parentId===t.id)} onChange={()=>{try{save('tasks',{...t,done:!t.done},`${!t.done?'Completado':'Reabierto'}: ${t.title}`);setError('');}catch(e){setError((e as Error).message);}}}/><div><Link className="task-title" to={`/registros/tasks/${t.id}`}>{t.title}</Link><Link to={t.projectId?`/proyectos/${t.projectId}`:'/tareas'} className="meta">{db.projects.find(p=>p.id===t.projectId)?.name||'General de noodo'}</Link></div><span className={`task-date ${!t.done&&t.due<today()?'overdue':''}`}>{dateLabel(t.due)}</span></div>)}</div></>;}
