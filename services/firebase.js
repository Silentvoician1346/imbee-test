import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(process.env.FIREBASE_CREDENTIALS),
});

export default admin;
