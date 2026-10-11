const express = require("express");
const router = express.Router();
const controller = require("../controllers/bookController");

router.post("/batch", controller.createBooksBatch);
router.patch("/Future", controller.updateFutureBook);
router.get("/title", controller.findByTitle);
router.get("/year", controller.findByYearRange);
router.get("/genre", controller.findByGenre);
router.get("/skip-limit", controller.skipLimitSort);
router.get("/year-integer", controller.findIntegerYearBooks);
router.get("/exclude-genres", controller.excludeGenres);
router.delete("/before-year", controller.deleteBeforeYear);
router.get("/aggregate1", controller.aggregate1);
router.get("/aggregate2", controller.aggregate2);
router.get("/aggregate3", controller.aggregate3);
router.get("/aggregate4", controller.aggregate4);
router.post("/", controller.createBook);

module.exports = router;
