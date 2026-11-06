const db = require('../db/dbconnect');

module.exports = {
  // Получить все филиалы + количество сотрудников
  getAll: () => {
    return db.prepare(`
      SELECT f.Id, f.Name, f.Address, 
             COUNT(e.Id) as EmployeeCount
      FROM Filials f
      LEFT JOIN Employees e ON f.Id = e.FilialId
      GROUP BY f.Id
    `).all();
  },

  // Создать филиал
  create: (name, address) => {
    return db.prepare('INSERT INTO Filials (Name, Address) VALUES (?, ?)')
             .run(name, address);
  },

  // Обновить филиал
  update: (id, name, address) => {
    return db.prepare('UPDATE Filials SET Name = ?, Address = ? WHERE Id = ?')
             .run(name, address, id);
  },

  // Удалить филиал
  delete: (id) => {
    return db.prepare('DELETE FROM Filials WHERE Id = ?').run(id);
  }
};