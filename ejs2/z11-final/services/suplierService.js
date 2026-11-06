const db = require('../db/dbconnect');

module.exports = {
  // Получить всех поставщиков
  getAll: () => {
    return db.prepare('SELECT * FROM Supliers').all();
  },

  // Получить одного поставщика по ID
  getById: (id) => {
    return db.prepare('SELECT * FROM Supliers WHERE Id = ?').get(id);
  },

  // Создать поставщика
  create: (name, address) => {
    return db.prepare('INSERT INTO Supliers (Name, Address) VALUES (?, ?)').run(name, address);
  },

  // Обновить поставщика
  update: (id, name, address) => {
    return db.prepare('UPDATE Supliers SET Name = ?, Address = ? WHERE Id = ?').run(name, address, id);
  },

  // Удалить поставщика (связи удалятся каскадно)
  delete: (id) => {
    return db.prepare('DELETE FROM Supliers WHERE Id = ?').run(id);
  },

  // Получить ВСЕ товары + флаг, есть ли они у конкретного поставщика
  getProductsWithLinks: (suplierId) => {
    return db.prepare(`
      SELECT p.Id, p.Name, p.Price, p.Description,
             CASE WHEN sp.Id IS NOT NULL THEN 1 ELSE 0 END as IsLinked
      FROM Products p
      LEFT JOIN SupliersProducts sp ON p.Id = sp.ProductId AND sp.SuplierId = ?
      ORDER BY p.Name ASC
    `).all(suplierId);
  },

    // Переключить связь (если есть - удалить, если нет - создать)
    toggleProductLink: (suplierId, productId) => {
    const existing = db.prepare('SELECT Id FROM SupliersProducts WHERE SuplierId = ? AND ProductId = ?').get(suplierId, productId);
    if (existing) {
      db.prepare('DELETE FROM SupliersProducts WHERE Id = ?').run(existing.Id);
      return { linked: false };
    } else {
      db.prepare('INSERT INTO SupliersProducts (SuplierId, ProductId) VALUES (?, ?)').run(suplierId, productId);
      return { linked: true };
    }
  }
};