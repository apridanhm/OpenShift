// app.js  Node.js VERSION (Express + mysql2)
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'poc_db'
};

app.get('/', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Auto-log visitor
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '0.0.0.0';
    const ua = req.headers['user-agent'] || 'Unknown';
    const result = await connection.execute(
      'INSERT INTO visitors (ip_address, user_agent, request_uri, request_method) VALUES (?, ?, ?, ?)',
      [ip, ua.substring(0,255), req.url, req.method]
    );
    const lastInsertId = result[0].insertId;
    
    // Fetch visitors
    const [rows] = await connection.execute('SELECT * FROM visitors ORDER BY created_at DESC LIMIT 50');
    const [[{total}]] = await connection.execute('SELECT COUNT(*) as total FROM visitors');
    
    // Render HTML dengan UI keren
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Node.js Visitor Tracker</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .header p { opacity: 0.8; font-size: 1rem; }
    .badge {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge::before {
      content: '';
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .card h3 {
      color: #718096;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .card .value {
      font-size: 2rem;
      font-weight: bold;
      color: #2d3748;
      word-break: break-all;
    }
    .card .value.green { color: #48bb78; }
    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead {
      background: #f7fafc;
      border-bottom: 2px solid #e2e8f0;
    }
    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.875rem;
      text-transform: uppercase;
    }
    td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      color: #2d3748;
      font-size: 0.875rem;
    }
    tr:hover { background: #f7fafc; }
    .method {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.75rem;
    }
    .method.get { background: #c6f6d5; color: #22543d; }
    .timestamp { color: #718096; font-family: monospace; }
    @media (max-width: 768px) {
      body { padding: 1rem; }
      .header { flex-direction: column; text-align: center; gap: 1rem; }
      .cards { grid-template-columns: 1fr; }
      table { font-size: 0.75rem; }
      th, td { padding: 0.5rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1> Node.js Visitor Tracker</h1>
        <p>Express + MySQL + OpenShift</p>
      </div>
      <div class="badge">AUTO-LOGGING ACTIVE</div>
    </div>
    
    <div class="cards">
      <div class="card">
        <h3>Total Visitors</h3>
        <div class="value green">${total.toLocaleString()}</div>
      </div>
      <div class="card">
        <h3>Current Pod</h3>
        <div class="value" style="font-size:1rem">${require('os').hostname()}</div>
      </div>
      <div class="card">
        <h3>Database</h3>
        <div class="value" style="font-size:1rem">pxc-cluster-haproxy.uad.svc.cluster.local</div>
      </div>
      <div class="card">
        <h3>Last Insert ID</h3>
        <div class="value">${lastInsertId || '-'}</div>
      </div>
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>IP Address</th>
            <th>Method</th>
            <th>Path</th>
            <th>User Agent</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(v => `
          <tr>
            <td>${v.id}</td>
            <td>${v.ip_address}</td>
            <td><span class="method get">${v.request_method}</span></td>
            <td>${v.request_uri}</td>
            <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${v.user_agent}</td>
            <td class="timestamp">${new Date(v.created_at).toLocaleString('id-ID')}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
    `);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('<h1>Error</h1><p>' + err.message + '</p>');
  } finally {
    if (connection) await connection.end();
  }
});

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';


app.listen(PORT, HOST, () => {
  console.log(` Node.js server running on http://${HOST}:${PORT}`);
});
