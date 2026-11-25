/* Explicit consent before opening Google Maps; native dialog handles focus trapping. */
(() => {
 'use strict';
 function mapsURL(value) {
  try {
   const url = new URL(value);
   return url.protocol === 'https:' && ['www.google.com', 'maps.google.com', 'google.com'].includes(url.hostname) && (url.hostname === 'maps.google.com' || /^\/maps(?:\/|$)/.test(url.pathname)) ? url.href : null;
  } catch { return null; }
 }
 window.noodoExternalNavigation = {mapsURL};
 if (typeof document === 'undefined') return;
 let dialog, trigger;
 function confirm(link) {
  const href = mapsURL(link.href);
  if (!href) return;
  if (!dialog) {
   dialog = document.createElement('dialog');
   dialog.className = 'external-navigation-dialog';
   dialog.setAttribute('aria-labelledby', 'external-navigation-title');
   dialog.setAttribute('aria-describedby', 'external-navigation-copy');
   dialog.innerHTML = '<h2 id="external-navigation-title">Abrir Google Maps</h2><p id="external-navigation-copy">Este link abrirá una aplicación externa, Google Maps.</p><div class="external-navigation-actions"><button type="button" class="pill outline" autofocus>Quedarse en la página</button><a class="pill primary" target="_blank" rel="noopener noreferrer">Aceptar</a></div>';
   document.body.append(dialog);
   dialog.querySelector('button').onclick = () => dialog.close('cancel');
   dialog.querySelector('a').onclick = () => dialog.close('accept');
   dialog.addEventListener('keydown', event => {if (event.key === 'Escape') event.stopPropagation();});
   dialog.addEventListener('close', () => {if (trigger?.isConnected) trigger.focus({preventScroll:true});trigger = null;});
  }
  trigger = link;
  dialog.querySelector('a').href = href;
  if (!dialog.open) dialog.showModal();
 }
 function intercept(event) {
  if (event.type === 'auxclick' && event.button !== 1) return;
  const link = event.target.closest('a[href]');
  if (!link || link.closest('.external-navigation-dialog') || !mapsURL(link.href)) return;
  event.preventDefault();event.stopPropagation();confirm(link);
 }
 document.addEventListener('click', intercept, true);
 document.addEventListener('auxclick', intercept, true);
})();
