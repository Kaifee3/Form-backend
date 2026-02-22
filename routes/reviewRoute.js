import express from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { 
  validateReview, 
  validateReviewId,
  handleValidationErrors 
} from "../middlewares/validation.js";
import {
  createReview,
  getUserReviews,
  updateUserReview,
  deleteUserReview,
  getAllReviews,
  getAllReviewsForAdmin,
  getReviewDetailsForAdmin,
  deleteReviewByAdmin,
  getReviewDashboardStats,
  reviewHealthCheck,
  debugReviewSubmission
} from "../controllers/reviewController.js";

const Router = express.Router();

Router.get("/health", reviewHealthCheck);

Router.get("/debug", authenticate, debugReviewSubmission);

Router.get("/public", getAllReviews);

Router.post("/", authenticate, validateReview, handleValidationErrors, createReview);

Router.get("/my-reviews", authenticate, getUserReviews);

Router.put("/my-review", authenticate, validateReview, handleValidationErrors, updateUserReview);

Router.delete("/my-review", authenticate, deleteUserReview);

Router.use("/admin", authenticate);
Router.use("/admin", authorize("admin"));

Router.get("/admin/dashboard/stats", getReviewDashboardStats);

Router.get("/admin", getAllReviewsForAdmin);

Router.get("/admin/:id", validateReviewId, getReviewDetailsForAdmin);

Router.delete("/admin/:id", validateReviewId, deleteReviewByAdmin);

export default Router;