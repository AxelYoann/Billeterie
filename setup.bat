@echo off
cls
echo.
echo ========================================
echo    MULTI-BILLETERIE - SETUP RAPIDE
echo ========================================
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installé ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js detecte : 
node --version

REM Vérifier si npm est installé
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] npm n'est pas installé
    pause
    exit /b 1
)

echo [INFO] npm detecte : 
npm --version
echo.

REM Installer les dépendances
echo [ETAPE 1/3] Installation des dependances...
call npm install
if %errorlevel% neq 0 (
    echo [ERREUR] L'installation des dependances a echoue
    pause
    exit /b 1
)

echo.
echo [ETAPE 2/3] Configuration du projet...
call npm run setup
if %errorlevel% neq 0 (
    echo [ERREUR] La configuration du projet a echoue
    pause
    exit /b 1
)

echo.
echo [ETAPE 3/3] Test de l'installation...
echo [INFO] Demarrage du serveur de test...
echo.

REM Créer un fichier batch temporaire pour démarrer le serveur
echo @echo off > start_server.bat
echo echo [INFO] Demarrage du serveur sur http://localhost:3000 >> start_server.bat
echo echo [INFO] Appuyez sur Ctrl+C pour arreter le serveur >> start_server.bat
echo call npm run dev >> start_server.bat

echo ========================================
echo    INSTALLATION TERMINEE !
echo ========================================
echo.
echo Le projet Multi-Billeterie est pret !
echo.
echo PROCHAINES ETAPES :
echo  1. Demarrer le serveur : npm run dev
echo  2. Ouvrir le navigateur : http://localhost:3000
echo  3. Consulter README.md pour plus d'infos
echo.
echo FICHIERS IMPORTANTS :
echo  - README.md         : Documentation complete
echo  - DEPLOYMENT.md     : Guide de deploiement  
echo  - CONTRIBUTING.md   : Guide de contribution
echo  - .env              : Configuration environnement
echo.

set /p choice="Voulez-vous demarrer le serveur maintenant ? (o/N): "
if /i "%choice%"=="o" (
    echo.
    echo [INFO] Demarrage du serveur...
    echo [INFO] Ouvrez http://localhost:3000 dans votre navigateur
    echo [INFO] Appuyez sur Ctrl+C pour arreter le serveur
    echo.
    call npm run dev
) else (
    echo.
    echo [INFO] Pour demarrer le serveur plus tard, executez : npm run dev
)

echo.
echo Merci d'utiliser Multi-Billeterie ! 🚀
pause