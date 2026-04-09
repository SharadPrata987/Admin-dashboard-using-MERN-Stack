const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with detailed logging
console.log('\n Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(' MongoDB Connected Successfully!');
    console.log(' Database: nexus-admin');
    console.log(' Connection String: mongodb://localhost:27017/nexus-admin\n');
  })
  .catch(err => {
    console.error(' MongoDB Connection Error:', err.message);
    console.log('\n Make sure MongoDB is running:');
    console.log('   - Run: mongod');
    console.log('   - Or start MongoDB service\n');
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/events', require('./routes/events'));
app.use('/api/preferences', require('./routes/preferences'));

// Root route - Welcome page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Nexus Admin API</title>
      <style>
        body { font-family: Arial; padding: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #4f46e5; }
        .status { padding: 10px; background: #10b981; color: white; border-radius: 5px; display: inline-block; }
        .endpoint { background: #f8f8f8; padding: 10px; margin: 5px 0; border-left: 3px solid #4f46e5; }
        code { background: #e5e7eb; padding: 2px 6px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Nexus Admin API Server</h1>
        <p class="status">✅ Server is running!</p>
        
        <h2>📊 MongoDB Connection</h2>
        <p><strong>Status:</strong> ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}</p>
        <p><strong>Database:</strong> nexus-admin</p>
        
        <h2>🔌 API Endpoints</h2>
        <div class="endpoint"><strong>POST</strong> /api/auth/register - Register user</div>
        <div class="endpoint"><strong>POST</strong> /api/auth/login - Login user</div>
        <div class="endpoint"><strong>GET</strong> /api/auth/me - Get current user</div>
        <div class="endpoint"><strong>GET</strong> /api/orders - Get orders</div>
        <div class="endpoint"><strong>POST</strong> /api/orders/bulk - Bulk create orders</div>
        <div class="endpoint"><strong>GET</strong> /api/customers - Get customers</div>
        <div class="endpoint"><strong>GET</strong> /api/tasks - Get tasks</div>
        
        <h2>💡 Frontend Access</h2>
        <p>Open <code>index.html</code> in your browser to access the dashboard</p>
        
        <h2>🎯 Quick Links</h2>
        <p>Backend API: <a href="http://localhost:5000">http://localhost:5000</a></p>
        <p>Frontend: Open index.html file</p>
      </div>
    </body>
    </html>
  `);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Nexus Admin Dashboard - Backend Server');
  console.log('='.repeat(50));
  console.log(`\n📡 Backend API: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: Open index.html in browser`);
  console.log(`\n💡 Visit http://localhost:${PORT} for API documentation\n`);
});
