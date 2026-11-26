import { createContext, useContext, useEffect, useRef, useId, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './index';

const CloseContext = createContext<(() => void) | null>(null);
export function useDialogClose(fallback: () => void) {
  return useContext(CloseContext) ?? fallback;
}

export function Dialog({ title, description, children, onClose, wide = false, protectChanges = false, changeKey }: {
  title: string; description?: string; children: ReactNode; onClose: () => void;
  wide?: boolean; protectChanges?: boolean; changeKey?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const initialChangeKey = useRef(changeKey);
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  useEffect(() => {
    if (changeKey !== initialChangeKey.current) setDirty(true);
  }, [changeKey]);
  const requestClose = () => {
    if (protectChanges && dirty) setConfirmClose(true);
    else onClose();
  };

  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const dialog = ref.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLElement>('input:not([type="hidden"]), textarea, select')?.focus();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = old;
      if (previous?.isConnected) previous.focus();
    };
  }, []);

  useEffect(() => {
    if (!protectChanges || !dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty, protectChanges]);

  return <CloseContext.Provider value={requestClose}>
    <dialog ref={ref} className={`dialog ${wide ? 'dialog-wide' : ''}`} aria-labelledby={id}
      onCancel={event => { event.preventDefault(); requestClose(); }}>
      <div className="dialog-header">
        <div><h2 id={id}>{title}</h2>{description && <p>{description}</p>}</div>
        <IconButton label="Cerrar ventana" onClick={requestClose}><X size={20}/></IconButton>
      </div>
      <div className="dialog-body" onChangeCapture={() => setDirty(true)}>{children}</div>
    </dialog>
    {confirmClose && <Dialog title="Tienes cambios sin guardar" onClose={() => setConfirmClose(false)}>
      <p>Si cierras este formulario, se perderán los cambios que aún no has guardado.</p>
      <div className="form-actions">
        <button className="button button-secondary" onClick={() => setConfirmClose(false)}>Seguir editando</button>
        <button className="button button-danger" onClick={onClose}>Descartar cambios</button>
      </div>
    </Dialog>}
  </CloseContext.Provider>;
}
