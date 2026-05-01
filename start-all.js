/**
 * start-all.js
 * Script per avviare contemporaneamente Frontend e Backend
 */
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Avvio di BrainPlayng (Frontend + Backend)...');

// 1. Avvia il Backend
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true,
  stdio: 'inherit'
});

// 2. Avvia il Frontend
const frontend = spawn('node', ['frontend-server.js'], {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit'
});

// Gestione chiusura
process.on('SIGINT', () => {
  console.log('\n🛑 Spegnimento in corso...');
  backend.kill();
  frontend.kill();
  process.exit();
});

backend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`❌ Il Backend si è fermato con codice ${code}`);
  }
});

frontend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`❌ Il Frontend si è fermato con codice ${code}`);
  }
});
