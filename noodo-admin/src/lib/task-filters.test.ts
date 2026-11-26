import {describe,it,expect} from 'vitest';
import {matchesTask} from './task-filters';
import type {Task} from '../data/types';
const task:Task={id:'t',projectId:'p',title:'Producción',owner:'Brian Cobaleda y Keyla Ortiza',partnerIds:['b','k'],due:'2026-12-01',done:false,status:'En curso',progress:50};
const filters={query:'',owner:'Todos',state:'Todos',progress:'Todos'};
describe('Filtros de columnas',()=>{
 it('combina responsable, estado, búsqueda y porcentaje',()=>{expect(matchesTask(task,[task],{query:'produccion',owner:'k',state:'En curso',progress:'high'})).toBe(true);expect(matchesTask(task,[task],{...filters,owner:'missing'})).toBe(false);expect(matchesTask(task,[task],{...filters,state:'Completada'})).toBe(false);});
 it('separa correctamente los límites de avance',()=>{for(const [progress,range] of [[0,'zero'],[1,'low'],[49,'low'],[50,'high'],[99,'high'],[100,'complete']] as const){const t={...task,progress,done:progress===100};expect(matchesTask(t,[t],{...filters,progress:range})).toBe(true);}expect(matchesTask(task,[task],{...filters,progress:'low'})).toBe(false);});
 it('usa el avance calculado del padre en lugar de su valor antiguo',()=>{const parent={...task,progress:0};const child={...task,id:'child',parentId:'t',progress:80};expect(matchesTask(parent,[parent,child],{...filters,progress:'high'})).toBe(true);});
});
