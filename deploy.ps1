param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Write-Host "🚀 Iniciando deploy do Dojotai..." -ForegroundColor Blue

Write-Host "📝 Fazendo commit..." -ForegroundColor Blue
git add .
git commit -m $Message

Write-Host "📤 Enviando para Google Apps Script..." -ForegroundColor Blue
clasp push

Write-Host "💾 Fazendo backup no GitHub..." -ForegroundColor Blue
git push github main

Write-Host "✅ Deploy completo!" -ForegroundColor Green
Write-Host "   - Google Apps Script atualizado" -ForegroundColor Green
Write-Host "   - GitHub sincronizado" -ForegroundColor Green