import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Force Node to use Google and Cloudflare DNS
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const uri = process.env.MONGO_URI;

console.log('Testing connection to MongoDB...');
console.log('URI:', uri.replace(/:([^:@]{3,})@/, ':****@')); // Hide password in logs

mongoose.connect(uri, { family: 4 })
  .then(() => {
    console.log('✅ MongoDB Connection Successful!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:');
    console.error(err.message);
    process.exit(1);
  });
