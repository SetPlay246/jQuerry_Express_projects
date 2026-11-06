document.addEventListener('DOMContentLoaded', function () {

  const modal1 = document.getElementById('modal1');
  const modal2 = document.getElementById('modal2');
  const modal3 = document.getElementById('modal3');
  const modal4 = document.getElementById('modal4');

  const input1 = document.getElementById('num1');
  const input2 = document.getElementById('num2');
  const operatorSelect = document.getElementById('operator');
  const resultText = document.getElementById('resultText');

  function openModal(modal) {
    if (modal) modal.classList.add('active');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  function closeAll() {
    [modal1, modal2, modal3, modal4].forEach(closeModal);
  }

  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      if (input1) input1.value = '';
      if (input2) input2.value = '';
      if (operatorSelect) operatorSelect.value = '+';
      openModal(modal1);
    });
  }

  const next1 = document.getElementById('next1');
  if (next1) {
    next1.addEventListener('click', function () {
      if (!input1 || input1.value.trim() === '') {
        alert('Введите число');
        return;
      }
      closeModal(modal1);
      openModal(modal2);
    });
  }

  const next2 = document.getElementById('next2');
  if (next2) {
    next2.addEventListener('click', function () {
      closeModal(modal2);
      openModal(modal3);
    });
  }

  const calcBtn = document.getElementById('calcBtn');
  if (calcBtn) {
    calcBtn.addEventListener('click', function () {
      if (!input2 || input2.value.trim() === '') {
        alert('Введите число');
        return;
      }

      const a = parseFloat(input1.value);
      const b = parseFloat(input2.value);
      const op = operatorSelect.value;

      if (isNaN(a) || isNaN(b)) {
        alert('Оба значения должны быть числами');
        return;
      }

      let result;
      switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/':
          if (b === 0) {
            alert('Деление на ноль невозможно');
            return;
          }
          result = a / b;
          break;
        default:
          alert('Неизвестная операция');
          return;
      }

      if (resultText) {
        resultText.textContent = `${a} ${op} ${b} = ${result}`;
      }
      closeModal(modal3);
      openModal(modal4);
    });
  }

  const cancel1 = document.getElementById('cancel1');
  if (cancel1) {
    cancel1.addEventListener('click', function () {
      closeAll();
    });
  }

  const cancel2 = document.getElementById('cancel2');
  if (cancel2) {
    cancel2.addEventListener('click', function () {
      closeAll();
    });
  }

  const cancel3 = document.getElementById('cancel3');
  if (cancel3) {
    cancel3.addEventListener('click', function () {
      closeAll();
    });
  }

  const closeResult = document.getElementById('closeResult');
  if (closeResult) {
    closeResult.addEventListener('click', function () {
      closeAll();
    });
  }

  [modal1, modal2, modal3, modal4].forEach(function (modal) {
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });

});