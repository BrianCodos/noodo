import type {Meeting} from '../data/types';
import catalog from '../data/catalog.json';
export function upcomingMeetings(meetings:Meeting[],now=Date.now()){return meetings.filter(m=>m.status!=='Cancelada'&&m.status!=='Realizada'&&new Date(`${m.date}T${m.time}:00-05:00`).getTime()>=now).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));}
export function upcomingEvents(meetings:Meeting[],now=Date.now(),includeCatalog=true){
 return [...upcomingMeetings(meetings,now).map(m=>({id:m.id,title:m.title,date:m.date,time:m.time,subtitle:m.attendees,url:`/reuniones/${m.id}`,label:m.status||'Programada'})),...catalog.filter(e=>includeCatalog&&e.date&&new Date(`${e.date}T${e.time}:00-05:00`).getTime()>=now).map(e=>({id:e.id,title:e.title,date:e.date!,time:e.time!,subtitle:e.place||'',url:`/catalogo/${e.id}`,label:'Catálogo noodo · ejemplo'}))].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
}

/** All dated entries, including past/cancelled records for an explicitly selected day. */
export function calendarEvents(meetings:Meeting[],includeCatalog=true){
 return [...meetings.map(m=>({id:m.id,title:m.title,date:m.date,time:m.time,subtitle:m.location||m.attendees,url:`/reuniones/${m.id}`,label:m.status||'Programada'})),...catalog.filter(e=>includeCatalog&&e.date).map(e=>({id:e.id,title:e.title,date:e.date!,time:e.time||'',subtitle:e.place||'',url:`/catalogo/${e.id}`,label:'Catálogo noodo · ejemplo'}))].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
}
