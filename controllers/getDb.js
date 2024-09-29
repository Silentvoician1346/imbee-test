import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function getDb() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "password",
      database: process.env.MYSQL_DATABASE || "fcm_service",
    });
    console.log("Connected to MySQL");

    // Query the database
    const [rows] = await connection.execute("SELECT * FROM fcm_job");
    console.log("FCM Jobs:", rows);

    // Close the connection
    await connection.end();
  } catch (err) {
    console.error("Error interacting with MySQL:", err);
  }
}

getDb();
