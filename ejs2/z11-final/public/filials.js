document.addEventListener('DOMContentLoaded', () => {
  const filialsContainer = document.getElementById('filialsContainer');

  // ===== ФУНКЦИИ МОДАЛОК =====
  window.openModal = (id) => document.getElementById(id).classList.add('active');
  window.closeModal = (id) => document.getElementById(id).classList.remove('active');

  // ===== ЗАГРУЗКА СПИСКА ФИЛИАЛОВ =====
  async function loadFilials() {
    if (!filialsContainer) return;
    
    filialsContainer.innerHTML = '<tr><td colspan="3">Загрузка...</td></tr>';
    
    try {
      const res = await fetch('/api/filials');
      const filials = await res.json();
      
      filialsContainer.innerHTML = '';
      
      if (filials.length === 0) {
        filialsContainer.innerHTML = '<tr><td colspan="3">Филиалов нет.</td></tr>';
        return;
      }

      filials.forEach(f => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
          <td><b>${f.Name}</b></td>
          <td>${f.Address}</td>
          <td style="color: #4CAF50; font-weight: bold;">${f.EmployeeCount} чел.</td>
        `;

        // Клик по строке (Удалить / Изменить)
        tr.addEventListener('click', () => {
          const action = prompt(`Филиал: ${f.Name}\nВведите "1" чтобы УДАЛИТЬ, или "2" чтобы ИЗМЕНИТЬ:`);
          
          if (action === '1') {
            if (confirm(`Удалить филиал "${f.Name}"? Все связанные данные (сотрудники, остатки) также удалятся.`)) {
              fetch(`/api/filials/${f.Id}`, { method: 'DELETE' }).then(() => {
                loadFilials();
              });
            }
          } else if (action === '2') {
            document.getElementById('modalFilialTitle').textContent = 'Изменить филиал';
            document.getElementById('filialId').value = f.Id;
            document.getElementById('formName').value = f.Name;
            document.getElementById('formAddress').value = f.Address;
            openModal('modalFilial');
          }
        });

        filialsContainer.appendChild(tr);
      });
    } catch (err) {
      filialsContainer.innerHTML = `<tr><td colspan="3" style="color:red;">Ошибка: ${err.message}</td></tr>`;
    }
  }

  // ===== СОБЫТИЯ =====

  // Кнопка "Создать новый филиал"
  document.getElementById('btnNewFilial').addEventListener('click', () => {
    document.getElementById('modalFilialTitle').textContent = 'Новый филиал';
    document.getElementById('filialId').value = ''; 
    document.getElementById('formFilial').reset();
    openModal('modalFilial');
  });

  // ОТПРАВКА ФОРМЫ (Создание или Изменение)
  document.getElementById('formFilial').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('filialId').value;
    const data = {
      Name: document.getElementById('formName').value,
      Address: document.getElementById('formAddress').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/filials/${id}` : '/api/filials';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    closeModal('modalFilial');
    loadFilials();
  });

  // Старт
  loadFilials();
});