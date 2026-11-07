const http = require('node:http');
const process = require('node:process');
const logger = require('./utils/logger');
const { handleRequest } = require('./utils/router');

// Порт
const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  // логирование каждого запроса
  logger.emit('log', `${req.method} ${req.url}`);

  // передача управление роутеру
  handleRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  logger.emit('log', `Server started on port ${PORT}`);
});

// завершение
process.on('exit', (code) => {
  console.log(`Процесс завершается с кодом ${code}`);
});