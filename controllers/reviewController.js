import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";

export const createReview = async (req, res) => {
  try {
    const { difficulty, comment, rating, monastery } = req.body;
    const userId = req.user.id;

    console.log("Creating review for user:", userId); // Debug log
    console.log("Review data:", { difficulty, comment, rating, monastery }); // Debug log

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!monastery || monastery.trim() === '') {
      return res.status(400).json({ message: "Monastery name is required" });
    }

    const newReview = new reviewModel({
      user: userId,
      userName: `${user.firstName} ${user.lastName}`,
      monastery: monastery.trim(),
      difficulty,
      comment,
      rating
    });

    await newReview.save();

    res.status(201).json({
      message: "Review submitted successfully!",
      review: newReview
    });
  } catch (err) {
    console.log("Review creation error:", err);
    res.status(400).json({ message: "Error creating review", error: err.message });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { monastery } = req.query;
    
    const filter = { user: userId };
    if (monastery) {
      filter.monastery = monastery;
    }
    
    const reviews = await reviewModel.find(filter).sort({ createdAt: -1 });
    
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
    const { difficulty, comment, rating, monastery } = req.body;
    const userId = req.user.id;
    const { reviewId } = req.params;

    const filter = { user: userId };
    if (reviewId) {
      filter._id = reviewId;
    }

    const review = await reviewModel.findOne(filter);
    if (!review) {
      return res.status(404).json({ message: "No review found to update" });
    }

    review.difficulty = difficulty;
    review.comment = comment;
    review.rating = rating;
    if (monastery) {
      review.monastery = monastery.trim();
    }

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

export const getAllReviews = async (req, res) => {
  try {
    const { difficulty, monastery, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (monastery) {
      filter.monastery = monastery;
    }

    const reviews = await reviewModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await reviewModel.countDocuments(filter);

    // Get stats for the specific monastery (or all if no monastery specified)
    const statsFilter = monastery ? { monastery } : {};
    const stats = await reviewModel.aggregate([
      { $match: statsFilter },
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
      monastery: monastery || "all monasteries",
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
    const { difficulty, monastery, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (difficulty) filter.difficulty = difficulty;
    if (monastery) filter.monastery = monastery;

    const reviews = await reviewModel
      .find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await reviewModel.countDocuments(filter);

    const overviewStats = await reviewModel.aggregate([
      { $match: monastery ? { monastery } : {} },
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    res.status(200).json({
      message: "Admin reviews retrieved successfully",
      monastery: monastery || "all monasteries",
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
    const { monastery } = req.query;
    const matchStage = monastery ? { $match: { monastery } } : { $match: {} };
    
    const stats = await reviewModel.aggregate([
      matchStage,
      {
        $facet: {
          difficultyBreakdown: [
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
                averageRating: { $avg: "$rating" }
              }
            }
          ],
          monasteryStats: [
            {
              $group: {
                _id: "$monastery",
                reviewCount: { $sum: 1 },
                avgRating: { $avg: "$rating" }
              }
            },
            { $sort: { reviewCount: -1 } }
          ],
          recentReviews: [
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
      monastery: monastery || "all monasteries",
      stats: stats[0]
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error retrieving dashboard stats", error: err.message });
  }
};

// Health check function for review system
export const reviewHealthCheck = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Test database connectivity and basic operations
    const healthStatus = {
      service: "Review System",
      status: "healthy",
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: "unknown", message: "", responseTime: 0 },
        publicReviews: { status: "unknown", message: "", count: 0 },
        totalReviews: { status: "unknown", message: "", count: 0 }
      }
    };

    // Test 1: Database connection
    try {
      const dbStartTime = Date.now();
      const dbResult = await reviewModel.findOne().limit(1);
      healthStatus.checks.database = {
        status: "healthy",
        message: "Database connection successful",
        responseTime: Date.now() - dbStartTime
      };
    } catch (dbErr) {
      healthStatus.checks.database = {
        status: "unhealthy",
        message: `Database connection failed: ${dbErr.message}`,
        responseTime: Date.now() - startTime
      };
      healthStatus.status = "unhealthy";
    }

    // Test 2: Public reviews functionality
    try {
      const publicStartTime = Date.now();
      const allReviews = await reviewModel.find({});
      healthStatus.checks.publicReviews = {
        status: "healthy",
        message: "Public reviews retrieval successful",
        count: allReviews.length,
        responseTime: Date.now() - publicStartTime
      };
    } catch (publicErr) {
      healthStatus.checks.publicReviews = {
        status: "unhealthy",
        message: `Public reviews retrieval failed: ${publicErr.message}`,
        count: 0
      };
      healthStatus.status = "unhealthy";
    }

    // Test 3: Total reviews count
    try {
      const totalStartTime = Date.now();
      const totalCount = await reviewModel.countDocuments();
      healthStatus.checks.totalReviews = {
        status: "healthy",
        message: "Total reviews count successful",
        count: totalCount,
        responseTime: Date.now() - totalStartTime
      };
    } catch (totalErr) {
      healthStatus.checks.totalReviews = {
        status: "unhealthy",
        message: `Total reviews count failed: ${totalErr.message}`,
        count: 0
      };
      healthStatus.status = "unhealthy";
    }

    // Overall response time
    healthStatus.totalResponseTime = Date.now() - startTime;

    // Return appropriate status code
    const statusCode = healthStatus.status === "healthy" ? 200 : 503;
    
    res.status(statusCode).json({
      message: `Review system health check completed - ${healthStatus.status}`,
      health: healthStatus
    });

  } catch (err) {
    console.log("Health check error:", err);
    res.status(503).json({
      message: "Review system health check failed",
      health: {
        service: "Review System",
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: err.message
      }
    });
  }
};

// Get list of all monasteries that have reviews
export const getMonasteries = async (req, res) => {
  try {
    const monasteries = await reviewModel.aggregate([
      {
        $group: {
          _id: "$monastery",
          reviewCount: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          lastReview: { $max: "$createdAt" }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          reviewCount: 1,
          averageRating: 1,
          lastReview: 1
        }
      },
      { $sort: { reviewCount: -1 } }
    ]);

    res.status(200).json({
      message: "Monasteries retrieved successfully",
      monasteries,
      count: monasteries.length
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error retrieving monasteries", error: err.message });
  }
};

// Get reviews by monastery name
export const getReviewsByMonastery = async (req, res) => {
  try {
    const { monasteryName } = req.params;
    const { difficulty, page = 1, limit = 10 } = req.query;
    
    const filter = { monastery: monasteryName };
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const reviews = await reviewModel
      .find(filter)
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await reviewModel.countDocuments(filter);

    const stats = await reviewModel.aggregate([
      { $match: { monastery: monasteryName } },
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
      message: `Reviews for ${monasteryName} retrieved successfully`,
      monastery: monasteryName,
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
    res.status(400).json({ message: "Error retrieving monastery reviews", error: err.message });
  }
};

// Debug endpoint to help troubleshoot review submission issues
export const debugReviewSubmission = async (req, res) => {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      auth: {
        hasUser: !!req.user,
        userId: req.user?.id || "undefined",
        userEmail: req.user?.email || "undefined",
        userRole: req.user?.role || "undefined"
      },
      requestBody: req.body,
      validation: {},
      database: {}
    };

    // Check user authentication
    if (!req.user?.id) {
      debugInfo.auth.issue = "No user ID found in request";
      return res.status(401).json({
        message: "Authentication debug - User not properly authenticated",
        debug: debugInfo
      });
    }

    // Check if user exists in database
    try {
      const user = await userModel.findById(req.user.id);
      debugInfo.database.userExists = !!user;
      debugInfo.database.userData = user ? {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      } : null;
    } catch (userError) {
      debugInfo.database.userCheckError = userError.message;
    }

    // Check for existing review for this monastery
    try {
      const { monastery } = req.body;
      const filter = { user: req.user.id };
      if (monastery) {
        filter.monastery = monastery;
      }
      const existingReview = await reviewModel.findOne(filter);
      debugInfo.database.hasExistingReview = !!existingReview;
      debugInfo.database.existingReviewData = existingReview ? {
        id: existingReview._id,
        monastery: existingReview.monastery,
        createdAt: existingReview.createdAt
      } : null;
    } catch (reviewError) {
      debugInfo.database.reviewCheckError = reviewError.message;
    }

    // Validate request body
    const { difficulty, comment, rating, monastery } = req.body;
    debugInfo.validation = {
      difficulty: {
        value: difficulty,
        valid: ["easy", "moderate", "hard"].includes(difficulty),
        required: true
      },
      comment: {
        value: comment,
        length: comment ? comment.length : 0,
        valid: comment && comment.length >= 10 && comment.length <= 1000,
        required: true
      },
      rating: {
        value: rating,
        type: typeof rating,
        valid: Number.isInteger(rating) && rating >= 1 && rating <= 5,
        required: true
      },
      monastery: {
        value: monastery,
        valid: monastery && monastery.trim().length > 0,
        required: true
      }
    };

    res.status(200).json({
      message: "Review submission debug information",
      debug: debugInfo
    });

  } catch (err) {
    res.status(500).json({
      message: "Debug endpoint error",
      error: err.message
    });
  }
};