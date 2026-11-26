import {useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Bell,CheckCheck} from 'lucide-react';
import {useStore} from '../../data/Store';
import {mentionTarget} from '../../lib/mentions';
import {Avatar,IconButton,Button,EmptyState,Alert} from '../ui';
import {Dialog} from '../ui/Dialog';
const key='noodo.notification-reads.v1';
type Reads=Record<string,string[]>;
function readState():Reads{try{const parsed=JSON.parse(localStorage.getItem(key)||'{}');return Object.fromEntries(Object.entries(parsed).filter(([,value])=>Array.isArray(value)&&value.every(v=>typeof v==='string'))) as Reads;}catch{return {};}}
export function NotificationInbox(){
 const {db,activePartner}=useStore();const navigate=useNavigate();const [open,setOpen]=useState(false);const [reads,setReads]=useState(readState);const [error,setError]=useState('');
 useEffect(()=>{const listener=(e:StorageEvent)=>{if(e.key===key)setReads(readState());};window.addEventListener('storage',listener);return()=>window.removeEventListener('storage',listener);},[]);
 const partnerId=activePartner?.id||'';const rows=db.followUps.filter(n=>n.authorId!==partnerId&&n.mentions?.some(m=>m.partnerId===partnerId)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));const read=reads[partnerId]||[];const unread=rows.filter(n=>!read.includes(n.id));
 function mark(ids:string[]){const latest=readState();const next={...latest,[partnerId]:[...new Set([...(latest[partnerId]||[]),...ids])]};try{localStorage.setItem(key,JSON.stringify(next));setReads(next);setError('');return true;}catch{setError('No se pudo guardar el estado de lectura.');return false;}}
 return <><div className="notification-trigger"><IconButton label={`Notificaciones${unread.length?`: ${unread.length} sin leer`:''}`} aria-haspopup="dialog" onClick={()=>setOpen(true)}><Bell size={20}/></IconButton>{unread.length>0&&<span className="notification-count" aria-hidden="true">{unread.length}</span>}</div>{open&&<Dialog title={`Notificaciones de ${activePartner?.name||'socio'}`} onClose={()=>setOpen(false)}><p className="meta">Menciones recibidas en este navegador.</p>{unread.length>0&&<Button variant="ghost" onClick={()=>mark(unread.map(n=>n.id))}><CheckCheck size={16}/>Marcar todas como leídas</Button>}{error&&<Alert kind="error">{error}</Alert>}{rows.length?<div className="notification-list">{rows.map(n=><button className={`notification-item ${read.includes(n.id)?'':'is-unread'}`} key={n.id} onClick={()=>{if(!mark([n.id]))return;setOpen(false);navigate(mentionTarget(n));window.dispatchEvent(new Event('noodo:show-context'));}}><Avatar name={n.authorName||'Socio'} photo={db.partners.find(p=>p.id===n.authorId)?.photo}/><span><strong>{n.authorName||'Un socio'} te mencionó</strong><span className="meta">{n.entityType==='budget'?db.budgets.find(b=>b.id===n.entityId)?.name:db.projects.find(p=>p.id===n.projectId)?.name} · {new Date(n.createdAt).toLocaleString('es-CO',{timeZone:'America/Bogota'})}</span><span className="notification-excerpt">{n.body}</span><span className="meta">{read.includes(n.id)?'Leída':'Sin leer'} · Abrir comentario</span></span></button>)}</div>:<EmptyState title="Sin menciones" description="Aquí aparecerán las notificaciones cuando te mencionen en un comentario."/>}</Dialog>}</>;
}
