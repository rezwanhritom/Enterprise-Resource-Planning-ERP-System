import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Many Windows / home-router DNS setups refuse SRV queries.
// mongodb+srv:// depends on SRV, so force public resolvers first.
const PUBLIC_DNS = ['8.8.8.8', '1.1.1.1', '8.8.4.4'];
try {
  dns.setServers(PUBLIC_DNS);
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (error) {
  console.warn('Unable to override DNS servers:', error.message);
}

const envUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim();
const MONGO_URI =
  envUri && envUri !== 'your_mongodb_connection'
    ? envUri
    : 'mongodb://localhost:27017/erp';

const connectOptions = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  family: 4,
  dbName: process.env.MONGO_DB || 'erp',
};

const isSrvUri = (uri) => uri.startsWith('mongodb+srv://');

/**
 * Convert mongodb+srv:// to a standard mongodb:// URI using resolved hosts.
 * Used when the driver still cannot complete querySrv on some networks.
 */
const buildStandardUriFromSrv = async (srvUri) => {
  const parsed = new URL(srvUri.replace('mongodb+srv://', 'https://'));
  const hostname = parsed.hostname;
  const username = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);
  const dbPath = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '';

  const srvRecords = await dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`);
  if (!srvRecords.length) {
    throw new Error(`No SRV records found for ${hostname}`);
  }

  let replicaSet = parsed.searchParams.get('replicaSet');
  let authSource = parsed.searchParams.get('authSource') || 'admin';

  try {
    const txtRecords = await dns.promises.resolveTxt(hostname);
    const txt = txtRecords.flat().join('');
    const replicaMatch = txt.match(/replicaSet=([^&]+)/);
    const authMatch = txt.match(/authSource=([^&]+)/);
    if (!replicaSet && replicaMatch) replicaSet = replicaMatch[1];
    if (authMatch) authSource = authMatch[1];
  } catch {
    // TXT lookup is optional; SRV hosts are enough to attempt a connection.
  }

  const hosts = srvRecords.map((record) => `${record.name}:${record.port}`).join(',');
  const params = new URLSearchParams({
    tls: 'true',
    retryWrites: 'true',
    w: 'majority',
    authSource,
  });

  if (replicaSet) {
    params.set('replicaSet', replicaSet);
  }

  const appName = parsed.searchParams.get('appName');
  if (appName) {
    params.set('appName', appName);
  }

  return `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hosts}${dbPath}?${params.toString()}`;
};

const connectWithUri = async (uri) => {
  const conn = await mongoose.connect(uri, connectOptions);
  return conn;
};

/**
 * Connect to MongoDB via Mongoose.
 */
const connectDB = async () => {
  try {
    const conn = await connectWithUri(MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (primaryError) {
    const shouldFallback =
      isSrvUri(MONGO_URI) &&
      /querySrv|ENOTFOUND|ECONNREFUSED|ETIMEOUT/i.test(primaryError.message || '');

    if (!shouldFallback) {
      console.error('MongoDB connection failed:', primaryError.message);
      throw primaryError;
    }

    console.warn(
      'mongodb+srv lookup failed. Retrying with resolved standard connection string...'
    );

    try {
      const standardUri = await buildStandardUriFromSrv(MONGO_URI);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      const conn = await connectWithUri(standardUri);
      console.log(`MongoDB connected (fallback): ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      console.error('MongoDB connection failed:', primaryError.message);
      console.error('MongoDB fallback also failed:', fallbackError.message);
      throw fallbackError;
    }
  }
};

export default connectDB;
