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
    await connection.execute(
      'INSERT INTO visitors (ip_address, user_agent, request_uri, request_method) VALUES (?, ?, ?, ?)',
      [ip, ua.substring(0,255), req.url, req.method]
    );
    
    // Fetch visitors
    const [rows] = await connection.execute('SELECT * FROM visitors ORDER BY created_at DESC LIMIT 50');
    const [[{total}]] = await connection.execute('SELECT COUNT(*) as total FROM visitors');
    
    // Render HTML (simple version, same structure)
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`
      <!DOCTYPE html><html><head><title>Node.js Benchmark</title></head><body>
      <h1> Node.js Visitor Tracker</h1>
      <p>Total: ${total}</p>
      <p>Pod: ${require('os').hostname()}</p>
      <!-- Tambahin tabel visitor sama seperti lainnya biar fair -->
      </body></html>
    `);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).send('DB Error: ' + err.message);
  } finally {
    if (connection) await connection.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Node server listening on port ${PORT}`));
