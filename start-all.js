const { spawn, exec } = require('child_process');
const path = require('path');

console.log('\n🚀 NEXUS ADMIN DASHBOARD - STARTING...\n');

// Check MongoDB
exec('tasklist', (error, stdout) => {
  if (!stdout.includes('mongod.exe')) {
    console.log('⚠️  MongoDB not running. Starting MongoDB...');
    spawn('mongod', [], { detached: true, stdio: 'ignore' }).unref();
    setTimeout(startBackend, 3000);
  } else {
    console.log(' MongoDB is running');
    startBackend();
  }
});

function startBackend() {
  console.log(' Starting Backend Server...\n');

  const backend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'backend'),
    shell: true,
    stdio: 'inherit'
  });

  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log(' ALL SERVICES STARTED!');
    console.log('='.repeat(60));
    console.log('\n📡 Backend API:  http://localhost:5000');
    console.log('🌐 Frontend:     Open index.html in browser');
    console.log('💾 MongoDB:      mongodb://localhost:27017/nexus-admin\n');
    console.log('👉 Open this link: file:///' + __dirname.replace(/\\/g, '/') + '/index.html\n');

    // Auto-open browser
    exec(`start chrome "${path.join(__dirname, 'index.html')}"`);
  }, 2000);

  backend.on('error', (err) => {
    console.error('❌ Backend error:', err.message);
  });
}
