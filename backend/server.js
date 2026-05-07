import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;
const DB_RETRY_MS = Number(process.env.DB_RETRY_MS || 15000);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const connectWithRetry = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error(
      `Database unavailable. Retrying in ${DB_RETRY_MS / 1000}s...`,
      err.message
    );
    setTimeout(connectWithRetry, DB_RETRY_MS);
  }
};

connectWithRetry();
