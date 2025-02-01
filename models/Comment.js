import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);
