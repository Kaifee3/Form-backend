import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";

export const createReview = async (req, res) => {
  try {
    const { difficulty, comment, rating } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingReview = await reviewModel.findOne({ user: userId });
    if (existingReview) {
      return res.status(400).json({ 
        message: "You have already submitted a review. You can update your existing review." 
      });
    }

    const newReview = new reviewModel({
      user: userId,
      userName: `${user.firstName} ${user.lastName}`,
      difficulty,
      comment,
      rating
    });

    await newReview.save();

    res.status(201).json({
      message: "Review submitted successfully! It will be reviewed by admin.",
      review: newReview
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error creating review", error: err.message });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await reviewModel.find({ user: userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      message: "User reviews retrieved successfully",
      reviews,
      count: reviews.length
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error retrieving reviews", error: err.message });
  }
};

export const updateUserReview = async (req, res) => {
  try {
    const { difficulty, comment, rating } = req.body;
    const userId = req.user.id;

    const review = await reviewModel.findOne({ user: userId });
    if (!review) {
      return res.status(404).json({ message: "No review found to update" });
    }

    review.difficulty = difficulty;
    review.comment = comment;
    review.rating = rating;
    review.status = "pending";

    await review.save();

    res.status(200).json({
      message: "Review updated successfully",
      review
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error updating review", error: err.message });
  }
};

export const deleteUserReview = async (req, res) => {
  try {
    const userId = req.user.id;

    const review = await reviewModel.findOneAndDelete({ user: userId });
    if (!review) {
      return res.status(404).json({ message: "No review found to delete" });
    }

    res.status(200).json({
      message: "Review deleted successfully",
      deletedReview: review
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error deleting review", error: err.message });
  }
};

export const getAllApprovedReviews = async (req, res) => {
  try {
    const { difficulty, page = 1, limit = 10 } = req.query;
    const filter = { status: "approved" };
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const reviews = await reviewModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await reviewModel.countDocuments(filter);

    const stats = await reviewModel.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          difficultyBreakdown: {
            $push: "$difficulty"
          }
        }
      }
    ]);

    const difficultyStats = {};
    if (stats.length > 0) {
      stats[0].difficultyBreakdown.forEach(diff => {
        difficultyStats[diff] = (difficultyStats[diff] || 0) + 1;
      });
    }

    res.status(200).json({
      message: "Reviews retrieved successfully",
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: stats.length > 0 ? {
        averageRating: stats[0].averageRating,
        totalReviews: stats[0].totalReviews,
        difficultyBreakdown: difficultyStats
      } : null
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error retrieving reviews", error: err.message });
  }
};

export const getAllReviewsForAdmin = async (req, res) => {
  try {
    const { status, difficulty, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;

    const reviews = await reviewModel
      .find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await reviewModel.countDocuments(filter);

    const overviewStats = await reviewModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    res.status(200).json({
      message: "Admin reviews retrieved successfully",
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total
      },
      overviewStats
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error retrieving admin reviews", error: err.message });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const review = await reviewModel.findByIdAndUpdate(
      id, 
      { 
        status, 
        adminNote,
        reviewedAt: new Date(),
        reviewedBy: req.user.id
      },
      { new: true }
    ).populate('user', 'firstName lastName email');

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({
      message: `Review ${status} successfully`,
      review
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error updating review status", error: err.message });
  }
};

export const getReviewDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await reviewModel
      .findById(id)
      .populate('user', 'firstName lastName email role status createdAt');

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({
      message: "Review details retrieved successfully",
      review
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error retrieving review details", error: err.message });
  }
};

export const deleteReviewByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await reviewModel.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({
      message: "Review deleted successfully",
      deletedReview: review
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error deleting review", error: err.message });
  }
};

export const getReviewDashboardStats = async (req, res) => {
  try {
    const stats = await reviewModel.aggregate([
      {
        $facet: {
          statusBreakdown: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ],
          difficultyBreakdown: [
            {
              $match: { status: "approved" }
            },
            {
              $group: {
                _id: "$difficulty",
                count: { $sum: 1 },
                avgRating: { $avg: "$rating" }
              }
            }
          ],
          overallStats: [
            {
              $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                averageRating: { $avg: "$rating" },
                pendingReviews: {
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                },
                approvedReviews: {
                  $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
                }
              }
            }
          ],
          recentReviews: [
            {
              $match: { status: "pending" }
            },
            {
              $sort: { createdAt: -1 }
            },
            {
              $limit: 5
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      message: "Dashboard stats retrieved successfully",
      stats: stats[0]
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error retrieving dashboard stats", error: err.message });
  }
};