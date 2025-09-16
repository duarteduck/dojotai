param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Write-Host "🚀 Iniciando deploy do Dojotai..." -ForegroundColor Blue

Write-Host "📝 Fazendo commit..." -ForegroundColor Yellow
git add .
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no commit" -ForegroundColor Red
    exit 1
}

Write-Host "📤 Enviando para Google Apps Script..." -ForegroundColor Blue
clasp push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no clasp push" -ForegroundColor Red
    exit 1
}

Write-Host "💾 Fazendo backup no GitHub..." -ForegroundColor Blue
git push github main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no push GitHub" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deploy completo!" -ForegroundColor Green
Write-Host "   - Google Apps Script atualizado" -ForegroundColor Gray
Write-Host "   - GitHub sincronizado" -ForegroundColor Gray