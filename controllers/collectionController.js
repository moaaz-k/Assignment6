const mongoose = require("mongoose");

function getDB() {
  return mongoose.connection.db;
}

// POST /collection/books
async function createBooksCollection(req, res) {
  try {
    const db = getDB();
    const existing = await db.listCollections({ name: "books" }).toArray();

    if (existing.length) {
      return res.status(200).json({ message: "Collection 'books' already exists." });
    }

    await db.createCollection("books", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["title"],
          properties: {
            title: {
              bsonType: "string",
              minLength: 1,
              description: "title must be a non-empty string"
            }
          }
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    res.status(201).json({ message: "Collection 'books' created with title validation." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /collection/authors
async function createAuthorsCollection(req, res) {
  try {
    const author = req.body && Object.keys(req.body).length
      ? req.body
      : { name: "George Orwell", country: "United Kingdom" };

    const result = await getDB().collection("authors").insertOne(author);
    res.status(201).json({
      message: "Implicit collection 'authors' created by inserting a document.",
      insertedId: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /collection/logs/capped
async function createCappedLogs(req, res) {
  try {
    const db = getDB();
    const existing = await db.listCollections({ name: "logs" }).toArray();

    if (existing.length) {
      const info = existing[0].options || {};
      return res.status(200).json({
        message: "Collection 'logs' already exists.",
        capped: Boolean(info.capped),
        size: info.size
      });
    }

    await db.createCollection("logs", { capped: true, size: 1024 * 1024 });
    res.status(201).json({ message: "Capped collection 'logs' created.", sizeBytes: 1048576 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /collection/books/index
async function createBooksTitleIndex(req, res) {
  try {
    const result = await getDB().collection("books").createIndex({ title: 1 });
    res.json({ message: "Index created on books.title.", indexName: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createBooksCollection,
  createAuthorsCollection,
  createCappedLogs,
  createBooksTitleIndex
};
