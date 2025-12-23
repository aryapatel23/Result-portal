const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function fixIndexes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('results');

    // Get existing indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });

    // Drop the old unique index on grNumber
    try {
      console.log('\n🗑️  Dropping old grNumber unique index...');
      await collection.dropIndex('grNumber_1');
      console.log('✅ Old index dropped successfully');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index already removed or does not exist');
      } else {
        throw error;
      }
    }

    // Create new compound unique index
    console.log('\n🔨 Creating new compound index (grNumber + term + academicYear)...');
    try {
      await collection.createIndex(
        { grNumber: 1, term: 1, academicYear: 1 },
        { unique: true, name: 'grNumber_term_academicYear_unique' }
      );
      console.log('✅ New compound index created successfully');
    } catch (error) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('ℹ️  Compound index already exists with correct configuration');
      } else {
        throw error;
      }
    }

    // Verify new indexes
    console.log('\n📋 Updated indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });

    console.log('\n✅ Index migration completed successfully!');
    console.log('ℹ️  Students can now have multiple results (one per term)');
    console.log('ℹ️  Same GR Number + Same Term = ❌ Blocked (duplicate)');
    console.log('ℹ️  Same GR Number + Different Term = ✅ Allowed');
    
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

fixIndexes();
