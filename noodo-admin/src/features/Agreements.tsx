import {useState} from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {Plus,Pencil,Eye,History,Trash2,RotateCcw,Link2,ArrowRight} from 'lucide-react';
import {useStore} from '../data/Store';
import type {Document,FileVersion} from '../data/types';
import {putFile} from '../data/repository';
import {fileSnapshot} from '../data/file-versions';
import {INTERNAL_PROJECT} from '../data/project-scope';
import {PageHeader,Button,IconButton,Field,Select,Textarea,FormActions,Alert,SearchField,StatusBadge,Avatar,EmptyState} from '../components/ui';
import {DataTable} from '../components/ui/DataTable';
import {Dialog} from '../components/ui/Dialog';
import {Workspace,DetailPanel} from '../components/ui/DetailPanel';
import {DocumentViewer} from '../components/domain/DocumentViewer';
import {ProjectSelect} from '../components/domain/ProjectSelect';
import {dateLabel,matches} from '../lib/format';

function AgreementEditor({record,onClose,onSaved}:{record?:Document;onClose:()=>void;onSaved:(id:string)=>void}){
 const {db,save}=useStore();const [draft,setDraft]=useState({title:record?.title||'',content:record?.content||'',projectId:record?.projectId||(db.projects.some(p=>p.id===INTERNAL_PROJECT)?INTERNAL_PROJECT:''),signerIds:record?.signerIds||[]});
 const [file,setFile]=useState<File|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 return <Dialog wide protectChanges title={record?'Editar acuerdo':'Nuevo acuerdo'} onClose={()=>{if(!busy)onClose();}}><form onSubmit={async e=>{e.preventDefault();setError('');if(!draft.title.trim()||(!file&&!record?.blobKey&&!draft.content.trim()))return setError('Completa el título y escribe el acuerdo o adjunta un PDF.');setBusy(true);try{
  let blobKey=record?.blobKey;let filename=record?.filename||'';
  if(file){if(!file.size||file.size>10*1024*1024||await file.slice(0,5).text()!=='%PDF-')throw new Error('Selecciona un PDF válido de hasta 10 MB.');blobKey=crypto.randomUUID();await putFile(blobKey,file);filename=file.name;}
  const id=record?.id||crypto.randomUUID();save('documents',{...record,id,...draft,title:draft.title.trim(),content:blobKey?'':draft.content.trim(),kind:'agreement',filename,blobKey,version:record?.version||1,createdAt:record?.createdAt||new Date().toISOString(),status:'Borrador'},`${record?'Acuerdo actualizado':'Acuerdo creado'}: ${draft.title.trim()}`);onSaved(id);
 }catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>
 <Field autoFocus label="Nombre del acuerdo" required value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/><ProjectSelect disabled={!!record} value={draft.projectId} onChange={projectId=>setDraft({...draft,projectId})}/>
 <Field label={record?.blobKey?'Reemplazar PDF con nueva versión':'Archivo PDF (opcional)'} type="file" accept="application/pdf,.pdf" hint="Hasta 10 MB. Las versiones anteriores se conservan." onChange={e=>setFile(e.target.files?.[0]||null)}/>
 {record?.blobKey&&!file&&<p className="meta">Archivo actual: {record.filename}</p>}
 {!file&&!record?.blobKey&&<Textarea label="Contenido del acuerdo" required rows={12} value={draft.content} onChange={e=>setDraft({...draft,content:e.target.value})}/>}
 <fieldset className="agreement-signers"><legend>Firmantes previstos</legend>{db.partners.filter(p=>p.active||draft.signerIds.includes(p.id)).map(p=><label key={p.id}><input type="checkbox" checked={draft.signerIds.includes(p.id)} onChange={e=>setDraft({...draft,signerIds:e.target.checked?[...draft.signerIds,p.id]:draft.signerIds.filter(id=>id!==p.id)})}/><Avatar name={p.name} photo={p.photo} small/><span>{p.name}{!p.active?' · inactivo':''}</span></label>)}</fieldset>
 <p className="meta">Guardar conserva un borrador. Puedes revisarlo dentro de NOODO; la firma se habilitará al conectar el proveedor.</p>{error&&<Alert kind="error">{error}</Alert>}<FormActions busy={busy} onCancel={onClose}/></form></Dialog>;
}

export function Agreements(){
 const {db,save}=useStore();const navigate=useNavigate();const [query,setQuery]=useState('');const [status,setStatus]=useState('Todos');const [trash,setTrash]=useState(false);const [editor,setEditor]=useState<Document|'new'|null>(null);const [linking,setLinking]=useState(false);const [selected,setSelected]=useState('');const [error,setError]=useState('');
 const rows=db.documents.filter(d=>d.kind==='agreement'&&Boolean(d.deletedAt)===trash&&(status==='Todos'||d.status===status)&&matches(`${d.title} ${db.projects.find(p=>p.id===d.projectId)?.name||''}`,query));
 const toggle=(record:Document)=>{try{save('documents',{...record,deletedAt:record.deletedAt?undefined:new Date().toISOString()},`${record.deletedAt?'Acuerdo restaurado':'Acuerdo en papelera'}: ${record.title}`);}catch(e){setError((e as Error).message);}};
 return <><PageHeader title="Acuerdos" description="Prepara documentos, elige sus firmantes y revisa cada versión dentro de NOODO." action={<><Button variant="secondary" onClick={()=>{setSelected('');setError('');setLinking(true);}}><Link2 size={16}/>Vincular documento</Button><Button onClick={()=>setEditor('new')}><Plus size={16}/>Nuevo acuerdo</Button></>}/><Workspace detail={<DetailPanel title="De borrador a firma"><h3>Preparar</h3><p>Escribe el acuerdo o carga un PDF y elige los socios que deberán firmarlo.</p><h3>Revisar</h3><p>Consulta el contenido y sus versiones. Las modificaciones vuelven el acuerdo a borrador.</p><h3>Firmar</h3><p>La identidad y la firma están pendientes de integración. Seleccionar firmantes o marcar En revisión no firma el acuerdo.</p></DetailPanel>}>
 <div className="filter-bar"><SearchField value={query} onChange={setQuery} placeholder="Buscar acuerdo o proyecto…"/><Select label="Estado" value={status} onChange={e=>setStatus(e.target.value)}>{['Todos','Borrador','En revisión'].map(s=><option key={s}>{s}</option>)}</Select><Button variant="ghost" aria-pressed={trash} onClick={()=>setTrash(!trash)}>{trash?<RotateCcw size={16}/>:<Trash2 size={16}/>} {trash?'Ver acuerdos':'Papelera'}</Button></div>{error&&!linking&&<Alert kind="error">{error}</Alert>}
 <section className="panel"><DataTable rows={rows} emptyTitle={trash?'La papelera está vacía':'Sin acuerdos para mostrar'} columns={[
 {key:'title',title:'Acuerdo',sortValue:d=>d.title,render:d=><Link className="table-title" to={`/acuerdos/${d.id}`}>{d.title}<span>{db.projects.find(p=>p.id===d.projectId)?.name} · v{d.version}</span></Link>},
 {key:'signers',title:'Firmantes previstos',render:d=>(d.signerIds||[]).map(id=>db.partners.find(p=>p.id===id)?.name||'Socio no disponible').join(', ')||'Por definir'},
 {key:'status',title:'Estado',render:d=><StatusBadge status={d.status}/>},
 {key:'date',title:'Actualizado',sortValue:d=>d.createdAt,render:d=>dateLabel(d.createdAt)},
 {key:'actions',title:'Acciones',render:d=><div className="document-row-actions"><Link className="icon-button" aria-label={`Abrir acuerdo ${d.title}`} title="Abrir acuerdo" to={`/acuerdos/${d.id}`}><Eye size={17}/></Link>{!trash&&<IconButton label={`Editar acuerdo ${d.title}`} onClick={()=>setEditor(d)}><Pencil size={17}/></IconButton>}<IconButton label={`${trash?'Restaurar':'Enviar a papelera'} ${d.title}`} onClick={()=>toggle(d)}>{trash?<RotateCcw size={17}/>:<Trash2 size={17}/>}</IconButton></div>}
 ]}/></section></Workspace>
 {editor&&<AgreementEditor record={editor==='new'?undefined:editor} onClose={()=>setEditor(null)} onSaved={id=>{setEditor(null);navigate(`/acuerdos/${id}`);}}/>}
 {linking&&<Dialog title="Vincular documento a Acuerdos" onClose={()=>setLinking(false)}><form onSubmit={e=>{e.preventDefault();const record=db.documents.find(d=>d.id===selected);if(!record)return;try{save('documents',{...record,kind:'agreement',status:'Borrador',signerIds:[]},`Documento vinculado a Acuerdos: ${record.title}`);setLinking(false);navigate(`/acuerdos/${record.id}`);}catch(e){setError((e as Error).message);}}}><Select label="Documento existente" required value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Seleccionar documento</option>{db.documents.filter(d=>!d.kind&&!d.deletedAt).map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</Select><p className="meta">Conserva el mismo documento, su proyecto y sus versiones. Después podrás elegir los firmantes y revisarlo.</p>{error&&<Alert kind="error">{error}</Alert>}<FormActions onCancel={()=>setLinking(false)}/></form></Dialog>}</>;
}

export function AgreementDetail({record:provided}:{record?:Document}){
 const {id}=useParams();const {db,save}=useStore();const record=provided||db.documents.find(d=>d.id===id&&d.kind==='agreement');const [editing,setEditing]=useState(false);const [history,setHistory]=useState(false);const [preview,setPreview]=useState<FileVersion|null>(null);const [error,setError]=useState('');
 if(!record)return <EmptyState title="Acuerdo no encontrado" action={<Link to="/acuerdos">Volver a Acuerdos</Link>}/>;
 const versions=[fileSnapshot(record),...[...(record.versions||[])].reverse()];
 return <><PageHeader title={record.title} titleMeta={`v${record.version} · ${db.projects.find(p=>p.id===record.projectId)?.name||'Proyecto'}`} action={<><Button variant="secondary" onClick={()=>{setPreview(null);setHistory(true);}}><History size={16}/>Versiones</Button>{!record.deletedAt&&<Button onClick={()=>setEditing(true)}><Pencil size={16}/>Editar acuerdo</Button>}</>}/>{error&&<Alert kind="error">{error}</Alert>}<Workspace detail={<DetailPanel title="Revisión del acuerdo"><StatusBadge status={record.status}/><p className="meta">Actualizado el {dateLabel(record.createdAt,{year:'numeric'})}</p><h3>Firmantes previstos</h3>{record.signerIds?.length?record.signerIds.map(id=>{const p=db.partners.find(p=>p.id===id);return <div className="signer-row" key={id}><Avatar name={p?.name||'Socio'} photo={p?.photo} small/><div><strong>{p?.name||'Socio no disponible'}</strong><span>Sin firma</span></div></div>;}):<p>Selecciona los firmantes al editar el acuerdo.</p>}
 {record.deletedAt?<Alert>Este acuerdo está en la papelera. Puedes restaurarlo desde Acuerdos.</Alert>:<>{record.status==='Borrador'&&<Button variant="secondary" onClick={()=>{try{save('documents',{...record,status:'En revisión'},`Acuerdo en revisión: ${record.title}`);setError('');}catch(e){setError((e as Error).message);}}}>Marcar en revisión</Button>}{record.status==='En revisión'&&<Link className="button button-primary" to={`/documentos/${record.id}/firmar`}>Revisar flujo de firma <ArrowRight size={16}/></Link>}</>}
 <p className="meta">Firma pendiente de integración. El estado En revisión no acredita una firma ni una identidad verificada.</p><Link className="text-link" to="/acuerdos">Volver a Acuerdos</Link></DetailPanel>}><DocumentViewer title={record.title} filename={record.filename} blobKey={record.blobKey} content={record.content}/></Workspace>
 {editing&&<AgreementEditor record={record} onClose={()=>setEditing(false)} onSaved={()=>setEditing(false)}/>}
 {history&&<Dialog wide title={`Versiones · ${record.title}`} onClose={()=>setHistory(false)}><div className="version-list">{versions.map(v=><Button key={v.version} variant={preview?.version===v.version?'primary':'secondary'} onClick={()=>setPreview(v)}>v{v.version} · {dateLabel(v.createdAt)}</Button>)}</div>{preview?<><p className="meta">Firmantes previstos: {(preview.signerIds||[]).map(id=>db.partners.find(p=>p.id===id)?.name||id).join(', ')||'Sin registro en esta versión'}</p><DocumentViewer title={`${preview.title} · v${preview.version}`} filename={preview.filename} blobKey={preview.blobKey} content={preview.content}/></>:<p>Selecciona una versión para consultar o descargar su contenido.</p>}</Dialog>}</>;
}
