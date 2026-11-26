import {Fragment,useState,type ReactNode} from 'react';
import {ArrowDown,ArrowUp,ChevronLeft,ChevronRight} from 'lucide-react';
import { EmptyState,IconButton } from './index';
export interface Column<T> { key:string;title:string;header?:ReactNode;render:(row:T)=>ReactNode;sortValue?:(row:T)=>string|number }
export function DataTable<T extends {id:string}>({rows,columns,emptyTitle='Sin resultados',renderAfterRow}:{rows:T[];columns:Column<T>[];emptyTitle?:string;renderAfterRow?:(row:T)=>ReactNode}) {
 const [sort,setSort]=useState({key:'',ascending:true});const [page,setPage]=useState(0);const pageSize=8;
 const column=columns.find(c=>c.key===sort.key);const sorted=column?.sortValue?[...rows].sort((a,b)=>{const av=column.sortValue!(a),bv=column.sortValue!(b);return (typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv),'es'))*(sort.ascending?1:-1);}):rows;
 const current=Math.min(page,Math.max(0,Math.ceil(rows.length/pageSize)-1));
 if(!rows.length)return <EmptyState title={emptyTitle} description="Prueba otros filtros o crea un nuevo registro."/>;
 return <><div className="table-wrap"><table><thead><tr>{columns.map(c=><th key={c.key} aria-sort={c.key===sort.key?(sort.ascending?'ascending':'descending'):undefined}>{c.header??(c.sortValue?<button onClick={()=>{setSort({key:c.key,ascending:sort.key===c.key?!sort.ascending:true});setPage(0);}}>{c.title}{c.key===sort.key&&(sort.ascending?<ArrowUp size={14}/>:<ArrowDown size={14}/>)}</button>:c.title)}</th>)}</tr></thead><tbody>{sorted.slice(current*pageSize,(current+1)*pageSize).map(row=><Fragment key={row.id}><tr>{columns.map(c=><td key={c.key} data-label={c.title}>{c.render(row)}</td>)}</tr>{renderAfterRow?.(row)}</Fragment>)}</tbody></table></div><div className="pagination"><span>{current*pageSize+1}–{Math.min((current+1)*pageSize,rows.length)} de {rows.length}</span><div><IconButton label="Página anterior" disabled={current===0} onClick={()=>setPage(current-1)}><ChevronLeft size={16}/></IconButton><IconButton label="Página siguiente" disabled={(current+1)*pageSize>=rows.length} onClick={()=>setPage(current+1)}><ChevronRight size={16}/></IconButton></div></div></>;
}
