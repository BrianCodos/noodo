import {Link} from 'react-router-dom';
import {CalendarDays,Users,FileText,Wallet,ArrowUpRight} from 'lucide-react';
import type {Project} from '../../data/types';
import {useStore} from '../../data/Store';
import {budgetMetrics} from '../../data/budgets';
import {projectDocumentRows} from '../../features/ProjectDocuments';
import {dateLabel,money} from '../../lib/format';
import {Avatar,SectionHeader} from '../ui';
import {ProjectDescription} from './ProjectDescription';
import {TaskList} from './TaskList';

export function ProjectOverview({project}:{project:Project}) {
 const {db}=useStore();
 const base=`/proyectos/${project.id}`;
 const documents=projectDocumentRows(db,project.id).filter(row=>!row.deletedAt)
  .sort((a,b)=>b.date.localeCompare(a.date));
 const budgets=db.budgets.filter(b=>b.projectId===project.id&&!b.deletedAt);
 const tasks=db.tasks.filter(t=>t.projectId===project.id&&!t.parentId&&!t.done);
 return <div className="project-overview project-overview-grid">
  <ProjectDescription key={project.id} project={project}>
   <dl className="detail-facts">
    <div><dt>Responsable</dt><dd><Avatar name={project.owner} small/>{project.owner}</dd></div>
    <div><dt>Fecha objetivo</dt><dd><CalendarDays size={16}/>{dateLabel(project.deadline,{year:'numeric'})}</dd></div>
    <div><dt>Contactos</dt><dd><Users size={16}/>{project.contactIds.length} vinculados</dd></div>
   </dl>
   <Link className="text-link overview-events-link" to={`${base}/eventos`}><CalendarDays size={16}/>Ver eventos del proyecto</Link>
  </ProjectDescription>
  <div className="project-overview-resources">
   <section className="panel panel-padded">
    <SectionHeader title="Próximos pasos" action={<Link to={`${base}/tareas`} className="text-link">Ver todos</Link>}/>
    <TaskList tasks={tasks.slice(0,3)}/>
   </section>
   <section className="panel panel-padded" aria-label="Documentos del proyecto">
    <SectionHeader title="Documentos" action={<Link to={`${base}/documentos`} className="text-link">Ver todos ({documents.length})</Link>}/>
    {documents.length?<ul className="overview-resource-list">{documents.slice(0,5).map(row=><li key={row.id}>
     <Link className="overview-resource-link" to={row.href}>
      <FileText size={18} aria-hidden="true"/><span><strong>{row.title}</strong><span className="meta">{row.kind} · v{row.version}{row.date?` · ${dateLabel(row.date)}`:''}</span></span><ArrowUpRight size={16} aria-hidden="true"/>
     </Link>
    </li>)}</ul>:<p className="meta">Este proyecto aún no tiene documentos.</p>}
   </section>
   <section className="panel panel-padded" aria-label="Presupuestos del proyecto">
    <SectionHeader title="Presupuestos" action={<Link to={`${base}/cotizaciones`} className="text-link">Ver todos ({budgets.length})</Link>}/>
    {budgets.length?<ul className="overview-resource-list">{budgets.slice(0,5).map(budget=>{
     const metrics=budgetMetrics(budget);
     return <li key={budget.id}><Link className="overview-resource-link" to={`/presupuestos/${budget.id}`}>
      <Wallet size={18} aria-hidden="true"/><span><strong>{budget.name}</strong><span className="meta">{budget.archivedAt?'Archivado · ':''}Total {money(metrics.total)}</span><span className="meta">Disponible {money(metrics.available)}</span></span><ArrowUpRight size={16} aria-hidden="true"/>
     </Link></li>;
    })}</ul>:<div className="overview-resource-empty"><p className="meta">No hay presupuestos vinculados a este proyecto.</p><Link className="text-link" to={`${base}/cotizaciones`}>Asignar presupuesto</Link></div>}
   </section>
  </div>
 </div>;
}
