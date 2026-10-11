const express = require("express");
const router = express.Router();
const controller = require("../controllers/collectionController");

router.post("/books", controller.createBooksCollection);
router.post("/authors", controller.createAuthorsCollection);
router.post("/logs/capped", controller.createCappedLogs);
router.post("/books/index", controller.createBooksTitleIndex);

module.exports = router;
