const mongoose = require("mongoose");

async function createLog(req, res) {
  try {
    const log = req.body && Object.keys(req.body).length
      ? req.body
      : { message: "Assignment test log", level: "info", createdAt: new Date() };

    if (!log.createdAt) log.createdAt = new Date();
    const result = await mongoose.connection.db.collection("logs").insertOne(log);
    res.status(201).json({
      message: "Log inserted successfully.",
      insertedId: result.insertedId,
      log
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { createLog };
