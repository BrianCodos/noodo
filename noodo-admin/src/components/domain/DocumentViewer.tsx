import {useEffect,useState} from 'react';
import {Alert,Button} from '../ui';
import {getFile} from '../../data/repository';
import {download} from '../../lib/format';
/** Local files only: no external viewer receives document contents. */
export function DocumentViewer({title,blobKey,filename='',content=''}:{title:string;blobKey?:string;filename?:string;content?:string}) {
 const [state,setState]=useState<{key?:string;url?:string;text?:string;file?:File;error?:string}>({});
 useEffect(()=>{let alive=true;let url='';if(!blobKey)return;setState({key:blobKey});getFile(blobKey).then(async file=>{if(!file)throw new Error('Este archivo no está disponible en el navegador.');const text=/\.txt$/i.test(filename)?await file.text():undefined;url=URL.createObjectURL(file);if(alive)setState({key:blobKey,url,text,file});else URL.revokeObjectURL(url);}).catch(e=>{if(alive)setState({key:blobKey,error:(e as Error).message});});return()=>{alive=false;if(url)URL.revokeObjectURL(url);};},[blobKey,filename]);
 if(!blobKey)return <div className="document-viewer"><div className="viewer-tools"><span className="meta">{title}</span><Button variant="secondary" onClick={()=>download(new Blob([content],{type:'text/plain;charset=utf-8'}),`${title}.txt`)}>Descargar</Button></div><article className="document-paper"><h2>{title}</h2><p className="preserve-lines">{content||'Sin contenido de texto.'}</p></article></div>;
 if(state.key===blobKey&&state.error)return <Alert kind="error">{state.error}</Alert>;
 if(state.key!==blobKey||!state.file)return <p role="status">Cargando documento…</p>;
 return <div className="document-viewer"><div className="viewer-tools"><span className="meta">{filename}</span><Button variant="secondary" onClick={()=>download(state.file!,filename)}>Descargar</Button></div>{/\.pdf$/i.test(filename)||state.file.type==='application/pdf'?<iframe title={`Documento: ${title}`} src={state.url}/>:/\.(png|jpe?g|webp)$/i.test(filename)?<img className="document-image" src={state.url} alt={title}/>:state.text!==undefined?<article className="document-paper"><pre className="text-preview">{state.text}</pre></article>:<Alert>Este formato se conserva como adjunto. Descárgalo para abrirlo en su aplicación. El visor integrado admite PDF, imágenes y texto.</Alert>}</div>;
}
