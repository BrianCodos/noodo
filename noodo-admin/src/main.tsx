import {StrictMode,Component,type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import '@noodo/tokens';
import './styles.css';
class ErrorBoundary extends Component<{children:ReactNode},{error:string}> {state={error:''};static getDerivedStateFromError(error:Error){return{error:error.message};}render(){return this.state.error?<main className="startup-error"><div className="wordmark">noodo.</div><h1>No pudimos abrir el espacio local.</h1><p>{this.state.error}</p><p>Los datos originales no se han borrado. Revisa el almacenamiento local antes de volver a cargar.</p><button className="button button-primary" onClick={()=>location.reload()}>Volver a intentar</button></main>:this.props.children;}}
createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><App/></ErrorBoundary></StrictMode>);
