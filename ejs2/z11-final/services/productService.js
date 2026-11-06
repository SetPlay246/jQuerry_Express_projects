const db = require('../db/dbconnect');

module.exports = {
    


  // Получить все товары (с общим количеством)
  getAll: () => {
    return db.prepare(`
      SELECT p.Id, p.Name, p.Description, p.Price, COALESCE(SUM(fs.Quantity), 0) as Quantity
      FROM Products p
      LEFT JOIN FilialsStorage fs ON p.Id = fs.ProductId
      GROUP BY p.Id
    `).all();
  },

  // Получить товары на конкретном складе
  getByFilial: (filialId) => {
    return db.prepare(`
      SELECT p.Id, p.Name, p.Description, p.Price, fs.Quantity, fs.FilialId
      FROM Products p
      JOIN FilialsStorage fs ON p.Id = fs.ProductId
      WHERE fs.FilialId = ? AND fs.Quantity > 0
    `).all(filialId);
  },

  // Создать новый товар
  create: (name, description, price) => {
    return db.prepare('INSERT INTO Products (Name, Description, Price) VALUES (?, ?, ?)')
             .run(name, description, price);
  },

  // Обновить товар
  update: (id, name, description, price) => {
    return db.prepare('UPDATE Products SET Name = ?, Description = ?, Price = ? WHERE Id = ?')
             .run(name, description, price, id);
  },

  // Удалить товар
  delete: (id) => {
    return db.prepare('DELETE FROM Products WHERE Id = ?').run(id);
  },

  // Добавить товар на склад (с логикой проверки)
  addToStorage: (filialId, productId, quantity) => {
    const existing = db.prepare('SELECT * FROM FilialsStorage WHERE FilialId = ? AND ProductId = ?')
                       .get(filialId, productId);

    if (existing) {
      // Если уже есть — прибавляем
      return db.prepare('UPDATE FilialsStorage SET Quantity = Quantity + ? WHERE Id = ?')
               .run(quantity, existing.Id);
    } else {
      // Если нет — создаем
      return db.prepare('INSERT INTO FilialsStorage (FilialId, ProductId, Quantity) VALUES (?, ?, ?)')
               .run(filialId, productId, quantity);
    }
  },
    clearFromStorage: (productId) => {
    return db.prepare('UPDATE FilialsStorage SET Quantity = 0 WHERE ProductId = ?').run(productId);
  },

  // Обновить точное количество на конкретном складе
  setStorageQuantity: (filialId, productId, quantity) => {
    const existing = db.prepare('SELECT * FROM FilialsStorage WHERE FilialId = ? AND ProductId = ?').get(filialId, productId);
    if (existing) {
      return db.prepare('UPDATE FilialsStorage SET Quantity = ? WHERE Id = ?').run(quantity, existing.Id);
    } else {
      return db.prepare('INSERT INTO FilialsStorage (FilialId, ProductId, Quantity) VALUES (?, ?, ?)').run(filialId, productId, quantity);
    }
  }
};