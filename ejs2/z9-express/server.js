const http = require('node:http');
const process = require('node:process');
const logger = require('./utils/logger');
const { handleRequest } = require('./utils/router');

// Порт из переменной окружения или 3001 (чтобы не конфликтовать с основным Express на 3000)
const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  // Логируем каждый запрос
  logger.emit('log', `${req.method} ${req.url}`);

  // Передаём управление роутеру
  handleRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  logger.emit('log', `Server started on port ${PORT}`);
});

// Корректное завершение
process.on('exit', (code) => {
  console.log(`Процесс завершается с кодом ${code}`);
});