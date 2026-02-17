import mongoose from 'mongoose';

const connectDB = async () => {
  // Force disconnect if connected to wrong database
  if (mongoose.connections[0].readyState === 1) {
    const currentDb = mongoose.connection.db?.databaseName;
    if (currentDb !== 'harhall') {
      console.log(`Disconnecting from database: ${currentDb}`);
      await mongoose.disconnect();
    } else {
      console.log('MongoDB already connected to database: harhall');
      return;
    }
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    // Get base URI without database name
    let mongoUri = process.env.MONGODB_URI;
    const urlParts = mongoUri.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    // If last part contains query params or is a database name, replace it
    if (lastPart.includes('?') || (urlParts.length > 3 && !lastPart.includes('?'))) {
      urlParts[urlParts.length - 1] = 'harhall' + (lastPart.includes('?') ? lastPart.substring(lastPart.indexOf('?')) : '');
      mongoUri = urlParts.join('/');
    } else {
      // No database in URI, add it
      mongoUri = mongoUri.replace(/\/$/, '') + '/harhall';
    }

    // Connect with explicit database name
    await mongoose.connect(mongoUri, {
      dbName: 'harhall',
    });
    
    const db = mongoose.connection.db;
    const dbName = db?.databaseName;
    console.log(`MongoDB connected successfully to database: ${dbName}`);
    
    // Clean up old indexes in users collection if they exist
    if (db) {
      try {
        const usersCollection = db.collection('users');
        const indexes = await usersCollection.indexes();
        
        // Drop any index on 'username' if it exists (old schema)
        for (const index of indexes) {
          if (index.key && index.key.username) {
            console.log('Dropping old username index...');
            await usersCollection.dropIndex(index.name);
            console.log('Old username index dropped');
          }
        }
      } catch {
        // Ignore errors if collection doesn't exist or index doesn't exist
        console.log('No old indexes to clean up');
      }
      
      const collections = await db.listCollections().toArray();
      console.log(`Database "${dbName}" is ready. Collections:`, collections.map(c => c.name).join(', ') || 'none');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connectDB;