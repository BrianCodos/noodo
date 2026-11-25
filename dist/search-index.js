/* Shared, accent-insensitive search over every public catalog surface. */
(() => {
 'use strict';
 const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim().replace(/\s+/g, ' ');
 function find(entries, value) {
  const query = normalize(value), words = query.split(' ');
  if (!query) return [];
  return entries.map((entry, order) => {
   const title = normalize(entry.title), code = normalize(entry.code);
   const haystack = normalize([entry.title, entry.subtitle, entry.keywords, entry.code].filter(Boolean).join(' '));
   const score = code === query ? 4 : title === query ? 3 : title.startsWith(query) ? 2 : 1;
   return {entry, order, score, matches: words.every(word => haystack.includes(word))};
  }).filter(item => item.matches).sort((a, b) => b.score - a.score || a.order - b.order).map(item => item.entry);
 }
 window.noodoSearchIndex = {normalize, find};
})();
