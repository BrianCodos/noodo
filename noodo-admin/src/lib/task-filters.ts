import type {Task} from '../data/types';
import {matches} from './format';
import {taskProgress} from './task-progress';
export const progressOptions=[{value:'zero',label:'Sin iniciar · 0%'},{value:'low',label:'1–49%'},{value:'high',label:'50–99%'},{value:'complete',label:'Completado · 100%'}];
export function matchesTask(task:Task,tasks:Task[],filters:{query:string;owner:string;state:string;progress:string}) {
 const value=taskProgress(task,tasks);const status=task.done?'Completada':task.status==='En curso'?'En curso':'Pendiente';
 const owner=filters.owner==='Todos'||task.partnerIds?.includes(filters.owner)||task.owner===filters.owner;
 const progress=filters.progress==='Todos'||filters.progress==='zero'&&value===0||filters.progress==='low'&&value>0&&value<50||filters.progress==='high'&&value>=50&&value<100||filters.progress==='complete'&&value===100;
 return !!owner&&progress&&matches(task.title+' '+(task.description||''),filters.query)&&(filters.state==='Todos'||status===filters.state);
}
