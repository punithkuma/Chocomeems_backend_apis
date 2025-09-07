const router = require("express").Router();
const { auth } = require("../middleware/auth");
const { createCourse, listCourses, getCourse, getStudentCourses } = require("../controllers/courseController");

// Only instructors can create courses
router.post("/", auth("instructor"), createCourse);

// List all courses
router.get("/", auth(), listCourses);

// Get single course (with videos)
router.get("/:id", auth(), getCourse);

router.get("/students/courses", auth("student"), getStudentCourses);

module.exports = router;
