const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Result = require('../models/Result');
const { normalizeStandard } = require('../utils/standardFormatter');

dotenv.config();

async function normalizeCollection(label, model) {
  const docs = await model.find({ standard: { $exists: true, $nin: [null, ''] } });
  let updated = 0;

  for (const doc of docs) {
    const normalized = normalizeStandard(doc.standard);
    if (normalized && doc.standard !== normalized) {
      await model.updateOne({ _id: doc._id }, { $set: { standard: normalized } });
      updated += 1;
    }
  }

  console.log(`${label}: normalized ${updated} document(s)`);
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await normalizeCollection('Users', User);
    await normalizeCollection('Results', Result);
    console.log('Standard normalization completed successfully');
  } catch (error) {
    console.error('Standard normalization failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();