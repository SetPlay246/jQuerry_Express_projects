function sumFromstr(str) {
    if (str === null || str === undefined) return 0;
    if (str.trim() === '') return 0;

    const parts = str.split(',');

    const numbers = parts.map(function (part) {
      const trimmed = part.trim();

      if (trimmed === '') {
        throw new Error(`Некорректное значение: ${part}`);
      }

      const num = Number(trimmed);

      if (Number.isNaN(num)) {
        throw new Error(`Некорректное значение: ${trimmed}`);
      }

      return num;
    });

    return numbers.reduce(function (acc, n) {
      return acc + n;
    }, 0);
  }

  // ===== Функция getUniqueElements =====
  function getUniqueElements(arr) {
    if (!Array.isArray(arr)) {
      throw new Error('Аргумент должен быть массивом');
    }

    const result = [];
    for (let i = 0; i < arr.length; i++) {
      // indexOf использует строгое === (и не находит NaN, как и ===)
      if (result.indexOf(arr[i]) === -1) {
        result.push(arr[i]);
      }
    }
    return result;
  }
  
  

document.addEventListener('DOMContentLoaded', function () {
  const btn1 = document.getElementById('myBtn1');
  if (btn1) {
    btn1.addEventListener('click', function () {
      cLog('──────────────');
      cLog('Сумма чисел из строки:');

      const input = prompt('Введите числа в формате: 1,2,3');
      if (input === null) {
        cLog('Отменено пользователем');
        return;
      }

      try {
        const result = sumFromstr(input);
        cLog(`Вход: "${input}" Сумма: ${result}`);
      } catch {
        cLog(`Произошла ошибка`);
      }
    });
  }

  const btn2 = document.getElementById('myBtn2');
  if (btn2) {
    btn2.addEventListener('click', function () {
      cLog('──────────────');
      cLog('Уникальные элементы массива:');

      const input = prompt('Введите массив в формате: [1,2,2,3]');
      if (input === null) {
        cLog('Пустой ввод или отмена');
        return;
      }

      let arr;
      try {
        arr = JSON.parse(input);
        if (!Array.isArray(arr)) {
          throw new Error('Введённое значение не является массивом');
        }
      } catch {
        cLog(`Ошибка ввода: ${input} не является массивом`);
        return;
      }

      try {
        const unique = getUniqueElements(arr);
        cLog(`Вход:  ${JSON.stringify(arr)}`);
        cLog(`Выход: ${JSON.stringify(unique)}`);
      } catch {
        cLog(`Случилась оплошность`);
      }
    });
  }
});






