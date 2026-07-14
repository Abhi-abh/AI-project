const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const writeUriFile = (uri) => {
  try {
    const rootPath = path.resolve(__dirname, '../../../');
    const filePath = path.join(rootPath, '.mongodb_uri');
    fs.writeFileSync(filePath, uri, 'utf8');
    console.log(`Saved MongoDB URI to ${filePath}`);
  } catch (err) {
    console.error(`Failed to write MongoDB URI file: ${err.message}`);
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-task-platform';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000, // Fail fast (3s) to trigger fallback
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    writeUriFile(mongoUri);
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || mongoUri.includes('127.0.0.1')) {
      console.warn(`Connection refused at ${mongoUri}. Spinning up in-memory MongoDB server...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const baseMemoryUri = mongoServer.getUri(); // returns 'mongodb://127.0.0.1:xxxxx/'
        const dbName = 'ai-task-platform';
        const memoryUri = `${baseMemoryUri}${dbName}`;
        
        console.log(`In-Memory MongoDB Server running at: ${memoryUri}`);
        const conn = await mongoose.connect(memoryUri);
        console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
        writeUriFile(memoryUri);
        return;
      } catch (innerError) {
        console.error(`In-Memory MongoDB Server startup failed: ${innerError.message}`);
      }
    }
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
