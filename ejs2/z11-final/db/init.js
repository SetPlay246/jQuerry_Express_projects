const db = require('./dbconnect');

function initDatabase() {
  console.log('Начало инициализации базы данных...');

  // 1. Роли (Roles)
  db.exec(`
    CREATE TABLE IF NOT EXISTS Roles (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Type TEXT NOT NULL,
      Description TEXT
    )
  `);

  // 2. Люди (Peoples)
  db.exec(`
    CREATE TABLE IF NOT EXISTS Peoples (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Fname TEXT NOT NULL,
      Lname TEXT NOT NULL,
      Email TEXT UNIQUE,
      Phone TEXT
    )
  `);

  // 3. Филиалы (Filials)
  db.exec(`
    CREATE TABLE IF NOT EXISTS Filials (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Address TEXT NOT NULL,
      DirectorId INTEGER,
      FOREIGN KEY (DirectorId) REFERENCES Peoples(Id) ON DELETE SET NULL
    )
  `);

  // 4. Сотрудники (Employees) - зависит от Filials и Peoples и Roles
  db.exec(`
    CREATE TABLE IF NOT EXISTS Employees (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      FilialId INTEGER NOT NULL,
      PeopleId INTEGER NOT NULL,
      RoleId INTEGER NOT NULL,
      FOREIGN KEY (FilialId) REFERENCES Filials(Id) ON DELETE CASCADE,
      FOREIGN KEY (PeopleId) REFERENCES Peoples(Id) ON DELETE CASCADE,
      FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE RESTRICT
    )
  `);

  // 5. Товары (Products)
  db.exec(`
    CREATE TABLE IF NOT EXISTS Products (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Description TEXT,
      Price REAL NOT NULL CHECK(Price >= 0)
    )
  `);

  // 6. Поставщики (Supliers)
  db.exec(`
    CREATE TABLE IF NOT EXISTS Supliers (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Address TEXT NOT NULL
    )
  `);

  // 7. Товары поставщиков (SupliersProducts) - связь многие-ко-многим
  db.exec(`
    CREATE TABLE IF NOT EXISTS SupliersProducts (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      ProductId INTEGER NOT NULL,
      SuplierId INTEGER NOT NULL,
      FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
      FOREIGN KEY (SuplierId) REFERENCES Supliers(Id) ON DELETE CASCADE
    )
  `);

  // 8. Остатки на филиалах (FilialsStorage)
  db.exec(`
    CREATE TABLE IF NOT EXISTS FilialsStorage (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      FilialId INTEGER NOT NULL,
      ProductId INTEGER NOT NULL,
      Quantity INTEGER NOT NULL DEFAULT 0 CHECK(Quantity >= 0),
      FOREIGN KEY (FilialId) REFERENCES Filials(Id) ON DELETE CASCADE,
      FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
      UNIQUE(FilialId, ProductId) -- Защита от дублей (один товар на одном складе - одна запись)
    )
  `);

    // 9. Заказы (Order)
  db.exec(`
    CREATE TABLE IF NOT EXISTS "Order" (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      FilialId INTEGER NOT NULL,
      SuplierId INTEGER NOT NULL,
      OrderDate TEXT NOT NULL DEFAULT (datetime('now')),
      IsConfirm INTEGER NOT NULL DEFAULT 0, 
      ConfirmDate TEXT DEFAULT NULL,
      FOREIGN KEY (FilialId) REFERENCES Filials(Id) ON DELETE CASCADE,
      FOREIGN KEY (SuplierId) REFERENCES Supliers(Id) ON DELETE CASCADE
    )
  `);

  // 10. Состав заказа (OrderProducts) - зависит от Order и SupliersProducts
  db.exec(`
    CREATE TABLE IF NOT EXISTS OrderProducts (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      OrderId INTEGER NOT NULL,
      SupProductId INTEGER NOT NULL,
      Quantity INTEGER NOT NULL CHECK(Quantity > 0),
      FOREIGN KEY (OrderId) REFERENCES "Order"(Id) ON DELETE CASCADE,
      FOREIGN KEY (SupProductId) REFERENCES SupliersProducts(Id) ON DELETE CASCADE
    )
  `);

  console.log('Все таблицы успешно созданы.');

  // инсерты 
  
  // проверка, роли не могут быть путы, если они пусты значит и бд пуста
  const roleCount = db.prepare('SELECT COUNT(*) as count FROM Roles').get();

  if (roleCount.count === 0) {
    console.log('Заполнение базы тестовыми данными...');
    
    // транзакция для скорости и безопасности
    db.exec('BEGIN TRANSACTION;');

    try {
      // 1. Роли
      const insertRole = db.prepare('INSERT INTO Roles (Type, Description) VALUES (?, ?)');
      insertRole.run('Директор', 'Управляет филиалом');
      insertRole.run('Бухгалтер', 'Ведет финансовую отчетность, работает с бумагой');
      insertRole.run('Грузчик', 'Загружает/разгружает товары');
      insertRole.run('Складовщик', 'Принимает товары, проверяет маркировку');
      insertRole.run('Водитель', 'Достовляет товары');
      insertRole.run('Уборщик', 'Отвечает за чистоту склада');

      // 2. Люди
      const insertPeople = db.prepare('INSERT INTO Peoples (Fname, Lname, Email, Phone) VALUES (?, ?, ?, ?)');
      insertPeople.run('Иван', 'Побитов', 'superIvan@example.com', '+79001112233');
      insertPeople.run('Петр', 'Камчатский', 'PPe553@example.com', '+79004445566');
      insertPeople.run('Сидор', 'Главарь', 'S1dorov@example.com', '+79007778899');
      insertPeople.run('Дарья', 'Марганцева', 'DM123@example.com', '+79227778899');
      insertPeople.run('Андрей', 'Ельцин', 'AnEls22@example.com', '+79556478899');
      insertPeople.run('Анастасия', 'Ведченко', 'AnastasyVedchenko123@example.com', '+79001128879');

      // 3. Филиалы (Директор - Иван)
      const insertFilial = db.prepare('INSERT INTO Filials (Name, Address, DirectorId) VALUES (?, ?, ?)');
      insertFilial.run('Центральный склад', 'г. Москва, ул. Ленина, д. 1', 1);
      insertFilial.run('Южный филиал', 'г. Ростов, ул. Мира, д. 5', 2);

      // 4. Сотрудники (Петр - директор во 2-м филиале, Сидор - грузчик в 1-м)
      const insertEmp = db.prepare('INSERT INTO Employees (FilialId, PeopleId, RoleId) VALUES (?, ?, ?)');
      insertEmp.run(1, 1, 1);
      insertEmp.run(2, 2, 4);
      insertEmp.run(1, 3, 3);
      insertEmp.run(2, 4, 1);
      insertEmp.run(1, 5, 5);
      insertEmp.run(2, 6, 2);
      // 5. Товары
      const insertProduct = db.prepare('INSERT INTO Products (Name, Description, Price) VALUES (?, ?, ?)');
      insertProduct.run('Монитор Dell', '27 дюймов, 4K', 35000.50);
      insertProduct.run('Клавиатура Logitech', 'Беспроводная, полная', 4500.00);
      insertProduct.run('Телевизор LG', 'oled 40 дюймов', 4500.00);
      insertProduct.run('фен dayson', 'фен 370ват', 4500.00);

      // 6. Поставщики
      const insertSuplier = db.prepare('INSERT INTO Supliers (Name, Address) VALUES (?, ?)');
      insertSuplier.run('ООО ТехноСнаб', 'г. Москва, ул. Складская, д. 10');
      insertSuplier.run('ИП Поставкин', 'г. Тверь, ул. Торговая, д. 2');

      // 7. Товары поставщиков
      const insertSupProd = db.prepare('INSERT INTO SupliersProducts (ProductId, SuplierId) VALUES (?, ?)');
      insertSupProd.run(1, 1);
      insertSupProd.run(3, 1);
      insertSupProd.run(2, 2);

      // 8. Остатки на складах
      const insertStorage = db.prepare('INSERT INTO FilialsStorage (FilialId, ProductId, Quantity) VALUES (?, ?, ?)');
      insertStorage.run(1, 1, 50);
      insertStorage.run(1, 2, 100);
      insertStorage.run(2, 2, 20);

      // 9. Заказы
      // const insertOrder = db.prepare('INSERT INTO "Order" (FilialId, SuplierId, OrderDate) VALUES (?, ?, ?)');
      // insertOrder.run(1, 1, '2026-11-05 10:00:00');

      // 10. Состав заказа
      // const insertOrderProd = db.prepare('INSERT INTO OrderProducts (OrderId, SupProductId, Quantity) VALUES (?, ?, ?)');
      // insertOrderProd.run(1, 1, 10);

      db.exec('COMMIT;');
      console.log('✅ Тестовые данные успешно добавлены.');
    } catch (error) {
      db.exec('ROLLBACK;');
      console.error('❌ Ошибка при добавлении данных:', error.message);
    }
  } else {
    console.log('ℹ️ База данных уже содержит данные. Пропуск заполнения.');
  }
}

// Запуск
initDatabase();