import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    firstName: { type: String },
    lastName:{type:String},
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    status: { type: String , default: "active"},
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
