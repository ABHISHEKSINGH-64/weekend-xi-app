const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Drop unique index on roomNumber if it exists to allow multiple players per room
    try {
      await conn.connection.db.collection('users').dropIndex('roomNumber_1');
      console.log('[DB] Dropped old unique index roomNumber_1 successfully.');
    } catch (indexError) {
      // Ignored if index doesn't exist or collection is not created yet
      console.log('[DB] Unique index roomNumber_1 drop skipped (might not exist):', indexError.message);
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
