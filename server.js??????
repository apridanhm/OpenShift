const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Get hostname dari environment
const hostname = process.env.HOSTNAME || 'localhost';

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title> POC OpenShift CI/CD</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          color: white;
        }
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 { font-size: 3em; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        p { font-size: 1.2em; margin: 20px 0; }
        .badge {
          display: inline-block;
          background: #00d4ff;
          color: #000;
          padding: 10px 20px;
          border-radius: 25px;
          margin: 10px;
          font-weight: bold;
        }
        .info {
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 10px;
          margin-top: 20px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1> POC SUCCESS!</h1>
        <p>Node.js App Running on OpenShift</p>
        <div class="badge">OpenShift Virtualization</div>
        <div class="badge">Node.js ${process.version}</div>
        <div class="info">
          <strong>Hostname:</strong> ${hostname}<br>
          <strong>Port:</strong> ${port}<br>
          <strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}<br>
          <strong>Deployed:</strong> ${new Date().toLocaleString()}
        </div>
        <p style="margin-top: 30px; font-size: 0.9em; opacity: 0.8;">
          Auto-deployed via Git CI/CD Pipeline 
        </p>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    hostname: hostname
  });
});

app.listen(port, () => {
  console.log(` Node.js app listening on port ${port}`);
  console.log(` Hostname: ${hostname}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'production'}`);
});
