import {type ReactNode} from 'react';
import {useStore} from '../../data/Store';
export function ActivePartnerProvider({children}:{children:ReactNode}){return children;}
export function useActivePartner(){const {activePartner:partner,selectPartner}=useStore();return {partner,selectPartner};}
