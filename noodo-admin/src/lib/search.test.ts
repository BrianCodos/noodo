import {describe,it,expect} from 'vitest';
import {emptyDatabase} from '../data/seed';
import {buildSearchIndex,searchEntries} from './search';
import {upcomingEvents,upcomingMeetings} from './upcoming';
describe('Búsqueda unificada',()=>{
 it('encuentra términos del contenido de un acta sin tildes y abre su visor exacto',()=>{const db=emptyDatabase();db.minutes=[{id:'a1',title:'Acta',projectId:'',meetingId:'m1',body:'Revisamos la producción audiovisual',decisions:'Aprobada'}];const found=searchEntries(buildSearchIndex(db),'audiovisual produccion');expect(found.some(r=>r.url==='/visor/acta/a1')).toBe(true);});
 it('incluye personas, archivos y registros con rutas individuales',()=>{const db=emptyDatabase();db.contacts=[{id:'c1',name:'Persona QA',company:'Estudio',email:'persona@example.com',phone:'123',role:'Aliado'}];db.attachments=[{id:'f1',filename:'Recibo QA.pdf',projectId:'',entityId:'tx',entityType:'transaction',blobKey:'file',size:12,createdAt:'2026-11-24'}];const results=searchEntries(buildSearchIndex(db),'QA');expect(results.map(r=>r.url)).toEqual(expect.arrayContaining(['/registros/contacts/c1','/visor/archivo/f1']));});
 it('busca artistas y música de la misma fuente de catálogo',()=>{const found=searchEntries(buildSearchIndex(emptyDatabase()),'Luna Marea');expect(found.some(r=>r.kind==='Artista')).toBe(true);expect(found.some(r=>r.kind==='Canción')).toBe(true);expect(found.every(r=>r.url.startsWith('/catalogo/'))).toBe(true);});
 it('no devuelve todo el índice con una consulta vacía',()=>expect(searchEntries(buildSearchIndex(emptyDatabase()),'   ')).toEqual([]));
});
describe('Próximos eventos',()=>{
 const base={id:'m',title:'Reunión',projectId:'',date:'2026-11-24',time:'14:00',attendees:'Socios',location:''};
 it('excluye reuniones pasadas, canceladas y realizadas en hora de Bogotá',()=>{const now=Date.parse('2026-11-24T20:00:00Z');expect(upcomingMeetings([base,{...base,id:'2',time:'16:00'},{...base,id:'3',time:'17:00',status:'Cancelada'},{...base,id:'4',time:'18:00',status:'Realizada'}],now).map(m=>m.id)).toEqual(['2']);});
 it('ordena juntos reuniones y eventos de catálogo aunque cambie el mes',()=>{const results=upcomingEvents([{...base,date:'2026-12-30'}],Date.parse('2026-11-24T20:00:00Z'));expect(results.at(-1)?.id).toBe('m');expect(results.some(r=>r.url.startsWith('/catalogo/'))).toBe(true);});
});
