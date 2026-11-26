import type {Project} from '../../data/types';
import {Select} from '../ui';
export const priorityOptions=[{value:'Baja',label:'Low'},{value:'Media',label:'Medium'},{value:'Alta',label:'High'}] as const;
export function PrioritySelect({value,label,onChange,disabled=false}:{value:Project['priority'];label:string;onChange:(value:NonNullable<Project['priority']>)=>void;disabled?:boolean}){
 return <div className={`priority-control priority-${value||'unset'}`}><Select label={label} title={label} value={value||''} disabled={disabled} onChange={e=>onChange(e.target.value as NonNullable<Project['priority']>)}><option value="" disabled>Sin definir</option>{priorityOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</Select></div>;
}
