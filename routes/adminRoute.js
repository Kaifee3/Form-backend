import express from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { 
  validateUser, 
  handleValidationErrors, 
  validateUserId 
} from "../middlewares/validation.js";
import {
  getAllUsersForAdmin,
  getUserDetailsForAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  addUser,
} from "../controllers/userController.js";

const Router = express.Router();

// Admin middleware - all routes require authentication and admin role
Router.use(authenticate);
Router.use(authorize("admin"));

// Admin user management routes
Router.get("/users", getAllUsersForAdmin); // GET /admin/users - Get all users with pagination and filtering
Router.get("/users/:id", validateUserId, getUserDetailsForAdmin); // GET /admin/users/:id - Get specific user details
Router.post("/users", validateUser, handleValidationErrors, addUser); // POST /admin/users - Create new user
Router.patch("/users/:id", validateUserId, validateUser, handleValidationErrors, updateUserByAdmin); // PATCH /admin/users/:id - Update user
Router.delete("/users/:id", validateUserId, deleteUserByAdmin); // DELETE /admin/users/:id - Delete user

// Admin dashboard stats route
Router.get("/dashboard/stats", async (req, res) => {
  try {
    const userModel = (await import("../models/userModel.js")).default;
    
    // Get comprehensive user statistics
    const stats = await userModel.aggregate([
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
                inactiveUsers: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } },
                adminUsers: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
                regularUsers: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } }
              }
            }
          ],
          recentUsers: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            { $project: { firstName: 1, lastName: 1, email: 1, role: 1, createdAt: 1 } }
          ],
          usersByMonth: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 }
          ]
        }
      }
    ]);

    const dashboardData = {
      ...stats[0].totalStats[0],
      recentUsers: stats[0].recentUsers,
      userGrowth: stats[0].usersByMonth
    };

    res.status(200).json(dashboardData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong while fetching dashboard stats" });
  }
});

export default Router;