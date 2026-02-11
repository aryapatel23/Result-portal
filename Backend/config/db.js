const mongoose = require("mongoose");

const connectDB = async () => {
  const maxRetries = 5;
  let retryCount = 0;

  const attemptConnection = async () => {
    try {
      // Remove deprecated options
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
        socketTimeoutMS: 45000,
      });
      console.log("✅ MongoDB connected successfully");
      console.log(`📊 Database: ${mongoose.connection.name}`);
    } catch (err) {
      retryCount++;
      console.error(`❌ MongoDB connection attempt ${retryCount} failed:`, err.message);

      if (retryCount < maxRetries) {
        console.log(`⏳ Retrying in ${retryCount * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
        return attemptConnection();
      } else {
        console.error("❌ MongoDB connection failed after maximum retries");
        console.error("💡 Possible solutions:");
        console.error("   1. Check your internet connection");
        console.error("   2. Verify MongoDB Atlas cluster is running");
        console.error("   3. Check if your IP is whitelisted in MongoDB Atlas");
        console.error("   4. Verify MONGO_URI in .env file");
        process.exit(1);
      }
    }
  };

  await attemptConnection();
};

module.exports = connectDB;
