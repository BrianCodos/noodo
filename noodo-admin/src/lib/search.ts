import {mentionTarget} from './mentions';
import type {Database} from '../data/types';
import catalog from '../data/catalog.json';
export interface SearchEntry {id:string;kind:string;title:string;text:string;url:string;subtitle:string}
export const normalized=(value:string)=>value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
export function buildSearchIndex(db:Database):SearchEntry[]{
 const project=(id:string)=>db.projects.find(p=>p.id===id)?.name||'General de noodo';
 const entries:SearchEntry[]=[];
 const add=(kind:string,id:string,title:string,record:unknown,url:string,subtitle='')=>entries.push({id:kind+':'+id,kind,title,text:JSON.stringify(record),url,subtitle});
 db.budgets.filter(b=>!b.deletedAt).forEach(b=>add('Presupuesto',b.id,b.name,b,`/presupuestos/${b.id}`,b.projectId?project(b.projectId):'General de NOODO'));
 db.projects.forEach(p=>add('Proyecto',p.id,p.name,p,`/proyectos/${p.id}`,p.client));
 db.contacts.forEach(c=>add('Contacto',c.id,c.name,c,`/registros/contacts/${c.id}`,c.company));
 db.quotes.forEach(q=>add('Cotización',q.id,q.title,q,`/registros/quotes/${q.id}`,project(q.projectId)));
 db.meetings.forEach(m=>add('Reunión',m.id,m.title,m,`/reuniones/${m.id}`,project(m.projectId)));
 db.minutes.forEach(a=>add('Acta',a.id,a.title,a,`/visor/acta/${a.id}`,project(a.projectId)));
 db.documents.forEach(d=>add('Documento',d.id,d.title,d,`/documentos/${d.id}`,project(d.projectId)));
 db.attachments.forEach(a=>add('Archivo',a.id,a.filename,a,`/visor/archivo/${a.id}`,project(a.projectId)));
 db.tasks.forEach(t=>add('Tarea',t.id,t.title,t,`/registros/tasks/${t.id}`,project(t.projectId)));
 db.deliverables.forEach(d=>add('Entregable',d.id,d.title,d,`/registros/tasks/${d.taskId}`,project(d.projectId)));
 db.transactions.forEach(t=>add('Contabilidad',t.id,t.title,t,`/registros/transactions/${t.id}`,project(t.projectId)));
 db.followUps.forEach(n=>add('Seguimiento',n.id,n.body,n,mentionTarget(n),project(n.projectId)));
 db.activity.forEach(a=>add('LOG',a.id,a.description,a,`/registros/activity/${a.id}`,project(a.projectId)));
 catalog.forEach(c=>add(c.kind,c.id,c.title,c,`/catalogo/${c.id}`,c.subtitle));
 return entries;
}
export function searchEntries(entries:SearchEntry[],query:string){const terms=normalized(query).trim().split(/\s+/).filter(Boolean);if(!terms.length)return [];return entries.filter(e=>terms.every(t=>normalized([e.title,e.subtitle,e.text,e.kind].join(' ')).includes(t))).sort((a,b)=>Number(normalized(b.title).includes(normalized(query)))-Number(normalized(a.title).includes(normalized(query))));}
