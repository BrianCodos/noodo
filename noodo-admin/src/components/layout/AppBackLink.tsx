import {Link,useLocation} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';
import {useStore} from '../../data/Store';
import {backDestination} from '../../lib/back-destination';
export function AppBackLink(){const {db}=useStore();const {pathname}=useLocation();const target=backDestination(pathname,db);return target?<Link className="app-back-link topbar-back icon-button" to={target.to} aria-label={target.label} title={target.label}><ArrowLeft size={18} aria-hidden="true"/></Link>:null;}
