import type {Database,Partner} from '../data/types';
import {ownership} from '../data/partners';
export function projectPeople(db:Database,projectId:string):Partner[]{
 const project=db.projects.find(p=>p.id===projectId);if(!project)return [];
 const ids=new Set([...ownership(project,db.partners).partnerIds,...db.tasks.filter(t=>t.projectId===projectId).flatMap(t=>ownership(t,db.partners).partnerIds)]);
 return db.partners.filter(p=>p.active&&ids.has(p.id));
}
export function commentPeople(db:Database,note:{entityType:string;entityId:string;projectId:string}):Partner[]{
 if(note.entityType!=='budget')return projectPeople(db,note.projectId);
 const budget=db.budgets.find(b=>b.id===note.entityId);
 return !budget?[]:budget.projectId?projectPeople(db,budget.projectId):db.partners.filter(p=>p.active);
}
const escaped=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function extractMentions(body:string,people:Partner[]){return people.filter(p=>new RegExp(`(^|\\s)@${escaped(p.name)}(?=$|[\\s.,!?;:)])`,'iu').test(body)).map(p=>({partnerId:p.id,name:p.name}));}
export function mentionQuery(body:string,caret:number,people:Partner[]){
 const prefix=body.slice(0,caret);const match=/(?:^|\s)@([^@\n]*)$/.exec(prefix);if(!match)return null;
 const query=match[1];if(people.some(p=>query.toLowerCase().startsWith(p.name.toLowerCase()+' ')))return null;
 return {start:caret-query.length-1,end:caret,query};
}
export const mentionTarget=(note:{entityType:string;entityId:string;projectId:string;id:string})=>`${note.entityType==='budget'?`/presupuestos/${note.entityId}`:note.entityType==='task'?`/registros/tasks/${note.entityId}`:note.entityType==='meeting'?`/reuniones/${note.entityId}`:`/proyectos/${note.projectId}`}#comment-${note.id}`;
