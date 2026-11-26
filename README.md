# NOODO

Proyecto cultural y musical de Cali: sitio de descubrimiento, sistema de diseño compartido y dashboard de socios para gestionar proyectos y operación.

**Estado al 26 de noviembre de 2026:** el sitio musical es un prototipo publicado; el dashboard completo está versionado y funciona localmente. No hay backend, cuentas autenticadas, streaming real, cobros ni firmas activas. Los datos del portal se guardan en el navegador.

## Empezar

En este equipo Windows ya preparado, ejecutar `.\iniciar-local.ps1` desde PowerShell en la raíz para iniciar ambos servidores. Ver [entorno local de Windows](docs/LOCAL_WINDOWS.md).

Requisitos: Git, Python 3 y Node.js 24 con npm.

```sh
git clone https://github.com/BrianCodos/noodo.git
cd noodo
```

Terminal para sitio musical y sistema de diseño:

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory dist
```

Otra terminal, desde la raíz del repositorio, para el dashboard:

```sh
cd noodo-admin
npm ci
npm run dev
```

| Acceso | URL |
| --- | --- |
| Sitio musical local | http://127.0.0.1:4174/listen.html |
| Design system local | http://127.0.0.1:4174/ |
| Dashboard de socios | http://127.0.0.1:5173/inicio |
| Presupuestos | http://127.0.0.1:5173/presupuestos |
| Socios y configuración | http://127.0.0.1:5173/configuracion#socios |
| Sitio publicado | https://briancodos.github.io/noodo/listen.html |

Mantener el hostname y puerto habituales para conservar acceso a los datos: `localhost` y `127.0.0.1` tienen almacenamientos distintos. El puerto del admin es estricto. Comunidad se integra desde el servidor 4174, que debe estar activo.

## Qué incluye

- **Sitio:** artistas, canciones, álbumes, Sessions, géneros, playlists, favoritos, búsqueda unificada, Radar con Mapbox, eventos, checkout demo, Comunidad, salas, foro y Match.
- **Diseño:** tokens semánticos, catálogo de componentes, editor de tema, estilos modulares, documentación, recursos y evidencia de Figma.
- **Dashboard:** proyectos con tareas/subtareas, prioridades, socios, contactos, agenda, documentos y versiones, comentarios/menciones, presupuestos/cuentas manuales, cotizaciones, contabilidad y LOG conservado.
- **Continuidad:** código completo del admin, lockfile, pruebas, mapas de planeación, capturas, documentos fundacionales versionados, originales de imágenes e instrucciones para otro agente/equipo.

## Estructura y documentación

| Ruta | Contenido |
| --- | --- |
| `dist/` | Fuentes del sitio, design system y assets publicados. No borrar. |
| `styles/workspace/`, `scripts/`, `tests/` | CSS modular, generación y pruebas del sitio. |
| `noodo-admin/` | Aplicación administrativa completa. Su `dist/` propio sí es un build descartable. |
| `design/figma/` | Biblioteca, scripts y evidencia; sin sincronización automática con la web. |
| `documentos/` | Acuerdos v1–v4 y plan operativo, borradores sin acreditar firma. |
| `generated_images/` | Originales gráficos del proyecto. |
| `docs/` | Historial, inventario y verificación. |

**Leer [AGENTS.md](AGENTS.md) antes de continuar:** propósito, arquitectura, instalación, rutas, reglas de uso/diseño, persistencia, estado, decisiones y memoria del proyecto.

Más detalle: [dashboard](noodo-admin/README.md), [contratos administrativos](noodo-admin/docs/component-contracts.md), [presupuestos](noodo-admin/docs/presupuestos-monymi.md), [design system](DESIGN_SYSTEM.md), [checkout](CHECKOUT.md), [verificación actual](docs/VERIFICACION_2026-11-26.md) e [historial web](docs/HISTORIAL_WEB.md).

## Validación

Desde la raíz:

```sh
node scripts/build-workspace.cjs --check
node --test tests/*.test.cjs
for file in dist/*.js; do node --check "$file" || exit 1; done
```

Desde `noodo-admin/`:

```sh
npm run design:check
npm test
npm run build
```

Editar `styles/workspace/*` y regenerar con `node scripts/build-workspace.cjs`; no modificar solo el CSS generado. El admin consume los tokens compartidos e impide arrancar si sus huellas no coinciden con la versión revisada.

## Datos y publicación

El repositorio es público. El workflow de Pages publica solo `dist/` cuando cambia en `main`; no despliega el portal ni sirve los documentos de trabajo. No incluir credenciales, archivos `.env`, dependencias instaladas ni exportaciones privadas del navegador.

El token de Mapbox del frontend debe ser público (`pk.`). La publicación lo configura desde `MAPBOX_PUBLIC_TOKEN` en GitHub Actions. Sin token, la lista de eventos funciona y el mapa muestra su indisponibilidad.

Un push o clon **no respalda la base de datos del navegador**. En el portal, Configuración exporta los registros JSON; descargar los adjuntos por separado porque viven en IndexedDB. No existe sincronización entre dispositivos ni restauración completa desde la UI. Selección de socio y notificaciones son locales. El historial y los adjuntos se conservan mediante migraciones aditivas y versiones, sin purga automática.
