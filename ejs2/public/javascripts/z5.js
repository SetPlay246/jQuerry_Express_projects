document.addEventListener('DOMContentLoaded', function () {

  const initialUser = {
    firstName: 'Иван',
    lastName: 'Петров',
    age: 30,
    email: 'ivan@example.com',
    address: {
      city: 'Москва',
      street: 'Тверская',
      house: 10
    },
    isActive: true
  };

  // Глубокая копия
  function cloneDeep(obj) {
    if (typeof structuredClone === 'function') {
      return structuredClone(obj);
    }
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(cloneDeep);
    const copy = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = cloneDeep(obj[key]);
      }
    }
    return copy;
  }

  let user = cloneDeep(initialUser);

  // 1 вывод пользователя
  const btn1 = document.getElementById('myBtn1');
  if (btn1) {
    btn1.addEventListener('click', function () {
      cLog('──────────────');
      cLog('1. Информация о пользователе:');

      for (const key in user) {
        if (!Object.prototype.hasOwnProperty.call(user, key)) continue;
        const value = user[key];

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          cLog(`  ${key}:`);
          for (const subKey in value) {
            if (Object.prototype.hasOwnProperty.call(value, subKey)) {
              cLog(`    ${subKey}: ${value[subKey]}`);
            }
          }
        } else {
          cLog(`  ${key}: ${value}`);
        }
      }
    });
  }

  // 2 Изменить возраст
  const btn2 = document.getElementById('myBtn2');
  if (btn2) {
    btn2.addEventListener('click', function () {
      cLog('──────────────');
      cLog('2. Изменение возраста:');

      const input = prompt('Введите новый возраст:', user.age);
      if (input === null) {
        cLog('Отменено пользователем');
        return;
      }

      const newAge = Number(input);
      if (isNaN(newAge) || newAge <= 0) {
        cLog('Ошибка: введите корректное число');
        return;
      }

      user.age = newAge;
      cLog(`Возраст изменён на ${user.age}`);
    });
  }

  // 3. Добавить телефон
  const btn3 = document.getElementById('myBtn3');
  if (btn3) {
    btn3.addEventListener('click', function () {
      cLog('──────────────');
      cLog('3. Добавление телефона:');

      if ('phone' in user) {
        cLog(`Свойство phone уже существует: ${user.phone}. Перезапись запрещена.`);
        return;
      }

      const phone = prompt('Введите номер телефона:');
      if (phone === null) {
        cLog('Отменено пользователем');
        return;
      }
      if (phone.trim() === '') {
        cLog('Ошибка: номер не может быть пустым');
        return;
      }

      user.phone = String(phone).trim();
      cLog(`Телефон добавлен: ${user.phone}`);
    });
  }

  // 4 удаление email
  const btn4 = document.getElementById('myBtn4');
  if (btn4) {
    btn4.addEventListener('click', function () {
      cLog('──────────────');
      cLog('4. Удаление email:');

      if (!('email' in user)) {
        cLog('Свойство email уже отсутствует');
        return;
      }

      delete user.email;
      cLog('Свойство email удалено');
    });
  }

  // 5 проверка address
  const btn5 = document.getElementById('myBtn5');
  if (btn5) {
    btn5.addEventListener('click', function () {
      cLog('──────────────');
      cLog('5. Проверка наличия address:');

      if (Object.prototype.hasOwnProperty.call(user, 'address')) {
        cLog('Адрес присутствует');
      } else {
        cLog('Адрес отсутствует');
      }
    });
  }

  // 6 age isActive
  const btn6 = document.getElementById('myBtn6');
  if (btn6) {
    btn6.addEventListener('click', function () {
      cLog('──────────────');
      cLog('6. Типы данных:');
      cLog(`Тип age: ${typeof user.age}`);
      cLog(`Тип isActive: ${typeof user.isActive}`);
    });
  }

  // 7 Поверхностная копия
  const btn7 = document.getElementById('myBtn7');
  if (btn7) {
    btn7.addEventListener('click', function () {
      cLog('──────────────');
      cLog('7. Поверхностная копия:');

      const shallow = { ...user };
      shallow.age = 99;

      cLog(`Возраст в копии: ${shallow.age}`);
      cLog(`Возраст в оригинале: ${user.age}`);
      cLog(`Совпадение адресса: ${shallow.address === user.address}`);
    });
  }

  //8Глубокая копия
  const btn8 = document.getElementById('myBtn8');
  if (btn8) {
    btn8.addEventListener('click', function () {
      cLog('──────────────');
      cLog('8. Глубокая копия:');

      const deep = cloneDeep(user);
      deep.address.city = 'Санкт-Петербург';

      cLog(`Город в оригинале: ${user.address.city}`);
      cLog(`Город в копии: ${deep.address.city}`);
      cLog(`Совпадение адресса: ${deep.address === user.address}`);
    });
  }

  // 9 список свойств
  const btn9 = document.getElementById('myBtn9');
  if (btn9) {
    btn9.addEventListener('click', function () {
      cLog('──────────────');
      cLog('9. Список свойств:');

      const keys = Object.keys(user);
      cLog(`Массив ключей: [${keys.map(k => `"${k}"`).join(', ')}]`);
      cLog(`Всего свойств: ${keys.length}`);
    });
  }

  // 10 сброс
  const btn10 = document.getElementById('myBtn10');
  if (btn10) {
    btn10.addEventListener('click', function () {
      cLog('──────────────');
      cLog('10. Сброс объекта:');

      user = cloneDeep(initialUser);
      cLog('Объект сброшен к исходному состоянию');
    });
  }

});