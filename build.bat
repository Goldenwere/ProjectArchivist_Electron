@echo off
rmdir build /S /Q
xcopy /E /I "src" "build"
del "build\script" /F /Q
npm start
PAUSE