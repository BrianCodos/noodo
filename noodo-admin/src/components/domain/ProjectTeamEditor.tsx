import {useState} from 'react';
import type {Project} from '../../data/types';
import {ownership} from '../../data/partners';
import {useStore} from '../../data/Store';
import {Avatar,Alert,FormActions} from '../ui';
import {Dialog} from '../ui/Dialog';
export function ProjectTeamEditor({project,onClose}:{project:Project;onClose:()=>void}){
 const {db,save}=useStore();const original=ownership(project,db.partners).partnerIds;const [ids,setIds]=useState(original);const [error,setError]=useState('');
 return <Dialog title="Personas del proyecto" protectChanges changeKey={ids.join(',')} onClose={onClose}><form onSubmit={e=>{e.preventDefault();if(!ids.length)return setError('Selecciona al menos una persona responsable.');try{save('projects',{...project,partnerIds:ids,owner:ids.map(id=>db.partners.find(p=>p.id===id)!.name).join(' y ')},`Equipo actualizado: ${project.name}`);onClose();}catch(e){setError((e as Error).message);}}}><p>Selecciona las personas responsables de este proyecto.</p><fieldset className="project-team-picker"><legend>Socios</legend>{db.partners.filter(p=>p.active||original.includes(p.id)).map(p=><label key={p.id}><input type="checkbox" checked={ids.includes(p.id)} onChange={e=>setIds(e.target.checked?[...ids,p.id]:ids.filter(id=>id!==p.id))}/><Avatar name={p.name} photo={p.photo} small/><span>{p.name}{!p.active?' · inactivo':''}</span></label>)}</fieldset><p className="meta">Las personas asignadas a tareas también aparecen en la cabecera; sus tareas conservan sus responsables.</p>{error&&<Alert kind="error">{error}</Alert>}<FormActions onCancel={onClose}/></form></Dialog>;
}
