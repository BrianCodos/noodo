import type {Database,Project,Partner} from './types';
import {upsert} from './repository';
export function duplicateProject(db:Database,id:string,name:string,options:{tasks:boolean;quotes:boolean},author?:Pick<Partner,'id'|'name'>):{db:Database;project:Project}{
 const source=db.projects.find(p=>p.id===id);if(!source)throw new Error('Proyecto no encontrado.');
 if(!name.trim())throw new Error('Escribe un nombre para la copia.');
 const project:Project={...structuredClone(source),id:crypto.randomUUID(),name:name.trim(),status:'En planeación',deadline:'',deletedAt:undefined};
 let next=upsert(db,'projects',project,`Proyecto duplicado de ${source.name}: ${project.name}`,author);
 if(options.tasks){
  const tasks=db.tasks.filter(t=>t.projectId===id);const ids=new Map(tasks.map(t=>[t.id,crypto.randomUUID()]));
  for(const task of [...tasks.filter(t=>!t.parentId),...tasks.filter(t=>!!t.parentId)]){
   const copy={...structuredClone(task),id:ids.get(task.id)!,projectId:project.id,parentId:task.parentId?ids.get(task.parentId):undefined,meetingId:undefined,done:false,progress:0,status:'Pendiente' as const};
   next=upsert(next,'tasks',copy,`Tarea copiada: ${copy.title}`,author);
  }
  for(const item of db.deliverables.filter(d=>ids.has(d.taskId)))next=upsert(next,'deliverables',{...structuredClone(item),id:crypto.randomUUID(),projectId:project.id,taskId:ids.get(item.taskId)!,status:'Pendiente',url:''},`Entregable definido desde copia: ${item.title}`,author);
 }
 if(options.quotes)for(const quote of db.quotes.filter(q=>q.projectId===id))next=upsert(next,'quotes',{...structuredClone(quote),id:crypto.randomUUID(),projectId:project.id,status:'Borrador',validUntil:''},`Cotización copiada: ${quote.title}`,author);
 return {db:next,project};
}
