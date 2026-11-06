@echo off
chcp 65001 >nul
title ProjectExpress

cd ejs2
echo =============================================
echo   ЗАПУСК ПРОЕКТА...
echo =============================================

start "terminal ejs2" cmd /c "npm run dev"

echo  подождите 10сек.
timeout /t 10 /nobreak >nul

echo  сейчас должен открытся браузер
echo  Открытие http://localhost:3000/...
timeout /t 1 /nobreak >nul
start http://localhost:3000/

echo =============================================
echo  Сервер запущен
echo =============================================
echo  Не закрывайте консоли самостоятельно
echo =============================================
echo  Для ОСТАНОВКИ сервера нажмите Enter в этом окне. 
echo  если ничего не произошло еще раз нажмите Enter
echo =============================================
pause >nul

echo.
echo Остановка серверов...
taskkill /F /IM node.exe /T >nul 2>&1
echo Серверы успешно остановлены! Окно закроется через 3 секунды
timeout /t 3 >nul
exit