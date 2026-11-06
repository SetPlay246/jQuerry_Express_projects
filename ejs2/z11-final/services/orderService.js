const db = require('../db/dbconnect');

module.exports = {

  // Получить ТОЛЬКО привязанные товары поставщика (для заказов)
  getLinkedProducts: (suplierId) => {
    return db.prepare(`
      SELECT sp.Id as SupProductId, p.Name, p.Price
      FROM SupliersProducts sp
      JOIN Products p ON sp.ProductId = p.Id
      WHERE sp.SuplierId = ?
    `).all(suplierId);
  },

  // Получить все заказы (с фильтрацией по складу и поставщику)
      // Получить всех поставщиков
  getSupliers: () => {
    return db.prepare('SELECT * FROM Supliers').all();
  },

  getAll: (filialId, suplierId) => {
    let query = `
      SELECT o.Id, o.OrderDate, o.IsConfirm, o.ConfirmDate, 
             f.Name as FilialName, s.Name as SuplierName,
             (SELECT SUM(op.Quantity * p.Price) 
              FROM OrderProducts op 
              JOIN SupliersProducts sp ON op.SupProductId = sp.Id
              JOIN Products p ON sp.ProductId = p.Id
              WHERE op.OrderId = o.Id) as TotalPrice
      FROM "Order" o
      JOIN Filials f ON o.FilialId = f.Id
      JOIN Supliers s ON o.SuplierId = s.Id
      WHERE 1=1
    `;
    const params = [];
    if (filialId) { query += ` AND o.FilialId = ?`; params.push(filialId); }
    if (suplierId) { query += ` AND o.SuplierId = ?`; params.push(suplierId); }
    
    query += ` ORDER BY o.Id DESC`;
    return db.prepare(query).all(...params);
  },

     // Получить товары конкретного поставщика (для модалки создания)
  getSuplierProducts: (suplierId) => {
    return db.prepare(`
      SELECT sp.Id as SupProductId, p.Name, p.Price
      FROM SupliersProducts sp
      JOIN Products p ON sp.ProductId = p.Id
      WHERE sp.SuplierId = ?
    `).all(suplierId);
  },

  // Получить состав конкретного заказа (для просмотра)
  getOrderDetails: (orderId) => {
    return db.prepare(`
      SELECT op.Quantity, p.Name, p.Price, (op.Quantity * p.Price) as SubTotal
      FROM OrderProducts op
      JOIN SupliersProducts sp ON op.SupProductId = sp.Id
      JOIN Products p ON sp.ProductId = p.Id
      WHERE op.OrderId = ?
    `).all(orderId);
  },

  // Создать заказ
  create: (filialId, suplierId, items) => {
    db.exec('BEGIN TRANSACTION');
    try {
      // 1. Создаем заказ
      const insertOrder = db.prepare('INSERT INTO "Order" (FilialId, SuplierId) VALUES (?, ?)');
      const orderInfo = insertOrder.run(filialId, suplierId);
      const orderId = orderInfo.lastInsertRowid;

      // 2. Добавляем товары в заказ
      const insertItem = db.prepare('INSERT INTO OrderProducts (OrderId, SupProductId, Quantity) VALUES (?, ?, ?)');
      items.forEach(item => {
        if (item.Quantity > 0) {
          insertItem.run(orderId, item.SupProductId, item.Quantity);
        }
      });

      db.exec('COMMIT');
      return { success: true, id: orderId };
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  },

    // Подтвердить заказ (Добавить товары на склад)
  confirm: (orderId) => {
    db.exec('BEGIN TRANSACTION');
    try {
      const order = db.prepare('SELECT FilialId, IsConfirm FROM "Order" WHERE Id = ?').get(orderId);
      if (order.IsConfirm) throw new Error('Заказ уже подтвержден');

      // Получаем товары из заказа и их реальные ID из таблицы Products
      const items = db.prepare(`
        SELECT op.Quantity, sp.ProductId 
        FROM OrderProducts op
        JOIN SupliersProducts sp ON op.SupProductId = sp.Id
        WHERE op.OrderId = ? AND op.Quantity > 0
      `).all(orderId);

      const checkStorage = db.prepare('SELECT Id FROM FilialsStorage WHERE FilialId = ? AND ProductId = ?');
      const updateStorage = db.prepare('UPDATE FilialsStorage SET Quantity = Quantity + ? WHERE Id = ?');
      const insertStorage = db.prepare('INSERT INTO FilialsStorage (FilialId, ProductId, Quantity) VALUES (?, ?, ?)');

      items.forEach(item => {
        const existing = checkStorage.get(order.FilialId, item.ProductId);
        if (existing) {
          updateStorage.run(item.Quantity, existing.Id);
        } else {
          insertStorage.run(order.FilialId, item.ProductId, item.Quantity);
        }
      });

      // Помечаем заказ как выполненный
      // Используем обычный CURRENT_TIMESTAMP, он работает в SQLite без проблем
      db.prepare('UPDATE "Order" SET IsConfirm = 1, ConfirmDate = CURRENT_TIMESTAMP WHERE Id = ?').run(orderId);

      db.exec('COMMIT');
      return { success: true };
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  },

  // Удалить заказ
  delete: (orderId) => {
    return db.prepare('DELETE FROM "Order" WHERE Id = ?').run(orderId);
  }
};