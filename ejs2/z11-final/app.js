const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const productService = require('./services/productService');
const filialService = require('./services/filialService');
const employeeService = require('./services/employeeService');
const orderService = require('./services/orderService');
const suplierService = require('./services/suplierService');

const PORT = process.env.PORT || 3003;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png'
};

function serveStatic(req, res, urlPath) {
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(__dirname, 'public', urlPath);
  const ext = path.extname(filePath);
  if (!MIME[ext]) return false;
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] });
    res.end(data);
    return true;
  } catch (e) { return false; }
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];

  if (serveStatic(req, res, urlPath)) return;

  try {

    // ================= ПОСТАВЩИКИ =================
    
    // 1. Получить список всех поставщиков
    if (urlPath === '/api/supliers' && req.method === 'GET') {
      const supliers = suplierService.getAll();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(supliers));
    }

    // 2. Создать поставщика
    if (urlPath === '/api/supliers' && req.method === 'POST') {
      const data = await getBody(req);
      if (!data.Name || !data.Address) {
        res.writeHead(400); return res.end(JSON.stringify({ error: 'Нужно имя и адрес' }));
      }
      const info = suplierService.create(data.Name, data.Address);
      res.writeHead(201); return res.end(JSON.stringify({ id: info.lastInsertRowid }));
    }

    // 3. Получить товары с флагами (для страницы поставщиков)
    if (urlPath.startsWith('/api/supliers/') && urlPath.endsWith('/products') && req.method === 'GET') {
      const suplierId = urlPath.split('/')[3];
      const products = suplierService.getProductsWithLinks(suplierId);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(products));
    }

    // 4. Переключить связь (для галочек)
    if (urlPath === '/api/supliers/toggle-product' && req.method === 'POST') {
      const data = await getBody(req);
      const result = suplierService.toggleProductLink(data.SuplierId, data.ProductId);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(result));
    }

    // 5. Изменить поставщика
    if (urlPath.startsWith('/api/supliers/') && req.method === 'PUT') {
      const id = urlPath.split('/')[3];
      const data = await getBody(req);
      suplierService.update(id, data.Name, data.Address);
      res.writeHead(200); return res.end(JSON.stringify({ success: true }));
    }

    // 6. Удалить поставщика
    if (urlPath.startsWith('/api/supliers/') && req.method === 'DELETE') {
      const id = urlPath.split('/')[3];
      suplierService.delete(id);
      res.writeHead(200); return res.end(JSON.stringify({ success: true }));
    }

    // 7. Получить только привязанные товары (для страницы заказов)
    if (urlPath.startsWith('/api/supliers/') && urlPath.endsWith('/linked-products') && req.method === 'GET') {
      const suplierId = urlPath.split('/')[3];
      const products = orderService.getLinkedProducts(suplierId); 
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(products));
    }


    // ================= ЗАКАЗЫ =================
    if (urlPath === '/api/orders' && req.method === 'GET') {
      const filialId = new URL(req.url, 'http://localhost').searchParams.get('filialId');
      const suplierId = new URL(req.url, 'http://localhost').searchParams.get('suplierId');
      const orders = orderService.getAll(filialId, suplierId);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(orders));
    }

    if (urlPath.startsWith('/api/orders/') && urlPath.endsWith('/details') && req.method === 'GET') {
      const orderId = urlPath.split('/')[3];
      const details = orderService.getOrderDetails(orderId);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(details));
    }

    if (urlPath === '/api/orders' && req.method === 'POST') {
      const data = await getBody(req);
      orderService.create(data.FilialId, data.SuplierId, data.Items);
      res.writeHead(201); return res.end(JSON.stringify({ success: true }));
    }

    if (urlPath.startsWith('/api/orders/') && urlPath.endsWith('/confirm') && req.method === 'PUT') {
      const orderId = urlPath.split('/')[3];
      orderService.confirm(orderId);
      res.writeHead(200); return res.end(JSON.stringify({ success: true }));
    }

    if (urlPath.startsWith('/api/orders/') && req.method === 'DELETE') {
      const orderId = urlPath.split('/')[3];
      orderService.delete(orderId);
      res.writeHead(200); return res.end(JSON.stringify({ success: true }));
    }


    // ================= СОТРУДНИКИ =================
    if (urlPath === '/api/employees' && req.method === 'GET') {
      const filialId = new URL(req.url, 'http://localhost').searchParams.get('filialId');
      const employees = employeeService.getAll(filialId);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(employees));
    }

    if (urlPath === '/api/roles' && req.method === 'GET') {
      const roles = employeeService.getRoles();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(roles));
    }

    if (urlPath === '/api/employees' && req.method === 'POST') {
      const data = await getBody(req);
      if (!data.Fname || !data.Lname || !data.FilialId || !data.RoleId) {
        res.writeHead(400); return res.end(JSON.stringify({ error: 'Не хватает данных' }));
      }
      employeeService.create(data.Fname, data.Lname, data.Phone || '', data.Email || '', data.FilialId, data.RoleId);
      res.writeHead(201); return res.end(JSON.stringify({ success: true }));
    }

    if (urlPath.startsWith('/api/employees/') && req.method === 'PUT') {
      const id = urlPath.split('/')[3];
      const data = await getBody(req);
      employeeService.update(id, data.Fname, data.Lname, data.Phone || '', data.Email || '', data.FilialId, data.RoleId, data.PeopleId);
      res.writeHead(200); return res.end(JSON.stringify({ success: true }));
    }

    if (urlPath.startsWith('/api/employees/') && req.method === 'DELETE') {
      const id = urlPath.split('/')[3];
      const peopleId = new URL(req.url, 'http://localhost').searchParams.get('peopleId');
      employeeService.delete(id, peopleId);
      res.writeHead(200); return res.end(JSON.stringify({ success: true }));
    }
    

    // ================= СКЛАДЫ (ФИЛИАЛЫ) =================
    if (urlPath === '/api/filials' && req.method === 'GET') {
      const filials = filialService.getAll();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(filials));
    }

    if (urlPath === '/api/filials' && req.method === 'POST') {
      const data = await getBody(req);
      if (!data.Name || !data.Address) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' }); 
        return res.end(JSON.stringify({ error: 'Нужно название и адрес' }));
      }
      const info = filialService.create(data.Name, data.Address);
      res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ id: info.lastInsertRowid }));
    }

    if (urlPath.startsWith('/api/filials/') && req.method === 'PUT') {
      const id = urlPath.split('/')[3];
      const data = await getBody(req);
      filialService.update(id, data.Name, data.Address);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); 
      return res.end(JSON.stringify({ success: true }));
    }

    if (urlPath.startsWith('/api/filials/') && req.method === 'DELETE') {
      const id = urlPath.split('/')[3];
      filialService.delete(id);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); 
      return res.end(JSON.stringify({ success: true }));
    }


    // ================= ТОВАРЫ =================
    if (urlPath === '/api/products' && req.method === 'GET') {
      const filialId = new URL(req.url, 'http://localhost').searchParams.get('filialId');
      const products = filialId ? productService.getByFilial(filialId) : productService.getAll();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(products));
    }

    if (urlPath === '/api/products' && req.method === 'POST') {
      const data = await getBody(req);
      if (!data.Name || data.Price === undefined) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' }); 
        return res.end(JSON.stringify({ error: 'Нужно имя и цена' }));
      }
      const info = productService.create(data.Name, data.Description || '', data.Price);
      res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ id: info.lastInsertRowid }));
    }

    if (urlPath.startsWith('/api/products/') && req.method === 'PUT') {
      const id = urlPath.split('/')[3];
      const data = await getBody(req);
      productService.update(id, data.Name, data.Description, data.Price);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); 
      return res.end(JSON.stringify({ success: true }));
    }

    if (urlPath.startsWith('/api/products/') && req.method === 'DELETE') {
      const id = urlPath.split('/')[3];
      productService.delete(id);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); 
      return res.end(JSON.stringify({ success: true }));
    }

    if (urlPath === '/api/storage' && req.method === 'POST') {
      const data = await getBody(req);
      if (!data.FilialId || !data.ProductId || !data.Quantity) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' }); 
        return res.end(JSON.stringify({ error: 'Не хватает данных' }));
      }
      productService.addToStorage(data.FilialId, data.ProductId, data.Quantity);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: true }));
    }

    if (urlPath.startsWith('/api/storage/') && req.method === 'DELETE') {
      const productId = urlPath.split('/')[3];
      productService.clearFromStorage(productId);
      res.writeHead(200); return res.end(JSON.stringify({ success: true }));
    }

    if (urlPath === '/api/storage/update' && req.method === 'PUT') {
      const data = await getBody(req);
      productService.setStorageQuantity(data.FilialId, data.ProductId, data.Quantity);
      res.writeHead(200); return res.end(JSON.stringify({ success: true }));
    }

  } catch (err) {
    console.error('Ошибка сервера:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ error: err.message })); 
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Складской сервер запущен: http://localhost:${PORT}`);
});