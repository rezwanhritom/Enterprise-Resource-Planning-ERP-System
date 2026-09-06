import dns from 'node:dns';
import http from 'node:http';
import 'dotenv/config';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  // Continue with system DNS if override is unavailable.
}

import app from './app.js';
import connectDB from './config/db.js';
import seedAdmin from './utils/seedAdmin.js';
import { initSocketServer } from './socket/index.js';

const PORT = process.env.PORT || 5000;
const DB_RETRY_MS = Number(process.env.DB_RETRY_MS || 15000);
let hasSeededAdmin = false;

const server = http.createServer(app);
initSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Socket.io ready for realtime messaging');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Stop the other process or change PORT in .env.`
    );
    process.exit(1);
  }
  throw error;
});

const connectWithRetry = async () => {
  try {
    await connectDB();

    if (!hasSeededAdmin) {
      await seedAdmin();
      hasSeededAdmin = true;
    }
  } catch (err) {
    console.error(
      `Database unavailable. Retrying in ${DB_RETRY_MS / 1000}s...`,
      err.message
    );
    setTimeout(connectWithRetry, DB_RETRY_MS);
  }
};

connectWithRetry();
