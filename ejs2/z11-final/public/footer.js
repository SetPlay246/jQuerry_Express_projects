document.addEventListener('DOMContentLoaded', () => {
  // Создаем элемент footer
  const footer = document.createElement('footer');
  footer.className = 'site-footer'; // Класс для стилей

  // Пишем здесь любой текст или ссылки
  footer.innerHTML = `
    <p>06.11.2026 Система управления складом. Никакие права не защищены.</p>
    <p>Разработано Захаровым Артемом РПО4 не без помощи ИИ.</p>
  `;

  // Добавляем футер в самый конец тега <body>
  document.body.appendChild(footer);
});

document.addEventListener('DOMContentLoaded', () => {
  // Создаем контейнер для хедера
  const header = document.createElement('header');
  header.className = 'site-header';

  // Внутреннее наполнение шапки
  header.innerHTML = `
    <div class="header-left">
      <img src="/Icon.png" alt="Иконка склада" class="header-logo">
      <div class="header-titles">
        <h1>Система управления складом</h1>
        <h2>веб приложение для работы с базой данных</h2>
        <span class="header-note" id="headerNote">Записка</span>
      </div>
    </div>
  `;

  // Вставляем хедер в самое начало <body>
  document.body.prepend(header);

  // Добавляем обработчик клика на "Записку"
  const note = document.getElementById('headerNote');
  if (note) {
    note.addEventListener('click', () => {
      alert('Здравствуйе!\n\nНадеюсь вы не злы. \nЯ обьединил все домашние задания в Кучу,\n в том числе и финальный проект.');
    });
  }
});