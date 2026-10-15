$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$libraryNode = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $libraryNode) {
    $libraryNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
}
if (-not (Test-Path -LiteralPath $libraryNode)) { throw 'Node.js 22.13 이상이 필요합니다.' }
if (-not (Test-Path -LiteralPath 'node_modules/vinext')) { throw '먼저 npm install을 실행해 주세요.' }
Write-Host 'Library Navigator: http://127.0.0.1:5173/'
Write-Host 'Admin: http://127.0.0.1:5173/admin'
& $libraryNode scripts/run-framework.mjs dev --hostname 127.0.0.1 --port 5173
