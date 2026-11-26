import {useState,useId,type ReactNode} from 'react';
import {Pencil,ChevronDown,ChevronUp} from 'lucide-react';
import type {Project} from '../../data/types';
import {richToText,type RichNode} from '../../lib/rich-text';
import {useStore} from '../../data/Store';
import {Alert,Button,SectionHeader} from '../ui';
import {RichText,RichTextEditor} from '../ui/RichTextEditor';
export function ProjectDescription({project,children}:{project:Project;children?:ReactNode}){
 const {save}=useStore();const id=useId();const [editing,setEditing]=useState(false);const [expanded,setExpanded]=useState(false);const [draft,setDraft]=useState<{text:string;rich?:RichNode[]}>({text:project.description,rich:project.descriptionRich});const [error,setError]=useState('');
 const text=project.descriptionRich?.length?richToText(project.descriptionRich):project.description;
 const condensed=text.replace(/\s+/g,' ').trim();const lengthy=condensed.length>480||text.split('\n').length>8;
 const excerpt=condensed.slice(0,480).replace(/\s+\S*$/,'');
 const close=()=>{setEditing(false);setExpanded(false);};
 const start=()=>{setDraft({text:project.description,rich:project.descriptionRich});setError('');setExpanded(true);setEditing(true);};
 return <section className={`panel panel-padded project-scope-panel ${(expanded||editing)?'is-expanded':''}`}><SectionHeader title="Sobre el proyecto" action={!editing&&<Button variant="ghost" onClick={start}><Pencil size={16}/>Editar</Button>}/>{editing?<form onSubmit={e=>{e.preventDefault();try{save('projects',{...project,description:draft.text,descriptionRich:draft.rich},`Alcance actualizado: ${project.name}`);close();}catch(e){setError((e as Error).message);}}}><RichTextEditor text={draft.text} value={draft.rich} label="Descripción del proyecto" onChange={(text,rich)=>setDraft({text,rich})}/>{error&&<Alert kind="error">{error}</Alert>}<div className="form-actions"><Button type="button" variant="secondary" onClick={close}>Cancelar</Button><Button type="submit">Guardar cambios</Button></div></form>:<><div id={id} className="description-text">{lengthy&&!expanded?<p>{excerpt}…</p>:<RichText value={project.descriptionRich} text={text||'Añade el objetivo y el alcance de este proyecto.'}/>}</div>{lengthy&&<Button className="description-expand" variant="ghost" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(!expanded)}>{expanded?<ChevronUp size={16}/>:<ChevronDown size={16}/>}Ver {expanded?'menos':'más'}</Button>}</>}{children}</section>;
}
