import {describe,it,expect} from 'vitest';
import {backDestination} from './back-destination';
import {emptyDatabase} from '../data/seed';
describe('Regreso uniforme',()=>{
 it('regresa al expediente correcto incluso al abrir enlaces directos',()=>{const db=emptyDatabase();db.tasks=[{id:'t',projectId:'p',title:'Tarea',owner:'Brian',due:'2026-12-01',done:false},{id:'s',parentId:'t',projectId:'p',title:'Subtarea',owner:'Keyla',due:'2026-12-01',done:false}];expect(backDestination('/registros/tasks/t',db)?.to).toBe('/proyectos/p/tareas');expect(backDestination('/registros/tasks/s',db)?.to).toBe('/registros/tasks/t');expect(backDestination('/proyectos/p/tareas',db)?.to).toBe('/proyectos');expect(backDestination('/inicio',db)).toBeNull();});
 it('regresa desde un adjunto a la tarea de su entregable',()=>{const db=emptyDatabase();db.deliverables=[{id:'d',taskId:'t',projectId:'p',title:'Entrega',criteria:'Criterios',due:'2026-12-01',status:'Pendiente',url:''}];db.attachments=[{id:'a',entityType:'deliverable',entityId:'d',projectId:'p',filename:'x.pdf',blobKey:'key',size:1,createdAt:''}];expect(backDestination('/visor/archivo/a',db)?.to).toBe('/registros/tasks/t');});
});
