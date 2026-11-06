const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
require('dotenv').config();

// Путь к файлу БД (по умолчанию в папке db)
const dbPath = path.resolve(__dirname, 'warehouse.db');

// Открываем БД. Если файла нет — он создастся.
const db = new DatabaseSync(dbPath);

// Включаем поддержку внешних ключей (обязательно для SQLite)
db.exec('PRAGMA foreign_keys = ON;');

module.exports = db;