import {useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {ChevronRight,ChevronDown,Check} from 'lucide-react';
import {useStore} from '../../data/Store';
import {breadcrumbs,projectSwitchPath} from '../../lib/breadcrumbs';
import {IconButton,SearchField} from '../ui';
import {Dialog} from '../ui/Dialog';
import {matches} from '../../lib/format';
export function AppBreadcrumbs(){
 const {db}=useStore();const {pathname}=useLocation();const items=breadcrumbs(pathname,db);const [switching,setSwitching]=useState(false);const [query,setQuery]=useState('');
 const projectItem=items.find(item=>/^\/proyectos\/[^/]+$/.test(item.to));const projects=db.projects.filter(p=>!p.deletedAt&&matches(p.name+' '+p.client,query));
 return <><div className="route-heading"><nav aria-label="Ruta de navegación"><ol>{items.map((item,index)=><li key={`${item.to}-${index}`}>{item===projectItem?<IconButton label="Cambiar proyecto" aria-haspopup="dialog" aria-expanded={switching} onClick={()=>{setQuery('');setSwitching(true);}}><ChevronDown size={16}/></IconButton>:index>0&&<ChevronRight size={16} aria-hidden="true"/>}<Link to={item.to} aria-current={index===items.length-1?'page':undefined} title={item.label}>{item.label}</Link></li>)}</ol></nav></div>{switching&&<Dialog title="Cambiar proyecto" description="Continúa en la misma sección de otro proyecto." onClose={()=>setSwitching(false)}><SearchField label="Buscar proyecto" placeholder="Nombre del proyecto…" value={query} onChange={setQuery}/><div className="project-switch-list">{projects.map(p=><Link key={p.id} className="project-switch-option" aria-current={projectItem?.to===`/proyectos/${p.id}`?'true':undefined} to={projectSwitchPath(pathname,db,p.id)} onClick={()=>setSwitching(false)}><span><strong>{p.name}</strong><small className="meta">{p.status}</small></span>{projectItem?.to===`/proyectos/${p.id}`&&<Check size={18}/>}</Link>)}{!projects.length&&<p className="meta">No hay proyectos que coincidan con la búsqueda.</p>}</div></Dialog>}</>;
}
