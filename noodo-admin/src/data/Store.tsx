import {duplicateProject} from './duplicate-project';
import { createContext,useContext,useRef,useState,useEffect, type ReactNode } from 'react';
import { loadDatabase, persistDatabase, upsert, STORAGE_KEY, normalizeDatabase } from './repository';
import type { Database,Collection,Partner } from './types';
type Store = { activePartner:Partner|undefined; selectPartner:(id:string)=>void; db: Database; save: <K extends Collection>(collection:K,record:Database[K][number],label:string)=>void; notify:(message:string)=>void; message:string; duplicate:(id:string,name:string,options:{tasks:boolean;quotes:boolean})=>string };
const Context=createContext<Store|null>(null);
export function StoreProvider({children}:{children:ReactNode}) {
 const [db,setDb]=useState(loadDatabase); const current=useRef(db); const [message,setMessage]=useState('');
 const [selected,setSelected]=useState(()=>{try{return localStorage.getItem('noodo.active-partner')||'partner-brian';}catch{return 'partner-brian';}});
 const selectedRef=useRef(selected);
 const resolvePartner=()=>current.current.partners.find(p=>p.id===selectedRef.current&&p.active)||current.current.partners.find(p=>p.active);
 const activePartner=db.partners.find(p=>p.id===selected&&p.active)||db.partners.find(p=>p.active);
 const selectPartner=(id:string)=>{if(!current.current.partners.some(p=>p.id===id&&p.active))return;selectedRef.current=id;setSelected(id);try{localStorage.setItem('noodo.active-partner',id);}catch{/* The selection remains available in memory. */}};
 const commit=(next:Database)=>{persistDatabase(next);current.current=next;setDb(next);};
 useEffect(()=>{const listener=(e:StorageEvent)=>{if(e.key===STORAGE_KEY&&e.newValue){try{const data=normalizeDatabase(JSON.parse(e.newValue));current.current=data;setDb(data);setMessage('Datos actualizados desde otra pestaña.');}catch{setMessage('No se pudo leer la actualización de otra pestaña.');}}};window.addEventListener('storage',listener);return()=>window.removeEventListener('storage',listener);},[]);
 useEffect(()=>{if(!message)return; const timer=setTimeout(()=>setMessage(''),5000);return()=>clearTimeout(timer);},[message]);
 const save:Store['save']=(collection,record,label)=>{commit(upsert(current.current,collection,record,label,resolvePartner()));setMessage('Cambios guardados en este navegador.');};
 const duplicate:Store['duplicate']=(id,name,options)=>{const result=duplicateProject(current.current,id,name,options,resolvePartner());commit(result.db);setMessage('Proyecto duplicado.');return result.project.id;};
 return <Context.Provider value={{db,activePartner,selectPartner,save,notify:setMessage,message,duplicate}}>{children}</Context.Provider>;
}
export function useStore(){const ctx=useContext(Context);if(!ctx)throw new Error('StoreProvider requerido');return ctx;}
