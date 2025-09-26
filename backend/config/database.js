const mongoose = require("mongoose");

async function tryConnect(uri) {
  // Enable detailed query logging only when explicitly enabled
  if (process.env.MONGOOSE_DEBUG === 'true') {
    mongoose.set('debug', true);
  }
  const conn = await mongoose.connect(uri);
  const { name, host } = conn.connection;
  console.log(`MongoDB connected -> db: ${name}, host: ${host}`);
}

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackEnabled = process.env.MONGO_FALLBACK_LOCAL === 'true';
  const fallbackUri = 'mongodb://127.0.0.1:27017/chatdb';

  const retryDelayMs = 5000;

  const attempt = async () => {
    try {
      if (!primaryUri && !fallbackEnabled) {
        throw new Error("MONGODB_URI is not set (set it or enable MONGO_FALLBACK_LOCAL=true)");
      }

      if (primaryUri) {
        try {
          await tryConnect(primaryUri);
          return; // success
        } catch (e) {
          console.error("Primary MongoDB connection failed:", e.message);
          if (!fallbackEnabled) throw e;
          console.warn("Falling back to local MongoDB:", fallbackUri);
        }
      }

      if (fallbackEnabled) {
        await tryConnect(fallbackUri);
        return; // success
      }
    } catch (error) {
      console.error("Error connecting to MongoDB:", error.message);
      console.warn(`Retrying in ${retryDelayMs / 1000}s...`);
      setTimeout(attempt, retryDelayMs);
    }
  };

  attempt();
};

module.exports = connectDB;
