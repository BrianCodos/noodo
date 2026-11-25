/* Contextual controls share the header. Original nodes keep their state and handlers. */
(() => {
 'use strict';
 const center = document.getElementById('center-stage');
 const header = document.querySelector('.topbar-center');
 if (!center || !header) return;
 const compact = matchMedia('(max-width:1100px)');
 const outlet = document.createElement('div');outlet.className = 'section-tools';outlet.hidden = true;
 const toggle = document.createElement('button');toggle.type = 'button';toggle.className = 'icon-button section-tools-toggle';toggle.setAttribute('aria-controls', 'section-tools-controls');toggle.setAttribute('aria-expanded', 'false');
 toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/></svg>';
 const controls = document.createElement('div');controls.id = 'section-tools-controls';controls.className = 'section-tools-controls';controls.setAttribute('role', 'group');
 outlet.append(toggle, controls);header.append(outlet);
 const entries = new Map();let open = false, activeOwner = null;
 const selectors = '.radar-view-switch,.artist-view-switch,.search-categories,.co-forum-filters,.co-match label:has(#co-discipline)';
 function labelFor(node) {
  if (node.matches('.radar-view-switch')) return 'Radar';
  if (node.matches('.artist-view-switch')) return 'Artistas';
  if (node.matches('.search-categories')) return 'búsqueda';
  return node.matches('.co-forum-filters') ? 'Foro' : 'Nodo Match';
 }
 function paint() {
  toggle.hidden = !compact.matches;
  controls.hidden = compact.matches && !open;
  toggle.setAttribute('aria-expanded', String(open && compact.matches));
  outlet.classList.toggle('is-open', open && compact.matches);
 }
 function close(restoreFocus = false) {open = false;paint();if (restoreFocus && !outlet.hidden && compact.matches) toggle.focus({preventScroll:true});}
 function sync() {
  const focused = document.activeElement, focusedId = focused?.id;
  let restoreFocus = false;
  for (const [node, entry] of entries) {
   if (!entry.anchor.isConnected) {
    restoreFocus ||= node.contains(focused);
    node.remove();entries.delete(node);
   }
  }
  center.querySelectorAll(selectors).forEach(node => {
   if (entries.has(node)) return;
   const owner = node.closest('.central-panel,#radar-view,#artist-view,#listen-view');
   if (!owner) return;
   const anchor = document.createComment('Section tools home');node.before(anchor);
   entries.set(node, {owner, anchor});
  });
  const active = [...entries].filter(([,entry]) => !entry.owner.closest('[hidden]') && !entry.anchor.parentElement.closest('[hidden]'));
  const owner = active[0]?.[1].owner || null;
  if (owner !== activeOwner) {close();activeOwner = owner;}
  for (const [node, entry] of entries) {
   if (active.some(([item]) => item === node)) {
    if (node.parentElement !== controls) {restoreFocus ||= node.contains(focused);controls.append(node);}
   } else if (node.parentElement === controls) entry.anchor.after(node);
  }
  const name = active.length ? labelFor(active[0][0]) : '';
  outlet.hidden = !active.length;
  outlet.dataset.section = name;
  controls.setAttribute('aria-label', 'Filtros de ' + name);
  toggle.setAttribute('aria-label', 'Filtros de ' + name);toggle.title = 'Filtros de ' + name;
  paint();
  if (restoreFocus && !controls.hidden) {
   const replacement = focused?.isConnected ? focused : focusedId ? document.getElementById(focusedId) : null;
   replacement?.focus({preventScroll:true});
  }
 }
 toggle.onclick = () => {open = !open;paint();if (open) controls.querySelector('button,select')?.focus({preventScroll:true});};
 outlet.addEventListener('keydown', event => {if (event.key === 'Escape' && open) {event.preventDefault();event.stopPropagation();close(true);}});
 document.addEventListener('pointerdown', event => {if (!outlet.contains(event.target)) close();});
 outlet.addEventListener('focusout', () => queueMicrotask(() => {if (!outlet.contains(document.activeElement)) close();}));
 compact.addEventListener('change', () => {
  const focused = outlet.contains(document.activeElement);close();
  if (focused && !outlet.hidden) (compact.matches ? toggle : controls.querySelector('button,select'))?.focus({preventScroll:true});
 });
 new MutationObserver(sync).observe(center, {childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
 // Return controls before their owning component checks or replaces its DOM.
 window.noodoSectionTools = {restore(owner) {
  for (const [node,entry] of entries) if (entry.owner === owner && entry.anchor.isConnected && node.parentElement === controls) entry.anchor.after(node);
 }};
 sync();
})();
