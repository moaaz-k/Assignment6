const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/assignment7";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

module.exports = connectDB;
