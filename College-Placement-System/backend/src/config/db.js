import mongoose from 'mongoose';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB connected (database: ${mongoose.connection.name})`);
  } catch (err) {
    // Never print the URI: it may contain credentials.
    console.error('MongoDB connection failed:', err.message);
    console.error('Check MONGO_URI, your Atlas user/password and the Atlas Network Access list.');
    process.exit(1);
  }
}
