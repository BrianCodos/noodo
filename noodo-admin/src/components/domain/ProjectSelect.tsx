import {useStore} from '../../data/Store';
import {Select} from '../ui';
export function ProjectSelect({value,onChange,disabled=false}:{value:string;onChange:(value:string)=>void;corporate?:boolean;required?:boolean;disabled?:boolean}){const {db}=useStore();return <Select label="Proyecto" required disabled={disabled} value={value} onChange={e=>onChange(e.target.value)}><option value="">Seleccionar proyecto</option>{db.projects.filter(p=>!p.deletedAt||p.id===value).map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</Select>;}
