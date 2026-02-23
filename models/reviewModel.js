import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    userName: {
      type: String,
      required: true
    },
    monastery: {
      type: String,
      required: true,
      trim: true
    },
    difficulty: { 
      type: String, 
      enum: ["easy", "moderate", "hard"], 
      required: true 
    },
    comment: { 
      type: String, 
      required: true,
      minlength: 10,
      maxlength: 1000
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    }
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ difficulty: 1 });
reviewSchema.index({ monastery: 1, createdAt: -1 });
reviewSchema.index({ monastery: 1, difficulty: 1 });

export default mongoose.model("Review", reviewSchema);