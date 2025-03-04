import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}else{
  console.warn('database defined')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached = (global as any).mongoose || { conn: null, promise: null };

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    }).then((mongoose) => mongoose);
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
