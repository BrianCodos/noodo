import {Link} from 'react-router-dom';
import {useStore} from '../data/Store';
import {PageHeader,EmptyState,StatusBadge} from '../components/ui';
export function ProjectScope({section,title}:{section:string;title:string}) {
 const {db}=useStore();return <><PageHeader title={title} description="Todo empieza en un proyecto. Selecciona su expediente para continuar." action={<Link className="button button-primary" to="/proyectos?nuevo=1">Nuevo proyecto</Link>}/><div className="project-grid">{db.projects.filter(p=>!p.deletedAt).map(p=><Link className="panel panel-padded project-scope-card" key={p.id} to={`/proyectos/${p.id}/${section}`}><StatusBadge status={p.status}/><h2>{p.name}</h2><p>{p.client}</p><span className="text-link">Abrir proyecto →</span></Link>)}</div>{!db.projects.some(p=>!p.deletedAt)&&<EmptyState title="Crea tu primer proyecto" description="Después podrás añadir tareas, cotizaciones, reuniones y documentos."/>}</>;
}
