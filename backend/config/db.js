const mongoose = require("mongoose");

// Fail fast on queries when disconnected instead of buffering for 10s (clearer errors for API + logs).
mongoose.set("bufferCommands", false);

let connectionReady = false;
let connecting = false;

const getMongoUri = () => process.env.MONGO_URI || process.env.DATABASE_URL || "";

const connectDB = async () => {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error("MongoDB connection string is missing. Set MONGO_URI or DATABASE_URL.");
  }
  if (connectionReady || connecting) return;

  connecting = true;
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    connectionReady = true;
    console.log("MongoDB connected");
  } finally {
    connecting = false;
  }
};

const startMongoWithRetry = ({ onConnected } = {}) => {
  const retryDelayMs = Number(process.env.MONGO_RETRY_MS || 15000);

  const attempt = async () => {
    try {
      await connectDB();
      if (typeof onConnected === "function") {
        await onConnected();
      }
    } catch (error) {
      connectionReady = false;
      console.error(
        `MongoDB connection failed. Retrying in ${retryDelayMs / 1000}s.\n` +
          "Atlas: Network Access - add your current IP (or 0.0.0.0/0 for dev only).\n" +
          "Render/serverless: allow that host outbound IPs or use Atlas private endpoint.\n" +
          `Reason: ${error.message}`
      );
      setTimeout(attempt, retryDelayMs);
    }
  };

  void attempt();
};

const isDbConnected = () => mongoose.connection.readyState === 1 && connectionReady;

module.exports = {
  connectDB,
  startMongoWithRetry,
  isDbConnected,
};
