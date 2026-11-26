# Entorno local de Windows

Preparado y verificado el 26 de noviembre de 2026 en `C:\Users\brian\Documents\ChatGPT\Noodo`, desde `BrianCodos/noodo`, rama `main`.

## Iniciar

Desde PowerShell, en la raíz del repositorio:

```powershell
.\iniciar-local.ps1
```

Mantener la terminal abierta. Ctrl+C detiene los servidores. El script comprueba que los puertos estén libres; no termina procesos ajenos ni cambia el origen de los datos.

- Sitio musical: <http://127.0.0.1:4174/listen.html>
- Sistema de diseño: <http://127.0.0.1:4174/>
- Dashboard: <http://127.0.0.1:5173/inicio>

## Herramientas y comandos

Herramientas portables instaladas exclusivamente en `.tools/`: Node.js 24.14.1, npm 11.11.0 y Python 3.14.10 (distribución embebida, suficiente para `http.server`, sin pip). No se cambió el PATH global. Fuentes oficiales: [Node.js](https://nodejs.org/dist/v24.14.1/) y [Python](https://www.python.org/downloads/release/python-31410/); archivos ZIP comprobados mediante SHA-256.

Para usar estas versiones en la terminal actual:

```powershell
. .\entorno-local.ps1
node --version
python --version
cd noodo-admin
npm.cmd test
npm.cmd run build
```

Las dependencias se instalaron con `npm ci`, respetando `package-lock.json`. Para reinstalarlas, activar primero el entorno y ejecutar `npm.cmd ci` desde `noodo-admin/`.

`.tools/`, `.local/`, `node_modules/` y el build del admin están ignorados por Git. Los runtimes no viajan en un clon nuevo: instalar Node.js 24 y Python 3 siguiendo el README o volver a preparar las carpetas portables indicadas en `entorno-local.ps1`.

Este clon usa `git config --local core.autocrlf false`. Los archivos se extrajeron de nuevo con LF: CRLF hacía fallar las huellas de tokens y la comprobación del CSS generado. No se cambiaron las huellas aprobadas ni los archivos de diseño.

## Verificación

- Sitio: CSS generado sincronizado, 36 pruebas aprobadas y sintaxis de todos los `dist/*.js` comprobada.
- Dashboard: 66 pruebas aprobadas, sistema de diseño verificado y compilación de producción correcta.
- npm informó 0 vulnerabilidades durante la instalación.
- Respuestas HTTP 200 del sitio, sistema de diseño, Comunidad, dashboard y módulo de entrada de Vite. No se realizó una revisión visual completa de la interfaz.
- Vite mantiene un aviso de tamaño del bundle JavaScript (aproximadamente 523 kB); no impide compilar ni ejecutar.

En Codex, los servidores tuvieron que iniciarse fuera del aislamiento de red para ser accesibles desde el navegador. No se modificó el firewall ni la política de ejecución de PowerShell.

La sesión de GitHub CLI (`gh`) encontrada tiene una credencial inválida. Esto no impidió descargar el repositorio público ni trabajar localmente; para subir mediante esa CLI habrá que volver a iniciar sesión. No se hizo commit ni push durante esta preparación.

Los datos y adjuntos del navegador no forman parte del clon. Consultar el README para exportación y conservación de datos.
