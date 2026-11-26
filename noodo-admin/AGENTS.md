# noodo — app administrativa

## Fuente gráfica obligatoria
Antes de diseñar o modificar cualquier interfaz, consultar los archivos vigentes de `../dist/` en el repositorio completo (o `../noodo-design-system/dist/` en la distribución histórica de carpetas hermanas), seleccionando la versión más reciente de `noodo-design-system-v*.json` y `noodo-tokens-v*.css`. `scripts/design-system-path.mjs` resuelve la ubicación. El sistema de diseño de noodo es la autoridad gráfica. Volver a comprobar la versión disponible antes de cada trabajo; no fijar una versión antigua como autoridad permanente.

Mantener esta aplicación en `noodo-admin/`, separada del sitio estático `dist/` y de sus fuentes gráficas. Reutilizar tokens y contratos de componentes; evitar una paleta o biblioteca visual paralela. Proponer las extensiones administrativas como componentes del sistema antes de introducir estilos inconsistentes. No modificar el sistema de diseño como efecto secundario de un cambio de la app. Leer también el `AGENTS.md` raíz: contiene propósito, instalación, estado y memoria completa de NOODO.

## Alcance actual
La aplicación React + TypeScript + Vite vive en `src/`. `planning/` conserva la planeación. El 26 de noviembre de 2026 el usuario autorizó incorporar y subir todo el proyecto, incluido el dashboard, a `BrianCodos/noodo`. Versionar su fuente completa está autorizado en esta tarea. Su ejecución sigue siendo local; el workflow de Pages publica solo el sitio musical, no el portal administrativo. Desplegar el portal requiere una petición de despliegue y resolver acceso/persistencia.

- `src/components/ui/`: componentes base reutilizables y sus contratos de accesibilidad.
- `src/components/layout/`: navegación y estructura compartida.
- `src/components/domain/`: componentes de proyectos, compromisos y selectores comunes.
- `src/features/`: pantallas por módulo; no duplicar primitivas de UI.
- `src/data/`: tipos, persistencia local y datos de ejemplo; ninguna firma real se guarda desde el cliente.
- `src/lib/`: funciones compartidas de fechas, importes y búsqueda.

Ejecutar `npm run design:check` antes de diseñar. Si cambia la guía, leer y comparar los cambios; solo después actualizar `design-system.lock.json`. La fecha de exportación se ignora en la huella, pero los tokens y contratos sí se verifican. La importación `@noodo/tokens` de `src/main.tsx` se resuelve en Vite al archivo del lock y nunca debe sustituirse por una copia local de la paleta.

Validación: `npm test` y `npm run build`. Arranque local: `npm run dev`. Probar en navegador los flujos cambiados y el ancho móvil. Los ejemplos están identificados; el almacenamiento del navegador no es un backend ni una capa de autenticación.

## Firma
La experiencia debe suceder desde noodo: revisión, confirmación de identidad y firma. No marcar documentos como firmados desde el navegador ni simular evidencias legales. La implementación real requiere identidad autenticada, autorización de cada firmante, proveedor configurado, verificación del resultado en el servidor y conservación del original y sus evidencias. No guardar claves del proveedor en el frontend. Una firma parcial no es firma de todos; no sobrescribir documentos firmados.

## Patrones administrativos compartidos
Usar `Workspace` / `DetailPanel` para llenar el panel derecho permanente de `AppShell` con resúmenes y accesos. El expediente completo y el visor de documentos se abren en el centro; `Dialog` sigue siendo la superficie de edición. Usar `SectionToolbar` para acciones y controles de sección. Los formularios usan `Field`, `Select`, `Textarea`, `FormActions` y `Alert`. Reutilizar `TaskEditor`, `MinutesEditor`, `RecordAttachments` y `FollowUps`; no crear variantes por módulo. `PageHeader` no presenta antetítulos. Ver `docs/component-contracts.md`.

Las reuniones y el LOG no ofrecen borrado. Los estados Cancelada / Anulado conservan los registros. Mantener la migración no destructiva, las versiones anterior/posterior en cada guardado y los adjuntos acumulativos. No reintroducir recorte de historial ni vaciado global.

## Reglas de acciones y cabeceras
- Las acciones principales de sección se alinean con su título mediante `PageHeader`; no van en la barra global de navegación. En móvil pueden pasar a la línea siguiente.
- Las acciones de filas y tablas se representan con iconos, siempre con nombre accesible y tooltip. Usar `IconButton` o enlaces equivalentes; si hay demasiadas acciones, un icono Más acciones abre un Dialog con opciones identificadas por icono y texto. No usar controles de fila con textos sueltos como Ver u Opciones.
- Los controles de icono usan el mismo objetivo de 44 × 44 px. En el grupo de personas, Avatar y el botón + comparten diámetro visual y altura; no mezclar avatares pequeños con acciones grandes. Los botones de texto comparten altura mínima de 44 px y ajustan su ancho al contenido.
