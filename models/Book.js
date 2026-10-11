const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, default: "Unknown" },
    year: { type: mongoose.Schema.Types.Mixed, required: true },
    genres: { type: [String], default: [] }
  },
  {
    collection: "books",
    versionKey: false
  }
);

module.exports = mongoose.model("Book", bookSchema);
