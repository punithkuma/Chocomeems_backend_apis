import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

export async function createCourse(req, res) {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const instructorId = req.user?.id;
    if (!instructorId) return res.status(401).json({ error: "Unauthorized" });

    const course = await Course.create({
      title,
      description,
      instructor: instructorId,
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: "Server error creating course" });
  }
}

export async function listCourses(req, res) {
  const courses = await Course.find().populate("instructor", "name email");
  res.json(courses);
}

export async function getCourse(req, res) {
  const { id } = req.params;
  const course = await Course.findById(id).populate("videos").populate("instructor", "name email");
  if (!course) return res.status(404).json({ error: "Not found" });
  res.json(course);
}

export async function getStudentCourses(req, res) {
  try {
    const studentId = req.user.id; // from JWT

    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: "course",
        populate: { path: "instructor", select: "name email" },
      });

    const courses = enrollments.map(e => e.course);

    res.json(courses);
  } catch (err) {
    console.error("Fetch student courses failed:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
}
