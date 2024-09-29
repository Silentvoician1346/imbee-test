import db from "./db.js";

export async function saveFcmJob(identifier, deliverAt) {
  const sql = "INSERT INTO fcm_job (identifier, deliverAt) VALUES (?, ?)";
  const values = [identifier, formatDateForMySQL(deliverAt)];
  try {
    await db.query(sql, values);
    console.log(`Saved FCM Job: ${identifier} at ${deliverAt}`);
  } catch (err) {
    console.error("Error saving FCM Job:", err);
  }
}

export async function getFcmJob(identifier, deliverAt) {
  const sql = "SELECT * FROM fcm_job;";
  try {
    await db.query(sql);
    console.log(`Get FCM Job: ${identifier} at ${deliverAt}`);
  } catch (err) {
    console.error("Error getting FCM Job:", err);
  }
}

function formatDateForMySQL(isoString) {
  const date = new Date(isoString);
  return date.toISOString().slice(0, 19).replace("T", " ");
}
