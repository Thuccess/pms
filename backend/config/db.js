const mongoose = require("mongoose");

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
        `MongoDB connection failed. Retrying in ${retryDelayMs / 1000}s. ` +
          "If using MongoDB Atlas, ensure network access allows Render outbound IPs.",
        error.message
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
