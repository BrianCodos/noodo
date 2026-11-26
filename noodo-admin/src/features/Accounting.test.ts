import {describe,it,expect} from 'vitest';
import {accountingTotals} from './Accounting';
import {upsert} from '../data/repository';
import {emptyDatabase} from '../data/seed';
import type {Transaction} from '../data/types';
const row:Transaction={id:'r',projectId:'',title:'Ejemplo',type:'Ingreso',amount:100,date:'2026-11-24',category:'General',counterparty:'',notes:'',status:'Registrado'};
describe('Registro contable',()=>{
 it('suma ingresos y egresos y excluye anulados sin borrarlos',()=>{expect(accountingTotals([row,{...row,id:'2',type:'Egreso',amount:30.25},{...row,id:'3',amount:500,status:'Anulado'}])).toEqual({income:100,expense:30.25,balance:69.75});});
 it('rechaza importes no finitos, negativos y cero',()=>{for(const amount of [NaN,Infinity,-1,0])expect(()=>upsert(emptyDatabase(),'transactions',{...row,amount},'Registro')).toThrow('mayor que cero');});
});
