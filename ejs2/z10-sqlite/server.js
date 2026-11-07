const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.DB_PORT || 3002;

// бд
const dbPath = path.join(__dirname, 'database.db');
const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

// возможные для раздачи форматы
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

// раздача из public
function serveStatic(req, res, urlPath) {
  const filePath = path.join(__dirname, 'public', urlPath);
  const ext = path.extname(filePath);

  if (!MIME[ext]) return false;   // если не пусть обрабатывает роутер

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] });
    res.end(data);
    return true;
  } catch (e) {
    return false;
  }
}

// сервак
const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];   // отбрасываем query

  // тип /users.js, /style.css и тд
  if (urlPath !== '/' && serveStatic(req, res, urlPath)) return;

  // HTML users
  if (urlPath === '/users' && req.method === 'GET') {
    try {
      const html = fs.readFileSync(path.join(__dirname, 'public', 'users.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('users.html не найден');
    }
    return;
  }

  // API GET /api/users
  if (urlPath === '/api/users' && req.method === 'GET') {
    const rows = db.prepare('SELECT * FROM users').all();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(rows));
    return;
  }

  // API POST /api/users
  if (urlPath === '/api/users' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { name } = JSON.parse(body);
        if (!name || name.trim() === '') {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'name обязателен' }));
          return;
        }
        const insert = db.prepare('INSERT INTO users (name) VALUES (?)');
        const result = insert.run(name.trim());
        res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ id: result.lastInsertRowid, name: name.trim() }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Некорректный JSON' }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`DB-сервер запущен: http://localhost:${PORT}/users`);
  console.log(`API: http://localhost:${PORT}/api/users`);
  console.log(`База данных: ${dbPath}`);
});