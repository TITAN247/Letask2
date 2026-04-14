@echo off
cd /d "c:\Users\Shivansh\Desktop\let-Ask-main"
echo === CURRENT DIRECTORY ===
cd
echo.
echo === GIT STATUS ===
git status --short
echo.
echo === GIT REMOTE ===
git remote -v
echo.
echo === GIT LOG ===
git log --oneline -5 2>nul || echo "No commits yet"
echo.
echo ===========================
echo Setting remote to TITAN247/LETASK...
git remote remove origin 2>nul
git remote add origin https://github.com/TITAN247/LETASK.git
echo.

echo Adding all files...
git add -A
echo.

echo Committing...
git commit -m "Initial commit: LetAsk mentorship platform" 2>&1
echo.

echo Pushing to GitHub...
git push -u origin main --force 2>&1
echo.
echo === DONE ===
pause
