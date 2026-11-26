import {useStore} from '../../data/Store';
import {Select} from '../ui';
import {ownership} from '../../data/partners';
export function PartnerAssignment({owner,partnerIds,onChange,contactNames=[]}:{owner:string;partnerIds?:string[];onChange:(value:{owner:string;partnerIds:string[]})=>void;contactNames?:string[]}) {
 const {db}=useStore();const selected=ownership({owner,partnerIds},db.partners);const options=db.partners.filter(p=>p.active||selected.partnerIds.includes(p.id));
 const groupValue=selected.partnerIds.length>1?selected.partnerIds.join(','):'';
 const activeIds=db.partners.filter(p=>p.active).map(p=>p.id);const allValue=activeIds.join(',');
 return <Select label="Socio responsable" required value={selected.partnerIds.length?selected.partnerIds.join(','):`name:${owner}`} onChange={e=>{const value=e.target.value;if(value.startsWith('name:'))onChange({owner:value.slice(5),partnerIds:[]});else {const ids=value.split(',');onChange({partnerIds:ids,owner:ids.map(id=>db.partners.find(p=>p.id===id)!.name).join(' y ')});}}}>
 {options.map(p=><option value={p.id} key={p.id}>{p.name}{!p.active?' · inactivo':''}</option>)}
 {activeIds.length>1&&<option value={allValue}>Todos los socios activos</option>}
 {groupValue&&groupValue!==allValue&&<option value={groupValue}>{selected.owner}</option>}
 {[...new Set([...contactNames,...(!selected.partnerIds.length?[owner]:[])])].filter(Boolean).map(name=><option key={name} value={`name:${name}`}>{name}</option>)}
 </Select>;
}
