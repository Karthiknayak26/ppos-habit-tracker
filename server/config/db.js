import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn(`[WARNING] The server will continue running, but database features will not work.`);
    // process.exit(1); // Removed to prevent nodemon crash loops
  }
};

export default connectDB;
