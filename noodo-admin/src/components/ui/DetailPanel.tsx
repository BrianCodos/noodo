import {useContext,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {ContextTarget} from '../layout/ContextTarget';
/** Context is always mounted by AppShell. Page details only fill this shared slot. */
export function DetailPanel({title,children}:{title:string;children:ReactNode;onClose?:()=>void}) {
 return <section className="detail-panel context-content" aria-label={title}><div className="detail-panel-header"><h2>{title}</h2></div><div className="detail-panel-body">{children}</div></section>;
}
export function Workspace({children,detail}:{children:ReactNode;detail?:ReactNode}) {
 const target=useContext(ContextTarget);
 return <><div className="workspace-content">{children}</div>{detail&&target?createPortal(detail,target):null}</>;
}
export function DetailSection({title,action,children}:{title:string;action?:ReactNode;children:ReactNode}) {return <section className="detail-section"><div className="section-header"><h3>{title}</h3>{action}</div>{children}</section>;}
export function SectionToolbar({children,label='Acciones de la sección'}:{children:ReactNode;label?:string}) {return <div className="section-toolbar" role="group" aria-label={label}>{children}</div>;}

/** Keep selected context reachable when the columns stack on mobile. */
export function revealContext(){window.dispatchEvent(new Event('noodo:show-context'));if(window.matchMedia('(max-width:760px)').matches)requestAnimationFrame(()=>{const panel=document.getElementById('context-panel');panel?.focus({preventScroll:true});panel?.scrollIntoView({block:'start'});});}
