@echo off
del "build" /F /Q
xcopy /E /I "src" "build"
del "build\script" /F /Q
npm start
PAUSE