const db = require('../db/dbconnect');

module.exports = {
  // Получить сотрудников (с фильтром по филиалу)
  getAll: (filialId) => {
    let query = `
      SELECT e.Id, p.Fname, p.Lname, p.Phone, p.Email, 
             f.Name as FilialName, e.FilialId, 
             r.Type as RoleName, e.RoleId, e.PeopleId
      FROM Employees e
      JOIN Peoples p ON e.PeopleId = p.Id
      JOIN Filials f ON e.FilialId = f.Id
      JOIN Roles r ON e.RoleId = r.Id
    `;
    
    if (filialId) {
      query += ' WHERE e.FilialId = ?';
      return db.prepare(query).all(filialId);
    }
    return db.prepare(query).all();
  },

  // Получить все роли (для выпадающего списка)
  getRoles: () => {
    return db.prepare('SELECT * FROM Roles').all();
  },

  // Создать сотрудника (Сначала People, потом Employee)
  create: (fname, lname, phone, email, filialId, roleId) => {
    db.exec('BEGIN TRANSACTION');
    try {
      // 1. Создаем человека
      const insertPeople = db.prepare('INSERT INTO Peoples (Fname, Lname, Phone, Email) VALUES (?, ?, ?, ?)');
      const peopleInfo = insertPeople.run(fname, lname, phone, email);
      
      // 2. Привязываем к филиалу и роли
      const insertEmp = db.prepare('INSERT INTO Employees (FilialId, PeopleId, RoleId) VALUES (?, ?, ?)');
      insertEmp.run(filialId, peopleInfo.lastInsertRowid, roleId);
      
      db.exec('COMMIT');
      return { success: true };
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  },

  // Обновить сотрудника
  update: (id, fname, lname, phone, email, filialId, roleId, peopleId) => {
    db.exec('BEGIN TRANSACTION');
    try {
      // 1. Обновляем данные человека
      db.prepare('UPDATE Peoples SET Fname = ?, Lname = ?, Phone = ?, Email = ? WHERE Id = ?')
        .run(fname, lname, phone, email, peopleId);
      
      // 2. Обновляем данные трудоустройства
      db.prepare('UPDATE Employees SET FilialId = ?, RoleId = ? WHERE Id = ?')
        .run(filialId, roleId, id);
      
      db.exec('COMMIT');
      return { success: true };
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  },

  // Удалить сотрудника (Удаляем связь и человека)
  delete: (id, peopleId) => {
    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare('DELETE FROM Employees WHERE Id = ?').run(id);
      // Удаляем человека (если на него больше нигде не ссылаются)
      db.prepare('DELETE FROM Peoples WHERE Id = ?').run(peopleId);
      db.exec('COMMIT');
      return { success: true };
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }
};