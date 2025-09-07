import multer from "multer";
import path from "path";
import fs from "fs";
import Video from "../models/Video.js";
import Enrollment from "../models/Enrollment.js";
import { fileURLToPath } from "url";
import Course from "../models/Course.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store videos in ./uploads
// Absolute path to /uploads
const uploadPath = path.join(__dirname, "../../uploads");

// Create folder if not exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 500 } }); // 500MB limit

const uploadMiddleware = upload.single('video');



async function uploadVideo(req, res) {
  try {
    console.log("req",req)
    if (!req.file) return res.status(400).json({ error: "Missing video file" });

    const { title, description, courseId } = req.body;
    if (!title) return res.status(400).json({ error: "Missing title" });
    if (!courseId) return res.status(400).json({ error: "Missing courseId" });

    const instructorId = req.user?.id;
    if (!instructorId) return res.status(401).json({ error: "Unauthorized" });

    // ✅ check course exists and belongs to this instructor
    const course = await Course.findOne({ _id: courseId, instructor: instructorId });
    if (!course) {
      return res.status(404).json({ error: "Course not found or not owned by you" });
    }

    const mime = req.file.mimetype;
    const filePath = `/uploads/${req.file.filename}`;

    // ✅ create video
    const video = await Video.create({
      title,
      description,
      filePath,
      mimeType: mime,
      instructor: instructorId,
      course: courseId,
    });

    // ✅ add video to course
    course.videos.push(video._id);
    await course.save();

    res.status(201).json({
      id: video._id,
      title: video.title,
      description: video.description,
      url: filePath,
      course: courseId,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Server error while uploading video" });
  }
}





async function listVideos(req, res) {
  const role = req.user?.role;
  if (role === 'student') {
    const grants = await Enrollment.find({ student: req.user.id }).select('video');
    const ids = grants.map(g => g.video);
    const videos = await Video.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
    return res.json(videos);
  }
  if (role === 'instructor') {
    const videos = await Video.find({ instructor: req.user.id }).sort({ createdAt: -1 });
    return res.json(videos);
  }
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
}

async function grantAccess(req, res) {
  try {
    const { id } = req.params; // courseId or videoId (depending on your design)
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: "studentIds array is required" });
    }
    console.log()
    // Map studentIds -> enrollment documents
    const enrollments = studentIds.map(studentId => ({
      student: studentId,
      course: id, // or course: id if enrollment is course-based
    }));

    await Enrollment.insertMany(enrollments);

    res.status(200).json({ ok: true, count: enrollments.length });
  } catch (err) {
    console.error("Grant access failed:", err);
    res.status(500).json({ error: "Failed to grant access" });
  }
}


export async function getStreamUrl(req, res) {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ error: "Not found" });

    // 👇 Add server origin dynamically
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    if (video.type === "local" || true) {  // assuming all are local
      return res.json({
        url: `${baseUrl}${video.filePath}`, // full absolute URL
        type: "local",
      });
    }

    // Later you can handle cloud storage (S3, etc.) here

  } catch (err) {
    console.error("Stream error:", err);
    res.status(500).json({ error: "Failed to get stream URL" });
  }
}


export { uploadMiddleware, uploadVideo, listVideos, grantAccess };

