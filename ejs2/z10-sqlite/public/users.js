document.addEventListener('DOMContentLoaded', function () {

  const container = document.getElementById('usersContainer');

  // ===== Загрузка списка =====
  async function loadUsers() {
    if (!container) return;
    container.innerHTML = '<p>Загрузка...</p>';

    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const users = await res.json();

      container.replaceChildren();

      if (users.length === 0) {
        const p = document.createElement('p');
        p.className = 'empty';
        p.textContent = 'Пользователей пока нет';
        container.appendChild(p);
        return;
      }

      users.forEach(function (user) {
        const card = document.createElement('div');
        card.className = 'user-card';

        const idSpan = document.createElement('span');
        idSpan.className = 'user-id';
        idSpan.textContent = `#${user.id}`;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'user-name';
        nameSpan.textContent = user.name;

        card.appendChild(idSpan);
        card.appendChild(nameSpan);
        container.appendChild(card);
      });

    } catch (e) {
      container.replaceChildren();
      const p = document.createElement('p');
      p.className = 'error';
      p.textContent = `Ошибка загрузки: ${e.message}`;
      container.appendChild(p);
    }
  }

  // ===== Добавление =====
  const addBtn = document.getElementById('addUserBtn');
  if (addBtn) {
    addBtn.addEventListener('click', async function () {
      const name = prompt('Введите имя нового пользователя:');
      if (name === null) return;
      if (name.trim() === '') {
        alert('Имя не может быть пустым');
        return;
      }

      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        await loadUsers();

      } catch (e) {
        alert(`Ошибка добавления: ${e.message}`);
      }
    });
  }

  // ===== Обновить =====
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadUsers);
  }

  // ===== Старт =====
  loadUsers();

});