const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
require('dotenv').config();

// Путь к файлу БД
const dbPath = path.resolve(__dirname, 'warehouse.db');

// открывашка БД. Если файла нет — он создастся.
const db = new DatabaseSync(dbPath);

// Включаем поддержку внешних ключей
db.exec('PRAGMA foreign_keys = ON;');

module.exports = db;