const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require(process.env.FIREBASE_CREDENTIALS)),
});

module.exports = admin;
