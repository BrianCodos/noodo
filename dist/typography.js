'use strict';
const typographySystem={
 family:'-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
 reference:'PP Neue Montreal · dossier p. 9 · archivos oficiales pendientes',
 case:'Sentence case; preserve brand names, acronyms and code identifiers',
 minimumSize:12,
 roles:{
  display:{size:48,lineHeight:52,mobileSize:30,mobileLineHeight:36,weight:600,tracking:'-0.035em',usage:'Mensaje principal de una pieza destacada. Máximo uno por vista.'},
  title:{size:32,lineHeight:38,mobileSize:24,mobileLineHeight:30,weight:600,tracking:'-0.025em',usage:'Título de página o diálogo principal.'},
  heading:{size:24,lineHeight:30,mobileSize:20,mobileLineHeight:26,weight:600,tracking:'-0.02em',usage:'Secciones y títulos de cards destacadas.'},
  body:{size:16,lineHeight:24,weight:400,tracking:'0',usage:'Párrafos, descripciones y contenido de lectura.'},
  label:{size:14,lineHeight:20,weight:500,tracking:'0',usage:'Navegación, botones, filtros y nombres de pistas.'},
  meta:{size:12,lineHeight:18,weight:400,tracking:'0',usage:'Duración, artista secundario, créditos y ayuda breve.'}
 }
};
function typographyCSS(){let css='/* NOODO · Tipografía semántica compartida. Generado desde typography.js. */\n:root{\n  --font-family-ui: '+typographySystem.family+';\n';for(const [name,r] of Object.entries(typographySystem.roles)){css+=`  --type-${name}-size: ${r.size}px;\n  --type-${name}-line: ${r.lineHeight}px;\n  --type-${name}-weight: ${r.weight};\n  --type-${name}-tracking: ${r.tracking};\n  --type-${name}: ${r.weight} var(--type-${name}-size)/var(--type-${name}-line) var(--font-family-ui);\n`;}css+='}\n@media(max-width:760px){:root{\n';for(const [name,r] of Object.entries(typographySystem.roles)){if(r.mobileSize)css+=`  --type-${name}-size: ${r.mobileSize}px;\n  --type-${name}-line: ${r.mobileLineHeight}px;\n`;}css+='}}\n';return css;}
