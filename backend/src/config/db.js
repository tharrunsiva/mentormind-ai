const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mentormind';
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    const hostInfo = primaryUri.includes('@') ? primaryUri.split('@')[1] : primaryUri;
    console.warn(`[DB Warning] Connection to ${hostInfo} failed: ${error.message}`);

    // If cloud Atlas URI was blocked by local Wi-Fi / ISP firewall, attempt local fallback
    if (primaryUri !== 'mongodb://127.0.0.1:27017/mentormind') {
      console.log('[DB] Attempting local MongoDB daemon fallback (mongodb://127.0.0.1:27017)...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/mentormind', {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`[DB] Successfully connected to local MongoDB: ${localConn.connection.host}/${localConn.connection.name}`);
        return localConn;
      } catch (localErr) {
        console.warn(`[DB Warning] Local MongoDB fallback error: ${localErr.message}`);
      }
    }

    mongoose.connection.on('error', (err) => {
      console.error('[DB Error]', err.message);
    });
    return null;
  }
};

module.exports = connectDB;
