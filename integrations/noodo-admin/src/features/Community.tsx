import {PageHeader,Alert} from '../components/ui';
// The iframe shares the public prototype's origin and therefore its local demo data.
const communityURL=`http://${window.location.hostname}:4174/community-admin.html`;
export function Community(){return <><PageHeader eyebrow="La escena se encuentra aquí" title="Comunidad" description="Salas oficiales y publicaciones de la comunidad."/><Alert>Vista previa local. Las salas y el foro comparten datos con NOODO en el puerto 4174 de este navegador.</Alert><iframe title="Administrar Comunidad NOODO" src={communityURL} style={{width:'100%',height:'1100px',border:0,marginTop:24,borderRadius:16}}/><a href={communityURL} target="_blank" rel="noopener" className="text-link">Abrir administración en otra pestaña ↗</a></>;}
