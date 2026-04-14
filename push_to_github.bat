@echo off
echo Running git push to https://github.com/letAsk/LetAskMain.git ...
git remote add origin https://github.com/letAsk/LetAskMain.git
git branch -M main
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo GitHub push failed. Trying to pull remote changes first...
    git pull origin main --allow-unrelated-histories
    git push -u origin main
)
pause
