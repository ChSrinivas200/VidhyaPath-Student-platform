require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); // Path to your User model
const connectDB = require('./utils/db');

const fixIndexes = async () => {
  try {
    // 1. Connect to Database
    await connectDB();
    console.log("✅ Database Connected...");

    // 2. Drop 'username_1' index (The main cause of the error)
    try {
      await User.collection.dropIndex('username_1');
      console.log("🔥 SUCCESS: Deleted 'username_1' unique index.");
    } catch (err) {
      console.log("ℹ️ 'username_1' index not found (this is good).");
    }

    // 3. Drop 'name_1' index (Just in case)
    try {
      await User.collection.dropIndex('name_1');
      console.log("🔥 SUCCESS: Deleted 'name_1' unique index.");
    } catch (err) {
      console.log("ℹ️ 'name_1' index not found (this is good).");
    }

    console.log("✨ DB Fix Complete. You can now restart your server!");
    process.exit();

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

fixIndexes();