$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'entorno-local.ps1')

# Comprobar ambos puertos antes de iniciar; conservar el origen de los datos.
foreach ($port in @(4174, 5173)) {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
    try { $listener.Start() }
    catch { throw "El puerto $port esta ocupado. Cierra el servidor anterior antes de iniciar NOODO." }
    finally { $listener.Stop() }
}

$logDirectory = Join-Path $PSScriptRoot '.local'
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
$siteProcess = Start-Process -FilePath (Join-Path $noodoPython 'python.exe') `
    -ArgumentList @('-m', 'http.server', '4174', '--bind', '127.0.0.1', '--directory', 'dist') `
    -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $logDirectory 'sitio.log') `
    -RedirectStandardError (Join-Path $logDirectory 'sitio-error.log')

Push-Location (Join-Path $PSScriptRoot 'noodo-admin')
try {
    Start-Sleep -Milliseconds 500
    if ($siteProcess.HasExited) { throw 'El sitio no inicio. Revisa .local/sitio-error.log.' }
    Write-Host 'Sitio:     http://127.0.0.1:4174/listen.html'
    Write-Host 'Dashboard: http://127.0.0.1:5173/inicio'
    Write-Host 'Pulsa Ctrl+C para detener los servidores.'
    & (Join-Path $noodoNode 'npm.cmd') run dev
    if ($LASTEXITCODE -ne 0) { throw "El dashboard termino con codigo $LASTEXITCODE." }
}
finally {
    if (!$siteProcess.HasExited) { Stop-Process -InputObject $siteProcess }
    Pop-Location
}
