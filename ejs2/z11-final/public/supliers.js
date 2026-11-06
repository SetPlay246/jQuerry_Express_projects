document.addEventListener('DOMContentLoaded', () => {
  const suplierSelect = document.getElementById('suplierSelect');
  const productsContainer = document.getElementById('productsContainer');
  
  // Модалка
  const formSuplier = document.getElementById('formSuplier');
  const modalSuplierTitle = document.getElementById('modalSuplierTitle');
  const suplierIdInput = document.getElementById('suplierId');
  const formName = document.getElementById('formName');
  const formAddress = document.getElementById('formAddress');
  const btnDeleteSuplier = document.getElementById('btnDeleteSuplier');
  const btnSubmitSuplier = document.getElementById('btnSubmitSuplier');

  window.openModal = (id) => document.getElementById(id).classList.add('active');
  window.closeModal = (id) => document.getElementById(id).classList.remove('active');

  // ===== 1. ЗАГРУЗКА ПОСТАВЩИКОВ =====
  async function loadSupliers() {
    try {
      const res = await fetch('/api/supliers');
      const supliers = await res.json();
      
      suplierSelect.innerHTML = '';
      if (supliers.length === 0) {
        suplierSelect.innerHTML = '<option value="">Нет поставщиков</option>';
        productsContainer.innerHTML = '<tr><td colspan="4">Добавьте поставщика</td></tr>';
        return;
      }

      supliers.forEach(s => {
        suplierSelect.innerHTML += `<option value="${s.Id}">${s.Name}</option>`;
      });

      // Загружаем товары для первого поставщика
      loadProducts(suplierSelect.value);
    } catch (err) {
      console.error(err);
    }
  }

  // ===== 2. ЗАГРУЗКА ТОВАРОВ (С РАДИОКНОПКАМИ) =====
    // ===== 2. ЗАГРУЗКА ТОВАРОВ (С РАДИОКНОПКАМИ) =====
  async function loadProducts(suplierId) {
    if (!suplierId) return;
    
    productsContainer.innerHTML = '<tr><td colspan="4">Загрузка...</td></tr>';
    
    try {
      // БЫЛО: /linked-products (для заказов)
      // СТАЛО: /products (для страницы поставщиков, здесь есть и Id, и IsLinked)
      const res = await fetch(`/api/supliers/${suplierId}/products`); 
      const products = await res.json();
      
      // ... остальной код без изменений
      
      productsContainer.innerHTML = '';
      if (products.length === 0) {
        productsContainer.innerHTML = '<tr><td colspan="4">В базе нет товаров</td></tr>';
        return;
      }

      products.forEach(p => {
        const tr = document.createElement('tr');
        
        // Если IsLinked == 1, ставим checked
        const isChecked = p.IsLinked === 1 ? 'checked' : '';

        tr.innerHTML = `
          <td style="text-align: center;">
            <input type="checkbox" class="link-checkbox" 
                   data-productid="${p.Id}" ${isChecked} style="width: 20px; height: 20px; cursor: pointer;">
          </td>
          <td><b>${p.Name}</b></td>
          <td>${p.Price} ₽</td>
          <td>${p.Description || '—'}</td>
        `;

        // Обработка клика по чекбоксу
        const checkbox = tr.querySelector('.link-checkbox');
        
        checkbox.addEventListener('change', async (e) => {
          const res = await fetch('/api/supliers/toggle-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ SuplierId: suplierId, ProductId: p.Id })
          });
          
          if (!res.ok) {
            // Показываем реальную ошибку с сервера
            const errData = await res.json();
            alert('Ошибка: ' + (errData.error || res.statusText)); 
            e.target.checked = !e.target.checked;
          }
        });
        productsContainer.appendChild(tr);
      });
    } catch (err) {
      productsContainer.innerHTML = `<tr><td colspan="4" style="color:red;">Ошибка: ${err.message}</td></tr>`;
    }
  }

  // ===== 3. СОБЫТИЯ =====
  
  // Смена поставщика в списке
  suplierSelect.addEventListener('change', (e) => {
    loadProducts(e.target.value);
  });

  // Кнопка "Добавить поставщика"
  document.getElementById('btnNewSuplier').addEventListener('click', () => {
    modalSuplierTitle.textContent = 'Новый поставщик';
    suplierIdInput.value = '';
    formSuplier.reset();
    btnDeleteSuplier.style.display = 'none'; // Скрываем удаление
    btnSubmitSuplier.textContent = 'Добавить';
    openModal('modalSuplier');
  });

  // Кнопка "Изменить поставщика"
  document.getElementById('btnEditSuplier').addEventListener('click', async () => {
    const id = suplierSelect.value;
    if (!id) return alert('Нет выбранного поставщика');

    // Запрашиваем данные текущего поставщика
    const res = await fetch('/api/supliers');
    const supliers = await res.json();
    const current = supliers.find(s => s.Id == id);

    if (current) {
      modalSuplierTitle.textContent = 'Изменить поставщика';
      suplierIdInput.value = current.Id;
      formName.value = current.Name;
      formAddress.value = current.Address;
      
      btnDeleteSuplier.style.display = 'block'; // Показываем удаление
      btnSubmitSuplier.textContent = 'Изменить';
      openModal('modalSuplier');
    }
  });

  // ОТПРАВКА ФОРМЫ (Создание/Изменение)
  formSuplier.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = suplierIdInput.value;
    const data = { Name: formName.value, Address: formAddress.value };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/supliers/${id}` : '/api/supliers';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    closeModal('modalSuplier');
    await loadSupliers(); // Перезагружаем список
    
    // Если редактировали, оставляем выбор на нем
    if (id) suplierSelect.value = id;
    loadProducts(suplierSelect.value);
  });

  // КНОПКА УДАЛЕНИЯ В МОДАЛКЕ
  btnDeleteSuplier.addEventListener('click', async () => {
    const id = suplierIdInput.value;
    if (!id) return;

    if (confirm('Удалить поставщика? Все его связи с товарами и заказы будут удалены.')) {
      await fetch(`/api/supliers/${id}`, { method: 'DELETE' });
      closeModal('modalSuplier');
      await loadSupliers();
    }
  });

  // СТАРТ
  loadSupliers();
});