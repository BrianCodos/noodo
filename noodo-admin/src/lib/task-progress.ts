import type {Task} from '../data/types';
export function taskProgress(task:Task,tasks:Task[]):number {
 const children=tasks.filter(t=>t.parentId===task.id);
 return children.length?Math.min(children.every(t=>t.done)?100:99,Math.round(children.reduce((sum,t)=>sum+(t.done?100:t.progress??0),0)/children.length)):task.done?100:task.progress??0;
}
export function projectProgress(tasks:Task[]):number {
 const roots=tasks.filter(t=>!t.parentId);
 return roots.length?Math.min(roots.every(t=>taskProgress(t,tasks)===100)?100:99,Math.round(roots.reduce((sum,t)=>sum+taskProgress(t,tasks),0)/roots.length)):0;
}
