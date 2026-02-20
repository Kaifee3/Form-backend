import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    firstName: { type: String },
    lastName:{type:String},
    email: { type: String, unique: true, required: true },
    password: { type: String, required: false }, // Made optional for Google users
    role: { type: String, default: "user" },
    status: { type: String , default: "active"},
    wishlist: [{ 
      type: Number
    }],
    // Google OAuth fields
    name: { type: String }, // Combined name from Google
    picture: { type: String }, // Google profile picture URL
    googleId: { type: String, unique: true, sparse: true }, // Google user ID
  },
  { timestamps: true }
);

userSchema.index({ "wishlist": 1 });

export default mongoose.model("User", userSchema);
