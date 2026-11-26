# Ejecutar con: . .\entorno-local.ps1
$noodoNode = Join-Path $PSScriptRoot '.tools\node-v24.14.1-win-x64'
$noodoPython = Join-Path $PSScriptRoot '.tools\python'
if (!(Test-Path "$noodoNode\node.exe") -or !(Test-Path "$noodoPython\python.exe")) {
    throw 'Faltan las herramientas locales de .tools. Consulta docs/LOCAL_WINDOWS.md.'
}
$env:PATH = "$noodoNode;$noodoPython;$env:PATH"
$env:npm_config_cache = Join-Path $PSScriptRoot '.tools\npm-cache'
