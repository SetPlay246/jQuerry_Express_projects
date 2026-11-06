document.addEventListener('DOMContentLoaded', () => {
  const employeesContainer = document.getElementById('employeesContainer');
  const filialFilter = document.getElementById('filialFilter');

  // ===== МОДАЛКИ =====
  window.openModal = (id) => document.getElementById(id).classList.add('active');
  window.closeModal = (id) => document.getElementById(id).classList.remove('active');

  // ===== ЗАГРУЗКА СПРАВОЧНИКОВ =====
  async function loadDictionaries() {
    // Загружаем филиалы
    const resF = await fetch('/api/filials');
    const filials = await resF.json();
    
    filialFilter.innerHTML = '<option value="">Все филиалы</option>';
    document.getElementById('formFilial').innerHTML = '';
    
    filials.forEach(f => {
      filialFilter.innerHTML += `<option value="${f.Id}">${f.Name}</option>`;
      document.getElementById('formFilial').innerHTML += `<option value="${f.Id}">${f.Name}</option>`;
    });

    // Загружаем роли
    const resR = await fetch('/api/roles');
    const roles = await resR.json();
    
    document.getElementById('formRole').innerHTML = '';
    roles.forEach(r => {
      document.getElementById('formRole').innerHTML += `<option value="${r.Id}">${r.Type}</option>`;
    });
  }

  // ===== ЗАГРУЗКА СОТРУДНИКОВ =====
  async function loadEmployees() {
    employeesContainer.innerHTML = '<tr><td colspan="4">Загрузка...</td></tr>';
    const filialId = filialFilter.value;
    const url = filialId ? `/api/employees?filialId=${filialId}` : '/api/employees';
    
    try {
      const res = await fetch(url);
      const employees = await res.json();
      
      employeesContainer.innerHTML = '';
      if (employees.length === 0) {
        employeesContainer.innerHTML = '<tr><td colspan="4">Сотрудников нет.</td></tr>';
        return;
      }

      employees.forEach(emp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${emp.Fname} ${emp.Lname}</b></td>
          <td>${emp.RoleName}</td>
          <td>${emp.FilialName}</td>
          <td>${emp.Phone || '—'}</td>
        `;

        tr.addEventListener('click', () => {
          const action = prompt(`Сотрудник: ${emp.Fname} ${emp.Lname}\nВведите "1" чтобы УДАЛИТЬ, или "2" чтобы ИЗМЕНИТЬ:`);
          
          if (action === '1') {
            if (confirm('Удалить сотрудника?')) {
              // Передаем peopleId в query-параметре для удаления из таблицы Peoples
              fetch(`/api/employees/${emp.Id}?peopleId=${emp.PeopleId}`, { method: 'DELETE' }).then(() => loadEmployees());
            }
          } else if (action === '2') {
            document.getElementById('modalEmployeeTitle').textContent = 'Изменить сотрудника';
            document.getElementById('empId').value = emp.Id;
            document.getElementById('peopleId').value = emp.PeopleId;
            document.getElementById('formFname').value = emp.Fname;
            document.getElementById('formLname').value = emp.Lname;
            document.getElementById('formPhone').value = emp.Phone || '';
            document.getElementById('formEmail').value = emp.Email || '';
            document.getElementById('formFilial').value = emp.FilialId;
            document.getElementById('formRole').value = emp.RoleId;
            openModal('modalEmployee');
          }
        });
        employeesContainer.appendChild(tr);
      });
    } catch (err) {
      employeesContainer.innerHTML = `<tr><td colspan="4" style="color:red;">Ошибка: ${err.message}</td></tr>`;
    }
  }

  // ===== СОБЫТИЯ =====
  filialFilter.addEventListener('change', loadEmployees);

  document.getElementById('btnNewEmployee').addEventListener('click', () => {
    document.getElementById('modalEmployeeTitle').textContent = 'Новый сотрудник';
    document.getElementById('empId').value = ''; 
    document.getElementById('peopleId').value = '';
    document.getElementById('formEmployee').reset();
    openModal('modalEmployee');
  });

  document.getElementById('formEmployee').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('empId').value;
    const data = {
      Fname: document.getElementById('formFname').value,
      Lname: document.getElementById('formLname').value,
      Phone: document.getElementById('formPhone').value,
      Email: document.getElementById('formEmail').value,
      FilialId: document.getElementById('formFilial').value,
      RoleId: document.getElementById('formRole').value,
      PeopleId: document.getElementById('peopleId').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/employees/${id}` : '/api/employees';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    closeModal('modalEmployee');
    loadEmployees();
  });

  // СТАРТ
  loadDictionaries().then(loadEmployees);
});