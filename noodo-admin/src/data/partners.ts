import type {Database,Partner,Project,Task} from './types';
export const initialPartners=():Partner[]=>[
 {id:'partner-brian',name:'Brian Cobaleda',email:'',active:true},
 {id:'partner-keyla',name:'Keyla Ortiza',email:'',active:true}
];
const key=(name:string)=>name.trim().normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/\s+/g,' ');
export function ownership(record:Pick<Project,'owner'|'partnerIds'>,partners:Partner[]) {
 const aliases:Record<string,string[]>={'Socio 1':['partner-brian'],'Socio 2':['partner-keyla'],'Ambos socios':['partner-brian','partner-keyla']};
 const ids=record.partnerIds??aliases[record.owner]??partners.filter(p=>key(p.name)===key(record.owner)).map(p=>p.id);
 return ids.length?{partnerIds:[...new Set(ids)],owner:ids.map(id=>partners.find(p=>p.id===id)?.name||record.owner).join(' y ')}:{partnerIds:[],owner:record.owner};
}
export function normalizePartners(db:Database):Database {
 const partners=db.partners??initialPartners();
 const changes:Database['activity']=[];
 const update=<T extends Project|Task>(rows:T[],collection:'projects'|'tasks')=>rows.map(row=>{
  const assignment=ownership(row,partners);
  if(!assignment.partnerIds.length||JSON.stringify(row.partnerIds)===JSON.stringify(assignment.partnerIds)&&row.owner===assignment.owner)return row;
  const next={...row,...assignment};changes.push({id:crypto.randomUUID(),projectId:collection==='projects'?row.id:(row as Task).projectId,collection,recordId:row.id,description:`Asignación identificada: ${assignment.owner}`,at:new Date().toISOString(),actor:'Migración local',action:'Migración',before:structuredClone(row),after:structuredClone(next)});return next;
 });
 const projects=update(db.projects,'projects'),tasks=update(db.tasks,'tasks');
 return {...db,partners,projects,tasks,activity:[...changes,...db.activity]};
}
export function validatePartner(partner:Partner,db:Database) {
 if(!partner.name.trim())throw new Error('Escribe el nombre del socio.');
 if(db.partners.some(p=>p.id!==partner.id&&key(p.name)===key(partner.name)))throw new Error('Ya existe un socio con ese nombre.');
 if(partner.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partner.email))throw new Error('Escribe un correo válido o deja el campo vacío.');
 if(!partner.active&&!db.partners.some(p=>p.id!==partner.id&&p.active))throw new Error('Debe quedar al menos un socio activo.');
}
export function validateAssignment(record:Project|Task,before:Project|Task|undefined,db:Database){
 for(const id of record.partnerIds??[]){const partner=db.partners.find(p=>p.id===id);if(!partner)throw new Error('Selecciona socios registrados.');if(!partner.active&&!before?.partnerIds?.includes(id))throw new Error('No puedes asignar un socio inactivo.');}
}
