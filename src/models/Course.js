import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }]
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
