import {describe,it,expect} from 'vitest';
import {emptyDatabase} from '../data/seed';
import {upsert} from '../data/repository';
import {projectPeople,extractMentions,mentionQuery,mentionTarget} from './mentions';
import type {Project,Task,Partner} from '../data/types';
const people:Partner[]=[{id:'a',name:'Brian Cobaleda',email:'',active:true},{id:'b',name:'Keyla Ortiza',email:'',active:true},{id:'c',name:'Fuera del proyecto',email:'',active:true}];
function fixture(){const db=emptyDatabase();db.partners=structuredClone(people);db.projects=[{id:'p',name:'Proyecto',owner:'Brian Cobaleda',partnerIds:['a'],client:'NOODO',kind:'Interno',status:'En curso',deadline:'',description:'',contactIds:[]} as Project];db.tasks=[{id:'t',projectId:'p',title:'Tarea',owner:'Keyla Ortiza',partnerIds:['b'],due:'',done:false} as Task];return db;}
describe('Menciones de proyecto',()=>{
 it('limita sugerencias a responsables del proyecto y tareas, activos y sin duplicados',()=>{const db=fixture();expect(projectPeople(db,'p').map(p=>p.id)).toEqual(['a','b']);db.partners[1]={...db.partners[1],active:false};expect(projectPeople(db,'p').map(p=>p.id)).toEqual(['a']);expect(projectPeople(db,'otro')).toEqual([]);});
 it('reconoce nombres completos y límites, sin confundir correos o nombres parciales',()=>{expect(extractMentions('@Keyla Ortiza, revisa con @Keyla Ortiza.',people)).toEqual([{partnerId:'b',name:'Keyla Ortiza'}]);expect(extractMentions('correo@Keyla Ortiza @Keyla Ortizabc',people)).toEqual([]);expect(mentionQuery('Hola @key',9,people)).toEqual({start:5,end:9,query:'key'});expect(mentionQuery('@Keyla Ortiza ',14,people)).toBeNull();});
 it('guarda destinatarios reales de forma atómica y conserva los comentarios históricos',()=>{const db=fixture();const base={id:'n',projectId:'p',entityType:'project' as const,entityId:'p',body:'@Keyla Ortiza revisa; @Fuera del proyecto',createdAt:'2026-11-24',authorId:'a',authorName:'Brian Cobaleda',mentions:[{partnerId:'c',name:'Fuera del proyecto'}]};const next=upsert(db,'followUps',base,'Comentario',people[0]);expect(next.followUps[0].mentions).toEqual([{partnerId:'b',name:'Keyla Ortiza'}]);expect(db.followUps).toEqual([]);expect(()=>upsert(next,'followUps',base,'Repetir')).toThrow('sin sobrescribir');expect(mentionTarget(base)).toBe('/proyectos/p#comment-n');});
});
