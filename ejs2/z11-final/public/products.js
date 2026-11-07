document.addEventListener('DOMContentLoaded', () => {
  
  const filialSelect = document.getElementById('filialSelect');
  const productsContainer = document.getElementById('productsContainer');
  const formFilialSelect = document.getElementById('formFilial');
  const formProductSelect = document.getElementById('formProduct');

  window.openModal = (id) => document.getElementById(id).classList.add('active');
  window.closeModal = (id) => document.getElementById(id).classList.remove('active');

  // ===== 1. ЗАГРУЗКА СПИСКА ТОВАРОВ =====
  async function loadProducts() {
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '<tr><td colspan="4">Загрузка...</td></tr>';
    const filialId = filialSelect.value;
    const url = filialId ? `/api/products?filialId=${filialId}` : '/api/products';
    
    try {
      const res = await fetch(url);
      const products = await res.json();
      
      productsContainer.innerHTML = '';
      
      if (products.length === 0) {
        productsContainer.innerHTML = '<tr><td colspan="4">Товаров нет.</td></tr>';
        return;
      }

      products.forEach(p => {
        const tr = document.createElement('tr');
        
        const qText = filialId ? `${p.Quantity} шт.` : `${p.Quantity} шт. (всего)`;
        const price = p.Price !== undefined ? p.Price : '—';
        const desc = p.Description || 'Без описания';

        tr.innerHTML = `
          <td><b>${p.Name}</b></td>
          <td>${desc}</td>
          <td>${price} ₽</td>
          <td style="color: #4CAF50; font-weight: bold;">${qText}</td>
        `;

        // клик по елементу
        tr.addEventListener('click', async () => {
          //  промт
          const action = prompt(
            `Товар: ${p.Name}\n\n` +
            `1 — УДАЛИТЬ или ИЗМЕНИТЬ САМ ТОВАР\n` +
            `2 — УДАЛИТЬ или ИЗМЕНИТЬ ТОВАР НА СКЛАДАХ`
          );

          if (action === '1') {
            // работа с товаром
            const subAction = prompt(`Товар: ${p.Name}\n1 — Удалить товар целиком\n2 — Изменить название/цену`);
            
            if (subAction === '1') {
              if (confirm('Удалить этот товар из базы полностью?')) {
                fetch(`/api/products/${p.Id}`, { method: 'DELETE' }).then(() => {
                  loadDictionaries();
                  loadProducts();
                });
              }
            } else if (subAction === '2') {
              document.getElementById('modalProductTitle').textContent = 'Изменить товар';
              document.getElementById('productId').value = p.Id;
              document.getElementById('formName').value = p.Name;
              document.getElementById('formDesc').value = p.Description || '';
              document.getElementById('formPrice').value = p.Price;
              openModal('modalProduct');
            }

          } else if (action === '2') {
            // работа с складами
            const subAction = prompt(`Остатки: ${p.Name}\n1 — Обнулить на ВСЕХ складах\n2 — Задать точное количество на КОНКРЕТНОМ складе`);
            
            if (subAction === '1') {
              if (confirm('Обнулить количество этого товара на всех складах?')) {
                fetch(`/api/storage/${p.Id}`, { method: 'DELETE' }).then(() => loadProducts());
              }
            } else if (subAction === '2') {
              // открытие модалки изменения колва
              document.getElementById('editProductId').value = p.Id;
              document.getElementById('editFormQuantity').value = '0';
              
              // селект складов
              const resF = await fetch('/api/filials');
              const filials = await resF.json();
              const editSelect = document.getElementById('editFormFilial');
              editSelect.innerHTML = '';
              filials.forEach(f => {
                editSelect.innerHTML += `<option value="${f.Id}">${f.Name}</option>`;
              });

              // выбран склад, ставим его
              if (filialSelect.value) editSelect.value = filialSelect.value;

              openModal('modalStorageEdit');
            }
          }
        });

        productsContainer.appendChild(tr);
      });
    } catch (err) {
      productsContainer.innerHTML = `<tr><td colspan="4" style="color:red;">Ошибка: ${err.message}</td></tr>`;
    }
  }

  // ===== 2. ЗАГРУЗКА СПРАВОЧНИКОВ =====
  async function loadDictionaries() {
    try {
      const resF = await fetch('/api/filials');
      const filials = await resF.json();
      
      filialSelect.innerHTML = '<option value="">Все склады</option>';
      filials.forEach(f => {
        filialSelect.innerHTML += `<option value="${f.Id}">${f.Name}</option>`;
      });

      formFilialSelect.innerHTML = '';
      filials.forEach(f => {
        formFilialSelect.innerHTML += `<option value="${f.Id}">${f.Name}</option>`;
      });

      const resP = await fetch('/api/products');
      const products = await resP.json();
      
      formProductSelect.innerHTML = '';
      products.forEach(p => {
        formProductSelect.innerHTML += `<option value="${p.Id}">${p.Name}</option>`;
      });
    } catch (err) {
      console.error("Ошибка при загрузке справочников:", err);
    }
  }

  // ===== СОБЫТИЯ =====
  
  if (filialSelect) filialSelect.addEventListener('change', loadProducts);

  document.getElementById('btnNewProduct').addEventListener('click', () => {
    document.getElementById('modalProductTitle').textContent = 'Новый товар';
    document.getElementById('productId').value = ''; 
    document.getElementById('formProductForm').reset();
    openModal('modalProduct');
  });

  document.getElementById('btnAddStorage').addEventListener('click', () => {
    document.getElementById('formQuantity').value = '1';
    openModal('modalStorage');
  });

  // Форма товара
  document.getElementById('formProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const data = {
      Name: document.getElementById('formName').value,
      Description: document.getElementById('formDesc').value,
      Price: parseFloat(document.getElementById('formPrice').value)
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/products/${id}` : '/api/products';

    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

    closeModal('modalProduct');
    loadDictionaries();
    loadProducts();
  });

  // Форма добавления на склад
  document.getElementById('formStorage').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      FilialId: document.getElementById('formFilial').value,
      ProductId: document.getElementById('formProduct').value,
      Quantity: parseInt(document.getElementById('formQuantity').value)
    };

    await fetch('/api/storage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

    closeModal('modalStorage');
    loadProducts();
  });

  // ===== Изменение колва =====
  document.getElementById('formStorageEdit').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      ProductId: document.getElementById('editProductId').value,
      FilialId: document.getElementById('editFormFilial').value,
      Quantity: parseInt(document.getElementById('editFormQuantity').value)
    };

    await fetch('/api/storage/update', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

    closeModal('modalStorageEdit');
    loadProducts();
  });

  // СТАРТ
  loadDictionaries().then(loadProducts);
});