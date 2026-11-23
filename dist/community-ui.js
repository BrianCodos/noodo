/* Shared presentation primitives. Mascot is a parametric UI illustration based on character-reference.png. */
(() => {
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.noodoPageTitle={render:title=>`<h1 class="noodo-page-title">${escape(title)}</h1>`};
const colors={lavender:'var(--noodo-accent)',violet:'var(--noodo-primary)',cream:'var(--noodo-textPrimary)',mint:'var(--noodo-success)',sky:'var(--noodo-info)'};
function normalize(v={}){if(!v||typeof v!=='object')v={};return {color:Object.hasOwn(colors,v.color)?v.color:'lavender',expression:['classic','happy','listening','wink'].includes(v.expression)?v.expression:'classic',accessory:['none','note','mic','star'].includes(v.accessory)?v.accessory:'none'};}
function avatar(value={},label='Personaje NOODO') {const v=normalize(value),ink='var(--noodo-textPrimary)';const eye=(x,closed=false)=>closed?`<path d="M${x-10} 62q10 13 20 0"/>`:`<circle cx="${x}" cy="61" r="16"/><circle cx="${x}" cy="61" r="10"/><path d="M${x-5} 61a5 5 0 1 0 8-4"/>`;
let eyes=v.expression==='happy'?'<path d="M30 64q10-17 20 0m20 0q10-17 20 0"/>':eye(40,v.expression==='listening')+eye(80,v.expression==='listening'||v.expression==='wink');
const accessory={none:'',note:'<path d="M95 24V10l13-3v14"/><ellipse cx="90" cy="25" rx="5" ry="3" fill="currentColor"/><ellipse cx="103" cy="22" rx="5" ry="3" fill="currentColor"/>',mic:'<g transform="rotate(-25 95 85)"><rect x="91" y="70" width="10" height="15" rx="5"/><path d="M96 85v17"/></g>',star:'<path d="m101 7 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z"/>'}[v.accessory];
return `<svg class="noodo-avatar" style="stroke:none" viewBox="0 0 120 120" role="img" aria-label="${escape(label)}"><circle cx="60" cy="60" r="54" fill="var(--noodo-background)"/><g fill="none" stroke="${colors[v.color]}" stroke-width="8" stroke-linecap="round"><path d="M16 59V51a44 44 0 0 1 88 0v8"/><rect x="9" y="49" width="10" height="29" rx="5" fill="${colors[v.color]}"/><rect x="101" y="49" width="10" height="29" rx="5" fill="${colors[v.color]}"/></g><g fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round">${eyes}</g><g fill="${ink}"><path d="m39 87-4 14q-2 7 5 7h13q6-1 3-7l-6-3 1-11Z"/><path d="m70 87 1 15q0 6 6 6h13q7-3 1-8l-8-3-2-10Z"/></g><g fill="none" color="${colors[v.color]}" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${accessory}</g></svg>`;
}
window.noodoAvatar={render:avatar,normalize};
})();
