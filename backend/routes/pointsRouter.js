const express = require("express");
const router = express.Router();
const { getPoints, setPoints } = require("../controllers/pointsController");

router.get("/", getPoints);
router.post("/", setPoints);

module.exports = router;