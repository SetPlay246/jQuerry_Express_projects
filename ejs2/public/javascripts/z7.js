document.addEventListener('DOMContentLoaded', function () {

  //1 заголовок
  const mainTitle = document.getElementById('main-title');
  const btnChangeTitle = document.getElementById('btn-change-title');

  if (mainTitle && btnChangeTitle) {
    btnChangeTitle.addEventListener('click', function () {
      mainTitle.textContent = 'коуеокеоуавукеп4це32р2-ш-4шщцрлх-0ур3ош945';
    });
  }

  //
  //2 получение
  const textParagraph = document.getElementById('text-paragraph');
  const btnChangeText = document.getElementById('btn-change-text');
  const btnToggleClass = document.getElementById('btn-toggle-class');

  // 2.1 замена
  if (textParagraph && btnChangeText) {
    btnChangeText.addEventListener('click', function () {
      textParagraph.textContent = 'Атакуйте точку D!';
    });
  }

  // 2ю2 фон
  if (textParagraph && btnToggleClass) {
    btnToggleClass.addEventListener('click', function () {
      textParagraph.classList.toggle('highlight');
    });
  }

  //3 ввод
  const nameInput = document.getElementById('name-input');
  const btnGreet = document.getElementById('btn-greet');
  const greetingOutput = document.getElementById('greeting-output');

  if (nameInput && btnGreet && greetingOutput) {
    btnGreet.addEventListener('click', function () {
      const name = nameInput.value.trim();

      greetingOutput.classList.remove('error', 'success');

      if (name === '') {
        greetingOutput.textContent = 'Введите имя';
        greetingOutput.classList.add('error');
      } else {
        greetingOutput.textContent = `Привет, ${name}!`;
        greetingOutput.classList.add('success');
      }
    });
  }

  // 4 список
  const taskInput = document.getElementById('task-input');
  const btnAddTask = document.getElementById('btn-add-task');
  const taskList = document.getElementById('task-list');

  if (taskInput && btnAddTask && taskList) {
    btnAddTask.addEventListener('click', function () {
      const text = taskInput.value.trim();

      if (text === '') return;

      const li = document.createElement('li');
      li.textContent = text;

      // удоление по кликц
      li.addEventListener('click', function () {
        li.remove();
      });

      taskList.appendChild(li);
      taskInput.value = '';
    });
  }

  // 5 счетчик
  const counterValue = document.getElementById('counter-value');
  const btnIncrement = document.getElementById('btn-increment');
  const btnDecrement = document.getElementById('btn-decrement');
  const btnReset = document.getElementById('btn-reset');

  let count = 0;

  function updateCounter() {
    if (counterValue) {
      counterValue.textContent = count;
    }
  }
  if (btnIncrement) {
    btnIncrement.addEventListener('click', function () {
      count++;
      updateCounter();
    });
  }
  if (btnDecrement) {
    btnDecrement.addEventListener('click', function () {
      count--;
      updateCounter();
    });
  }
  if (btnReset) {
    btnReset.addEventListener('click', function () {
      count = 0;
      updateCounter();
    });
  }

});