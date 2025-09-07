const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  console.log(process.env.MONGO_URI)
  if (!uri) {
    console.error('MONGO_URI missing in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, {});
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Mongo connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
