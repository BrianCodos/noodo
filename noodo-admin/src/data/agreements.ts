import type {Database,Document} from './types';

export function validateAgreement(record:Document,db:Database,before?:Document){
 if(before?.kind==='agreement'&&record.kind!=='agreement')throw new Error('Conserva el acuerdo y su historial.');
 if(record.kind!=='agreement')return;
 if(!record.title.trim()||(!record.blobKey&&!record.content.trim()))throw new Error('Completa el título y el contenido del acuerdo.');
 if(!['Borrador','En revisión'].includes(record.status))throw new Error('La firma requiere un proveedor y verificación en el servidor.');
 const ids=record.signerIds||[];
 if(new Set(ids).size!==ids.length||ids.some(id=>!db.partners.some(p=>p.id===id)))throw new Error('Selecciona firmantes del directorio de socios.');
 if(ids.some(id=>!db.partners.find(p=>p.id===id)?.active&&!before?.signerIds?.includes(id)))throw new Error('No puedes añadir firmantes inactivos.');
 if(record.status==='En revisión'&&!ids.length)throw new Error('Selecciona al menos un firmante antes de pasar a revisión.');
}
