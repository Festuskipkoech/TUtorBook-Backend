import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  day: { type: String },
  month: { type: String },
  year: { type: String },
  institution: { type: String },
  subscribers: {type: Number,default: 0,},
  subscribedUsers: {type: [String],},
  graduationYear: { type: String },
  course: { type: String },
  password: { type: String, required: true },
  photo: { type: String },
});

export default mongoose.model("User", userSchema);
