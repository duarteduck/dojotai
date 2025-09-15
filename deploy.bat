@echo off
if "%~1"=="" (
    echo Erro: Informe a mensagem do commit
    echo Usage: deploy.bat "mensagem do commit"
    exit /b 1
)

echo 🚀 Iniciando deploy do Dojotai...

echo 📝 Fazendo commit...
git add .
git commit -m "%~1"

echo 📤 Enviando para Google Apps Script...
clasp push

echo 💾 Fazendo backup no GitHub...
git push github main

echo ✅ Deploy completo!
echo    - Google Apps Script atualizado
echo    - GitHub sincronizado