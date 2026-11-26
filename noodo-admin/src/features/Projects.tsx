import {priorityOptions} from '../components/domain/PrioritySelect';
import {ProjectOverview} from '../components/domain/ProjectOverview';
import {RichTextEditor} from '../components/ui/RichTextEditor';
import {FollowUps} from '../components/domain/RecordExtras';
import {Workspace,DetailPanel} from '../components/ui/DetailPanel';
import {ProjectList} from '../components/domain/ProjectList';
import {ProjectDocuments} from './ProjectDocuments';
import {ProjectHeader} from '../components/domain/ProjectHeader';
import {PartnerAssignment} from '../components/domain/PartnerAssignment';
import {useState} from 'react';
import {useSearchParams,Link,NavLink,useParams,Navigate} from 'react-router-dom';
import {Plus} from 'lucide-react';
import {useStore} from '../data/Store';
import type {Project,ProjectStatus,Task} from '../data/types';
import {PageHeader,Button,Field,Textarea,Select,Alert,FormActions,SearchField,EmptyState,StatusBadge,SectionHeader} from '../components/ui';
import {Dialog} from '../components/ui/Dialog';
import {matches,today} from '../lib/format';
import {Contacts} from './Contacts';
import {Accounting} from './Accounting';
import {projectProgress} from '../lib/task-progress';
import {Tasks} from './Tasks';
import {Quotes} from './Quotes';
import {Meetings} from './Meetings';
import {MinutesPage} from './Minutes';
import {Legal} from './Legal';
const statuses:ProjectStatus[]=['En planeación','En curso','En pausa','Finalizado'];
function ProjectForm({initial,onClose}:{initial?:Project;onClose:()=>void}){const {db,save}=useStore();const [draft,setDraft]=useState<Project>(initial??{id:crypto.randomUUID(),name:'',client:'',kind:'Producción musical',owner:db.partners.find(p=>p.active)?.name||'',partnerIds:db.partners.filter(p=>p.active).slice(0,1).map(p=>p.id),status:'En planeación',priority:'Media',deadline:'',description:'',contactIds:[]});const [error,setError]=useState('');function field<K extends keyof Project>(k:K,v:Project[K]){setDraft({...draft,[k]:v});}return <Dialog protectChanges title={initial?'Editar proyecto':'Un nuevo proyecto'} description="Dale un espacio a lo que vamos a construir." onClose={onClose}><form onSubmit={e=>{e.preventDefault();if(!draft.name.trim())return setError('Escribe un nombre para el proyecto.');try{save('projects',{...draft,name:draft.name.trim()},`${initial?'Actualizado':'Creado'}: ${draft.name}`);onClose();}catch(e){setError((e as Error).message);}}}><Field label="Nombre del proyecto" required autoFocus value={draft.name} onChange={e=>field('name',e.target.value)} placeholder="¿Qué vamos a crear?"/><div className="form-grid"><Field label="Cliente o iniciativa" required value={draft.client} onChange={e=>field('client',e.target.value)} placeholder="Cliente o proyecto propio"/><Select label="Tipo de proyecto" value={draft.kind} onChange={e=>field('kind',e.target.value)}>{['Producción musical','Evento','Servicios creativos','Proyecto interno','Otro'].map(s=><option key={s}>{s}</option>)}</Select><PartnerAssignment owner={draft.owner} partnerIds={draft.partnerIds} onChange={value=>setDraft({...draft,...value})}/><Select label="Estado" value={draft.status} onChange={e=>field('status',e.target.value as ProjectStatus)}>{statuses.map(s=><option key={s}>{s}</option>)}</Select></div><Select label="Prioridad" value={draft.priority||''} onChange={e=>field('priority',(e.target.value||undefined) as Project['priority'])}><option value="">Sin definir</option>{priorityOptions.map(({value,label})=><option key={value} value={value}>{label}</option>)}</Select><Field label="Fecha objetivo" type="date" value={draft.deadline} onChange={e=>field('deadline',e.target.value)}/><RichTextEditor text={draft.description} value={draft.descriptionRich} onChange={(description,descriptionRich)=>setDraft(current=>({...current,description,descriptionRich}))}/>{db.contacts.length>0&&<fieldset><legend>Contactos vinculados</legend><div className="checkbox-list">{db.contacts.map(c=><label key={c.id}><input type="checkbox" checked={draft.contactIds.includes(c.id)} onChange={e=>field('contactIds',e.target.checked?[...draft.contactIds,c.id]:draft.contactIds.filter(id=>id!==c.id))}/>{c.name}</label>)}</div></fieldset>}{error&&<Alert kind="error">{error}</Alert>}<FormActions onCancel={onClose}/></form></Dialog>;}
export function Projects(){
 const {db,save,notify}=useStore();const [params,setParams]=useSearchParams();const [query,setQuery]=useState('');const [status,setStatus]=useState('Todos');
 const [editing,setEditing]=useState<Project|null>(null);const [deleting,setDeleting]=useState<Project|null>(null);const [error,setError]=useState('');const [trash,setTrash]=useState(false);
 const projects=db.projects.filter(p=>Boolean(p.deletedAt)===trash&&matches(p.name+' '+p.client,query)&&(status==='Todos'||p.status===status));
 function restore(project:Project){try{save('projects',{...project,deletedAt:undefined},`Proyecto restaurado: ${project.name}`);notify('Proyecto restaurado.');}catch(e){setError((e as Error).message);}}
 function remove(){if(!deleting)return;try{const current=db.projects.find(p=>p.id===deleting.id);if(!current)throw new Error('Proyecto no encontrado.');save('projects',{...current,deletedAt:new Date().toISOString()},`Proyecto enviado a la papelera: ${current.name}`);setDeleting(null);notify('Proyecto en la papelera. Puedes restaurarlo desde Proyectos.');}catch(e){setError((e as Error).message);}}
 return <><PageHeader action={<Button onClick={()=>setParams({nuevo:'1'})}><Plus size={18}/>Nuevo proyecto</Button>} title="Proyectos" description="Cada idea, con su equipo, sus acuerdos y su siguiente paso."/>
  <div className="filter-bar"><SearchField value={query} onChange={setQuery} placeholder="Buscar proyecto o cliente…"/><div className="filter-tabs" aria-label="Filtrar por estado">{['Todos',...statuses].map(s=><button key={s} aria-pressed={s===status} onClick={()=>setStatus(s)}>{s}</button>)}</div><Button variant="ghost" aria-pressed={trash} onClick={()=>{setTrash(!trash);setError('');setStatus('Todos');setQuery('');}}>{trash?'Ver proyectos':`Papelera (${db.projects.filter(p=>p.deletedAt).length})`}</Button></div>
  {trash&&<Alert>Proyectos en la papelera. Sus tareas, documentos, eventos e historial se conservan; puedes restaurarlos.</Alert>}
  {error&&!deleting&&<Alert kind="error">{error}</Alert>}
  {projects.length?<ProjectList projects={projects} onEdit={setEditing} onDelete={p=>{setError('');setDeleting(p);}} onRestore={restore}/>:<EmptyState title={trash?'Papelera vacía':'Sin proyectos para mostrar'} description="Crea un proyecto o ajusta los filtros."/>}
  {params.has('nuevo')&&<ProjectForm onClose={()=>setParams({})}/>}
  {editing&&<ProjectForm key={editing.id} initial={editing} onClose={()=>setEditing(null)}/>}
  {deleting&&<Dialog title="Borrar proyecto" onClose={()=>setDeleting(null)}><p>«{deleting.name}» se moverá a la papelera. Puedes restaurarlo con todas sus tareas, documentos, eventos e historial.</p>{error&&<Alert kind="error">{error}</Alert>}<div className="form-actions"><Button variant="secondary" onClick={()=>setDeleting(null)}>Cancelar</Button><Button variant="danger" onClick={remove}>Mover a la papelera</Button></div></Dialog>}
 </>;
}
export function ProjectDetail(){const {id,tab}=useParams();const {db,save}=useStore();const project=db.projects.find(p=>p.id===id);const [editing,setEditing]=useState(false);if(!project)return <EmptyState title="Proyecto no encontrado" action={<Link to="/proyectos">Volver a proyectos</Link>}/>;if(tab==='actas'||tab==='reuniones')return <Navigate replace to={`/proyectos/${id}/${tab==='actas'?'documentos':'eventos'}`}/>;const tabs=[['','Resumen'],['tareas','Tareas'],['cotizaciones','Cotizaciones'],['eventos','Eventos'],['documentos','Documentos'],['contactos','Contactos'],['contabilidad','Contabilidad'],['actividad','Actividad']];return <>{project.deletedAt&&<Alert>Este proyecto está en la papelera. <Button variant="ghost" onClick={()=>save('projects',{...project,deletedAt:undefined},`Proyecto restaurado: ${project.name}`)}>Restaurar proyecto</Button></Alert>}<ProjectHeader key={`header-${project.id}`} project={project} onEdit={()=>setEditing(true)}/><nav className="project-tabs" aria-label="Secciones del proyecto">{tabs.map(([key,label])=><NavLink key={key} end to={`/proyectos/${id}${key?`/${key}`:''}`}>{label}</NavLink>)}</nav>
 {(!tab)&&<Workspace detail={<DetailPanel title="Comentarios del proyecto">{db.followUps.some(n=>n.entityType==='project'&&n.entityId===project.id)&&<p className="meta">{project.name}</p>}<FollowUps key={project.id} entityType="project" entityId={project.id} projectId={project.id} title="Comentarios" conversation/></DetailPanel>}><ProjectOverview project={project}/></Workspace>}
 {tab==='contactos'&&<Contacts key={id} projectId={id}/>} {tab==='contabilidad'&&<Accounting key={id} projectId={id}/>}
 {tab==='cotizaciones'&&<Quotes key={id} projectId={id}/>} {tab==='eventos'&&<Meetings key={id} projectId={id}/>} {tab==='documentos'&&<ProjectDocuments key={id} projectId={id!}/>}
 {(tab==='tareas'||tab==='compromisos')&&<Tasks key={id} projectId={id}/>}
 {tab==='actividad'&&<section className="panel panel-padded"><SectionHeader title="Historial local"/><p className="meta">Registro de cambios de este navegador; no es una auditoría certificada.</p>{db.activity.filter(a=>a.projectId===id).map(a=><div className="activity-row" key={a.id}><span className="activity-dot"/><div><p>{a.description}</p><span className="meta">{new Date(a.at).toLocaleString('es-CO',{timeZone:'America/Bogota'})}</span></div></div>)}</section>}
 {tab&&tab!=='compromisos'&&!tabs.some(([key])=>key===tab)&&<EmptyState title="Sección no encontrada" action={<Link to={`/proyectos/${id}`}>Ir al resumen</Link>}/>}
 {editing&&<ProjectForm initial={project} onClose={()=>setEditing(false)}/>}</>;}
