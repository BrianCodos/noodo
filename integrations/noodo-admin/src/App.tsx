import {BrowserRouter,Routes,Route,Navigate,Link} from 'react-router-dom';
import {StoreProvider} from './data/Store';
import {AppShell} from './components/layout/AppShell';
import {Dashboard} from './features/Dashboard';
import {Projects,ProjectDetail} from './features/Projects';
import {Contacts} from './features/Contacts';
import {Quotes} from './features/Quotes';
import {Meetings} from './features/Meetings';
import {MinutesPage} from './features/Minutes';
import {Legal,DocumentDetail,Signing} from './features/Legal';
import {Settings} from './features/Settings';
import {Components} from './features/Components';
import {Community} from './features/Community';
import {EmptyState} from './components/ui';
export function App(){return <StoreProvider><BrowserRouter><Routes><Route element={<AppShell/>}><Route index element={<Navigate to="/inicio" replace/>}/><Route path="inicio" element={<Dashboard/>}/><Route path="proyectos" element={<Projects/>}/><Route path="proyectos/:id/:tab?" element={<ProjectDetail/>}/><Route path="comunidad" element={<Community/>}/><Route path="contactos" element={<Contacts/>}/><Route path="cotizaciones" element={<Quotes/>}/><Route path="calendario" element={<Meetings/>}/><Route path="actas" element={<MinutesPage/>}/><Route path="legal" element={<Legal/>}/><Route path="documentos/:id" element={<DocumentDetail/>}/><Route path="documentos/:id/firmar" element={<Signing/>}/><Route path="configuracion" element={<Settings/>}/><Route path="componentes" element={<Components/>}/><Route path="*" element={<EmptyState title="Esta página no existe" action={<Link to="/inicio">Volver al inicio</Link>}/>}/></Route></Routes></BrowserRouter></StoreProvider>;}
