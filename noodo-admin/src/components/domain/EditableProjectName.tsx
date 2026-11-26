import {useState,useLayoutEffect,useRef} from 'react';
import {Check,X} from 'lucide-react';
import type {Project} from '../../data/types';
import {useStore} from '../../data/Store';
import {Field,IconButton,Alert} from '../ui';
export function EditableProjectName({project}:{project:Project}){
 const {save}=useStore();const [draft,setDraft]=useState<string|null>(null);const [error,setError]=useState('');
 const measure=useRef<HTMLSpanElement>(null);const [width,setWidth]=useState(0);
 useLayoutEffect(()=>{if(measure.current)setWidth(Math.ceil(measure.current.getBoundingClientRect().width*1.1+26));},[draft]);
 const cancel=()=>{setDraft(null);setError('');};
 if(draft===null)return <h1 aria-label={project.name}><button className="editable-project-name" title="Cambiar nombre del proyecto" aria-label={`Cambiar nombre de ${project.name}`} onClick={()=>{setDraft(project.name);setError('');}}>{project.name}</button></h1>;
 return <form className="project-name-form" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();cancel();}}} onSubmit={e=>{e.preventDefault();const name=draft.trim();if(!name)return setError('Escribe un nombre para el proyecto.');try{if(name!==project.name)save('projects',{...project,name},`Proyecto renombrado: ${project.name} → ${name}`);cancel();}catch(e){setError((e as Error).message);}}}><div className="project-name-controls"><span className="project-name-measure-clip" aria-hidden="true"><span ref={measure} className="project-name-measure">{draft||' '}</span></span><div className="project-name-sized" style={{width:width||undefined}}><Field label="Nombre del proyecto" autoFocus value={draft} onChange={e=>setDraft(e.target.value)}/></div><IconButton type="submit" label="Guardar nombre del proyecto"><Check size={18}/></IconButton><IconButton type="button" label="Cancelar cambio de nombre" onClick={cancel}><X size={18}/></IconButton></div>{error&&<Alert kind="error">{error}</Alert>}</form>;
}
