Write-Host "Deploy Dojotai (sem duplicacao)..." -ForegroundColor Green

# Verifica se ha mudancas nao commitadas
$status = git status --porcelain
if ($status) {
    Write-Host "ERRO: Ha mudancas nao commitadas!" -ForegroundColor Red
    Write-Host "   > Faca o commit primeiro no VS Code" -ForegroundColor Yellow
    Write-Host "   > Depois rode este script novamente" -ForegroundColor Yellow
    exit 1
}

Write-Host "Tudo commitado. Prosseguindo com deploy..." -ForegroundColor Green

Write-Host "Enviando para Google Apps Script..." -ForegroundColor Blue
clasp push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no clasp push" -ForegroundColor Red
    exit 1
}

Write-Host "Sincronizando com GitHub..." -ForegroundColor Blue
git push github main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no push GitHub" -ForegroundColor Red
    exit 1
}

Write-Host "Deploy completo!" -ForegroundColor Green
Write-Host "   - Google Apps Script atualizado" -ForegroundColor Gray
Write-Host "   - GitHub sincronizado" -ForegroundColor Gray