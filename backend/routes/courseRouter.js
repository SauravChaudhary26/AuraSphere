const express = require("express");
const {
   getCourses,
   addCourse,
   deleteCourse,
} = require("../controllers/courseController");

const router = express.Router();

router.get("/:userId", getCourses);
router.post("/", addCourse);
router.delete("/", deleteCourse);

module.exports = router;
