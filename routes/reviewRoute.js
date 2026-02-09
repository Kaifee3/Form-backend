import express from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { 
  validateReview, 
  validateReviewStatus,
  validateReviewId,
  handleValidationErrors 
} from "../middlewares/validation.js";
import {
  createReview,
  getUserReviews,
  updateUserReview,
  deleteUserReview,
  getAllApprovedReviews,
  getAllReviewsForAdmin,
  updateReviewStatus,
  getReviewDetailsForAdmin,
  deleteReviewByAdmin,
  getReviewDashboardStats
} from "../controllers/reviewController.js";

const Router = express.Router();

Router.get("/public", getAllApprovedReviews);

Router.post("/", authenticate, validateReview, handleValidationErrors, createReview);

Router.get("/my-reviews", authenticate, getUserReviews);

Router.put("/my-review", authenticate, validateReview, handleValidationErrors, updateUserReview);

Router.delete("/my-review", authenticate, deleteUserReview);

Router.use("/admin", authenticate);
Router.use("/admin", authorize("admin"));

Router.get("/admin/dashboard/stats", getReviewDashboardStats);

Router.get("/admin", getAllReviewsForAdmin);

Router.get("/admin/:id", validateReviewId, getReviewDetailsForAdmin);

Router.patch("/admin/:id/status", validateReviewId, validateReviewStatus, handleValidationErrors, updateReviewStatus);

Router.delete("/admin/:id", validateReviewId, deleteReviewByAdmin);

export default Router;