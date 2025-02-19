import admin from 'firebase-admin'; 
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

// console.log(serviceAccountBase64);

if (!serviceAccountBase64) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY in .env file");
}

try {
  const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
  
  const serviceAccount = JSON.parse(serviceAccountJson);
  console.log("This is service account key",serviceAccount);
  
  admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
} catch (error) {
  console.log("Error while retriving service account", error);
}

export default admin;
