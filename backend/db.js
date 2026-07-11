const mongoose = require("mongoose");
const { config } = require("./config");

/**
 * Connect to MongoDB. Called once during server bootstrap (never on import),
 * so importing the app for tests does not require a live database.
 */
async function connectDB() {
  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    console.log("[db] MongoDB connected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  });

  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.connection.close(false);
}

module.exports = { connectDB, disconnectDB };
