require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const collectionRoutes = require("./routes/collectionRoutes");
const bookRoutes = require("./routes/bookRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Assignment 7 - Express.js and MongoDB",
    status: "running"
  });
});

app.use("/collection", collectionRoutes);
app.use("/books", bookRoutes);
app.use("/logs", logRoutes);

// Assignment endpoint #5 is POST /books, so this route is handled by bookRoutes.
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  });
