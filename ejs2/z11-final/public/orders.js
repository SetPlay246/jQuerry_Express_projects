document.addEventListener('DOMContentLoaded', () => {
  const ordersContainer = document.getElementById('ordersContainer');
  const filterFilial = document.getElementById('filterFilial');
  const filterSuplier = document.getElementById('filterSuplier');
  
  // Модалка
  const formOrder = document.getElementById('formOrder');
  const formFilial = document.getElementById('formFilial');
  const formSuplier = document.getElementById('formSuplier');
  const orderItemsContainer = document.getElementById('orderItemsContainer');
  const lblTotalPrice = document.getElementById('lblTotalPrice');
  
  let currentProducts = []; // товары выбранного поставщика
  let isViewMode = false;   // флаг: просмотр или создание

  window.openModal = (id) => document.getElementById(id).classList.add('active');
  window.closeModal = (id) => document.getElementById(id).classList.remove('active');

  // ===== ЗАГРУЗКА СПРАВОЧНИКОВ =====
  async function loadDictionaries() {
    const resF = await fetch('/api/filials');
    const filials = await resF.json();
    
    filterFilial.innerHTML = '<option value="">Все склады</option>';
    formFilial.innerHTML = '';
    filials.forEach(f => {
      filterFilial.innerHTML += `<option value="${f.Id}">${f.Name}</option>`;
      formFilial.innerHTML += `<option value="${f.Id}">${f.Name}</option>`;
    });

    const resS = await fetch('/api/supliers');
    const supliers = await resS.json();
    
    filterSuplier.innerHTML = '<option value="">Все поставщики</option>';
    formSuplier.innerHTML = '';
    supliers.forEach(s => {
      filterSuplier.innerHTML += `<option value="${s.Id}">${s.Name}</option>`;
      formSuplier.innerHTML += `<option value="${s.Id}">${s.Name}</option>`;
    });
  }

  // ===== ЗАГРУЗКА ЗАКАЗОВ =====
  async function loadOrders() {
    ordersContainer.innerHTML = '<tr><td colspan="6">Загрузка...</td></tr>';
    
    const fId = filterFilial.value;
    const sId = filterSuplier.value;
    const url = `/api/orders?filialId=${fId}&suplierId=${sId}`;
    
    try {
      const res = await fetch(url);
      const orders = await res.json();
      
      ordersContainer.innerHTML = '';
      if (orders.length === 0) {
        ordersContainer.innerHTML = '<tr><td colspan="6">Заказов нет.</td></tr>';
        return;
      }

      orders.forEach(o => {
        const tr = document.createElement('tr');
        const status = o.IsConfirm 
          ? `<span style="color:#4CAF50;">Выполнен (${o.ConfirmDate})</span>` 
          : `<span style="color:#e67e22;">В ожидании</span>`;
        
        tr.innerHTML = `
          <td><b>#${o.Id}</b></td>
          <td>${o.OrderDate}</td>
          <td>${o.FilialName}</td>
          <td>${o.SuplierName}</td>
          <td>${o.TotalPrice || 0} ₽</td>
          <td>${status}</td>
        `;

        tr.addEventListener('click', async () => {
          // Меню действий
          let msg = `Заказ #${o.Id}\n1 - Просмотреть\n2 - Удалить\n`;
          if (!o.IsConfirm) msg += `3 - ПОДТВЕРДИТЬ (товары поступят на склад)\n`;
          
          const action = prompt(msg);
          
          if (action === '1') {
            viewOrder(o);
          } else if (action === '2') {
            if (confirm('Удалить заказ?')) {
              fetch(`/api/orders/${o.Id}`, { method: 'DELETE' }).then(() => loadOrders());
            }
          } else if (action === '3' && !o.IsConfirm) {
            if (confirm('Подтвердить заказ? Товары будут добавлены на склад.')) {
              fetch(`/api/orders/${o.Id}/confirm`, { method: 'PUT' }).then(() => loadOrders());
            }
          }
        });

        ordersContainer.appendChild(tr);
      });
    } catch (err) {
      ordersContainer.innerHTML = `<tr><td colspan="6" style="color:red;">Ошибка: ${err.message}</td></tr>`;
    }
  }

  // ===== ДИНАМИЧЕСКИЙ СПИСОК ТОВАРОВ =====
  async function loadSuplierProducts(suplierId) {
    if (!suplierId) {
      orderItemsContainer.innerHTML = '<tr><td colspan="4">Выберите поставщика</td></tr>';
      return;
    }
    orderItemsContainer.innerHTML = '<tr><td colspan="4">Загрузка...</td></tr>';
    
    const res = await fetch(`/api/supliers/${suplierId}/linked-products`);
    currentProducts = await res.json();
    
    orderItemsContainer.innerHTML = '';
    if (currentProducts.length === 0) {
      orderItemsContainer.innerHTML = '<tr><td colspan="4">У поставщика нет товаров</td></tr>';
      return;
    }

    currentProducts.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.Name}</td>
        <td>${p.Price} ₽</td>
        <td>
          <input type="number" class="input qty-input" data-id="${p.SupProductId}" data-price="${p.Price}" 
                 min="0" value="0" style="width: 70px; margin: 0; padding: 5px;" ${isViewMode ? 'disabled' : ''}>
        </td>
        <td class="subtotal">0 ₽</td>
      `;
      orderItemsContainer.appendChild(tr);
    });

    // бработчики на изменения количества если не просмотр
    if (!isViewMode) {
      document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('input', recalculateTotal);
      });
    }
    recalculateTotal();
  }

  // Подсчет итогов
  function recalculateTotal() {
    let total = 0;
    document.querySelectorAll('.qty-input').forEach(input => {
      const qty = parseInt(input.value) || 0;
      const price = parseFloat(input.dataset.price) || 0;
      const subtotal = qty * price;
      
      // Обновляем сумму
      input.closest('tr').querySelector('.subtotal').textContent = `${subtotal} ₽`;
      total += subtotal;
    });
    lblTotalPrice.textContent = `${total} ₽`;
  }

  // ===== ПРОСМОТР ЗАКАЗА =====
  async function viewOrder(order) {
    isViewMode = true;
    document.getElementById('modalOrderTitle').textContent = `Заказ #${order.Id}`;
    
    const statusText = order.IsConfirm ? "Завершен" : "В ожидании";
    
    // инфа сверху
    document.getElementById('orderReadOnlyInfo').style.display = 'block';
    document.getElementById('lblOrderDetails').innerHTML = `
      <b>От:</b> ${order.OrderDate} | 
      <b>Статус:</b> <span style="color: ${order.IsConfirm ? '#4CAF50' : '#e67e22'}">${statusText}</span> |
      <b>Склад:</b> ${order.FilialName} |
      <b>Поставщик:</b> ${order.SuplierName}
    `;
    
    // Скрываем выпадающие списки, просмотр
    formFilial.parentElement.style.display = 'none';
    formSuplier.parentElement.style.display = 'none';
    document.getElementById('btnSubmitOrder').style.display = 'none';

    // Получаем состав заказа
    const res = await fetch(`/api/orders/${order.Id}/details`);
    const items = await res.json();

    orderItemsContainer.innerHTML = '';
    items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.Name}</td>
        <td>${item.Price} ₽</td>
        <td>${item.Quantity} шт.</td>
        <td>${item.SubTotal} ₽</td>
      `;
      orderItemsContainer.appendChild(tr);
    });
    
    lblTotalPrice.textContent = `${order.TotalPrice} ₽`;
    openModal('modalOrder');
  }

  // ===== СОБЫТИЯ =====
  filterFilial.addEventListener('change', loadOrders);
  filterSuplier.addEventListener('change', loadOrders);
  formSuplier.addEventListener('change', (e) => loadSuplierProducts(e.target.value));

    document.getElementById('btnNewOrder').addEventListener('click', () => {
    isViewMode = false;
    document.getElementById('modalOrderTitle').textContent = 'Создать заказ';
    document.getElementById('orderReadOnlyInfo').style.display = 'none';
    
    formFilial.parentElement.style.display = 'block'; // <--- ВОЗВРАЩАЕМ СЕЛЕКТЫ
    formSuplier.parentElement.style.display = 'block'; // <--- ВОЗВРАЩАЕМ СЕЛЕКТЫ
    
    formFilial.disabled = false;
    formSuplier.disabled = false;
    document.getElementById('btnSubmitOrder').style.display = 'block';
    
    formOrder.reset();
    formSuplier.dispatchEvent(new Event('change')); 
    lblTotalPrice.textContent = '0 ₽';
    openModal('modalOrder');
  });

  formOrder.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Собираем только те товары, где количество > 0
    const items = [];
    document.querySelectorAll('.qty-input').forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        items.push({
          SupProductId: input.dataset.id,
          Quantity: qty
        });
      }
    });

    if (items.length === 0) {
      alert('Добавьте хотя бы один товар в заказ');
      return;
    }

    const data = {
      FilialId: formFilial.value,
      SuplierId: formSuplier.value,
      Items: items
    };

    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    closeModal('modalOrder');
    loadOrders();
  });

  // СТАРТ
  loadDictionaries().then(loadOrders);
});