import type { QuoteItem } from '../data/types';
export const money = (value: number) => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0,maximumFractionDigits:2}).format(value);
export function today() { return new Intl.DateTimeFormat('en-CA',{ timeZone:'America/Bogota', year:'numeric', month:'2-digit',day:'2-digit'}).format(new Date()); }
export function dateLabel(value: string, options: Intl.DateTimeFormatOptions = {}) { if (!value) return 'Sin fecha'; return new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'short',timeZone:'America/Bogota',...options}).format(new Date(`${value.slice(0,10)}T12:00:00-05:00`)); }
export function dateOffset(days: number) { const d = new Date(`${today()}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+days); return d.toISOString().slice(0,10); }
export const matches = (value: string, query: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().includes(query.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase());
export const initials = (name: string) => name.split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
export function quoteTotals(items: QuoteItem[], tax: number) { const subtotal = Math.round(items.reduce((sum,item)=>sum+Math.round(item.quantity*item.price*100)/100,0)*100)/100; const taxes=Math.round(subtotal*tax)/100; return {subtotal,taxes,total: Math.round((subtotal+taxes)*100)/100}; }
export function download(data: Blob, filename: string) { const url=URL.createObjectURL(data); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
