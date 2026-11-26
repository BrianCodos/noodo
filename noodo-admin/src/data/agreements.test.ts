import {describe,it,expect} from 'vitest';
import {emptyDatabase} from './seed';
import {upsert,normalizeDatabase} from './repository';
import type {Document} from './types';

const base=()=>({...emptyDatabase(),projects:[{id:'p',name:'Proyecto QA',client:'',kind:'Interno',owner:'Brian Cobaleda',status:'En curso' as const,deadline:'',description:'',contactIds:[]}]});
const agreement=():Document=>({id:'a',kind:'agreement',projectId:'p',title:'Acuerdo QA',content:'Texto original',filename:'',createdAt:'2026-11-26',version:1,status:'Borrador',signerIds:['partner-brian']});
describe('Preparación de acuerdos y perfil local',()=>{
 it('conserva versiones y firmantes, y vuelve a borrador al modificar un acuerdo en revisión',()=>{
  let db=upsert(base(),'documents',agreement(),'Creación');
  db=upsert(db,'documents',{...db.documents[0],status:'En revisión'},'Revisión');
  expect(db.documents[0].version).toBe(1);
  db=upsert(db,'documents',{...db.documents[0],content:'Texto revisado',signerIds:['partner-keyla']},'Edición');
  const current=db.documents[0];expect(current.status).toBe('Borrador');expect(current.version).toBe(2);
  expect(current.versions?.[0]).toMatchObject({content:'Texto original',signerIds:['partner-brian'],version:1});
  expect(normalizeDatabase(db).documents[0]).toEqual(current);
 });
 it('exige firmantes conocidos para revisión y no acepta una firma local inventada',()=>{
  const db=base();
  expect(()=>upsert(db,'documents',{...agreement(),signerIds:[],status:'En revisión'},'Revisión')).toThrow('firmante');
  expect(()=>upsert(db,'documents',{...agreement(),signerIds:['desconocido']},'Creación')).toThrow('directorio');
  expect(()=>upsert(db,'documents',{...agreement(),status:'Firmado' as Document['status']},'Firma')).toThrow('proveedor');
 });
 it('conserva ID, archivo, contenido e historial al vincular, enviar a papelera y restaurar',()=>{
  const {kind:_kind,signerIds:_ids,...document}=agreement();let db=upsert(base(),'documents',document,'Documento');
  db=upsert(db,'documents',{...db.documents[0],kind:'agreement',signerIds:[]},'Vinculación');
  const linked=db.documents[0];db=upsert(db,'documents',{...linked,deletedAt:'2026-11-26'},'Papelera');
  db=upsert(db,'documents',{...db.documents[0],deletedAt:undefined},'Restauración');
  expect(db.documents).toHaveLength(1);expect(db.documents[0]).toMatchObject(linked);expect(db.documents[0].content).toBe(document.content);expect(db.activity).toHaveLength(4);
 });
 it('guarda teléfono, correo y foto del perfil sin alterar identidad ni asignaciones',()=>{
  const db=base();const partner={...db.partners[0],phone:'+57 300 000 0000',email:'perfil@example.com',photo:'data:image/png;base64,cWE='};
  const next=normalizeDatabase(upsert(db,'partners',partner,'Perfil actualizado',db.partners[0]));
  expect(next.partners[0]).toEqual(partner);expect(next.partners[0].id).toBe(db.partners[0].id);expect(next.activity.some(a=>a.actorId===partner.id)).toBe(true);
 });
});
