param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Write-Host "Iniciando deploy..." -ForegroundColor Green

Write-Host "Adicionando arquivos ao git..." -ForegroundColor Yellow
git add .

Write-Host "Criando commit..." -ForegroundColor Yellow
git commit -m $Message

Write-Host "Fazendo push para Google Apps Script..." -ForegroundColor Yellow
clasp push

Write-Host "Fazendo push para GitHub..." -ForegroundColor Yellow
git push github main

Write-Host "Deploy concluído!" -ForegroundColor Green