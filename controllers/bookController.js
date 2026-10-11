const mongoose = require("mongoose");
const Book = require("../models/Book");

function getDB() {
  return mongoose.connection.db;
}

// POST /books
async function createBook(req, res) {
  try {
    const { title, author, year, genres } = req.body;
    if (typeof title !== "string" || !title.trim() || year === undefined) {
      return res.status(400).json({ error: "title (non-empty string) and year are required." });
    }
    const book = await Book.create({
      title: title.trim(),
      author: author || "Unknown",
      year,
      genres: Array.isArray(genres) ? genres : []
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /books/batch
async function createBooksBatch(req, res) {
  try {
    const books = req.body.books || req.body;
    if (!Array.isArray(books) || books.length < 3) {
      return res.status(400).json({ error: "Send an array with at least three book records (or { books: [...] })." });
    }
    const invalid = books.some((book) =>
      !book || typeof book.title !== "string" || !book.title.trim() || book.year === undefined
    );
    if (invalid) {
      return res.status(400).json({ error: "Every book needs a non-empty title and a year." });
    }
    const result = await Book.insertMany(books.map((book) => ({
      title: book.title.trim(),
      author: book.author || "Unknown",
      year: book.year,
      genres: Array.isArray(book.genres) ? book.genres : []
    })));
    res.status(201).json({ insertedCount: result.length, books: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PATCH /books/Future
async function updateFutureBook(req, res) {
  try {
    const result = await getDB().collection("books").updateOne(
      { title: "Future" },
      { $set: { year: 2022 } }
    );
    if (!result.matchedCount) return res.status(404).json({ message: "Book with title 'Future' was not found." });
    res.json({ message: "Updated the year of 'Future' to 2022.", matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /books/title?title=Brave%20New%20World
async function findByTitle(req, res) {
  try {
    const title = req.query.title;
    if (!title) return res.status(400).json({ error: "Provide the title query parameter." });
    const book = await Book.findOne({ title }).lean();
    if (!book) return res.status(404).json({ message: "Book not found." });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /books/year?from=1990&to=2010
async function findByYearRange(req, res) {
  try {
    const from = Number(req.query.from);
    const to = Number(req.query.to);
    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      return res.status(400).json({ error: "Provide numeric from and to query parameters." });
    }
    const books = await Book.find({ year: { $gte: from, $lte: to } }).lean();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /books/genre?genre=Science%20Fiction
async function findByGenre(req, res) {
  try {
    const genre = req.query.genre;
    if (!genre) return res.status(400).json({ error: "Provide the genre query parameter." });
    const books = await Book.find({ genres: genre }).lean();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /books/skip-limit
async function skipLimitSort(req, res) {
  try {
    const books = await Book.find({})
      .sort({ year: -1 })
      .skip(2)
      .limit(3)
      .lean();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /books/year-integer
async function findIntegerYearBooks(req, res) {
  try {
    const books = await getDB().collection("books")
      .find({ year: { $type: "int" } })
      .toArray();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /books/exclude-genres
async function excludeGenres(req, res) {
  try {
    const books = await Book.find({
      genres: { $nin: ["Horror", "Science Fiction"] }
    }).lean();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /books/before-year?year=2000
async function deleteBeforeYear(req, res) {
  try {
    const year = Number(req.query.year || 2000);
    if (!Number.isFinite(year)) return res.status(400).json({ error: "year must be numeric." });
    const result = await getDB().collection("books").deleteMany({ year: { $lt: year } });
    res.json({ message: `Deleted books published before ${year}.`, deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /books/aggregate1
async function aggregate1(req, res) {
  try {
    const books = await Book.aggregate([
      { $match: { year: { $gt: 2000 } } },
      { $sort: { year: -1 } }
    ]);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /books/aggregate2
async function aggregate2(req, res) {
  try {
    const books = await Book.aggregate([
      { $match: { year: { $gt: 2000 } } },
      { $project: { _id: 0, title: 1, author: 1, year: 1 } }
    ]);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /books/aggregate3
async function aggregate3(req, res) {
  try {
    const books = await Book.aggregate([
      { $unwind: "$genres" }
    ]);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /books/aggregate4
async function aggregate4(req, res) {
  try {
    const books = await Book.aggregate([
      {
        $lookup: {
          from: "logs",
          localField: "_id",
          foreignField: "bookId",
          as: "logs"
        }
      }
    ]);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createBook,
  createBooksBatch,
  updateFutureBook,
  findByTitle,
  findByYearRange,
  findByGenre,
  skipLimitSort,
  findIntegerYearBooks,
  excludeGenres,
  deleteBeforeYear,
  aggregate1,
  aggregate2,
  aggregate3,
  aggregate4
};
