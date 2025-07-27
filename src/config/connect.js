import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Optional: Avoid deprecation warnings
      // useCreateIndex: true,
      // useFindAndModify: false
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Exit process with failure
  }

  // Optional: Handle disconnected DB after app starts
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected!');
  });
};
