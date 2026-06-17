// pages/api/test-db.js
// Database connection test endpoint

import db from "@/lib/db";

export default async function handler(req, res) {
  try {
    const [rows] = await db.query("SELECT NOW() AS time");
    res.status(200).json({
      success: true,
      message: "Database connection successful!",
      data: rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed!",
      error: error.message,
    });
  }
}
