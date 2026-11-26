# Verificación de la consolidación · 26 de noviembre de 2026

## Alcance

Se incorpora el dashboard completo desde la carpeta de trabajo hermana a `noodo-admin/`, sustituyendo la antigua copia parcial de cuatro archivos en `integrations/noodo-admin/`. Se preservan el sitio musical, sus assets, los cinco DOCX del proyecto y trece originales gráficos. Las dos copias DOCX de la raíz del workspace coinciden byte por byte con las de `documentos/`; se conservan una vez.

`AGENTS.md` raíz reúne propósito, estructura, instalación, estado, navegación, persistencia, reglas de UI/datos/firma, publicación, decisiones y pendientes. Se actualizan README general y administrativo, instrucciones del admin e inventario. El historial anterior sigue disponible en los documentos de historial.

## Ajustes necesarios para instalar en otro equipo

- Resolver compartido del DS: funciona con `dist/` en la raíz del clon y con la distribución histórica de carpetas hermanas.
- Alias `@noodo/tokens` resuelto al CSS indicado en el lockfile, con declaración TypeScript para la importación de estilos.
- Puerto 5173 estricto, evitando que un puerto alternativo aparente perder datos del navegador.
- Node 24 declarado en package/lock; no se actualizan versiones de dependencias.
- El token público Mapbox se conserva únicamente en el archivo de trabajo local. GitHub rechazó la subida inicial por detección de una credencial; la configuración con token se excluye del commit. El archivo versionado mantiene su valor vacío y el workflow existente usa `MAPBOX_PUBLIC_TOKEN` al publicar. No se evade la regla de protección.

## Resultados ejecutados

| Comprobación | Resultado |
| --- | --- |
| `node scripts/build-workspace.cjs --check` | Correcto; CSS modular y bundle sincronizados. |
| `node --test tests/*.test.cjs` | 36/36 pruebas correctas. |
| `node --check` para cada `dist/*.js` | Correcto. |
| Admin original: `npm test` | 66/66 pruebas, 12 archivos. |
| Admin original: `npm run build` | Correcto; DS, índice de 79 registros, TypeScript y Vite. |
| Admin incorporado: `npm ci --offline --no-audit --no-fund` | Correcto; instalación limpia de 52 paquetes desde caché, usando el lockfile. |
| Admin incorporado: `npm test` | 66/66 pruebas, 12 archivos. |
| Admin incorporado: `npm run build` | Correcto; DS y catálogo desde el `dist/` del repositorio. |
| `git diff --check` | Sin errores de espacios. |
| Revisión de patrones de secretos | Sin coincidencias de claves privadas, claves OpenAI, tokens GitHub o access-key IDs AWS en archivos de texto candidatos. No sustituye una auditoría de seguridad completa. |
| Tamaños | Ningún archivo supera 95 MB. |

Build del admin: CSS 83,11 kB (14,20 kB gzip); JS 522,99 kB (151,45 kB gzip). Vite advierte que el bundle principal supera 500 kB; no impide compilar. Separación de módulos/carga diferida queda como optimización futura y no se cambia durante esta consolidación.

No se modifican pantallas ni lógica de negocio. No se realizó una nueva revisión visual en navegador en esta tarea; las capturas y recorridos previos están fechados en sus propios documentos. No se modifica ni exporta la base del navegador del usuario.

## Publicación y límites

Se prepara para subir a `BrianCodos/noodo`, rama `main`, sobre la base `4f9049474ea05c89bbc6464ebbd478e1206c8acc`. El workflow existente solo publica `dist/`. El dashboard se conserva como fuente completa, sin despliegue público nuevo. El código y documentación no son un backup de localStorage/IndexedDB.

La terminal no pudo resolver `github.com` en este entorno; la actualización remota se realiza mediante el conector GitHub y debe verificarse en `refs/heads/main`. No hacer force-push ni descartar cambios remotos.
