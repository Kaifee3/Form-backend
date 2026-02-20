import express from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { 
  validateUser, 
  validateRegistration, 
  validateLogin, 
  handleValidationErrors, 
  validateUserId,
  validateWishlistItem 
} from "../middlewares/validation.js";
const Router = express.Router();
import {
  register,
  login,
  googleLogin,
  profile,
  updateUser,
  deleteUser,
  showUsers,
  updateProfile,
  getUser,
  addUser,
  getAllUsersForAdmin,
  getUserDetailsForAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  toggleWishlist,
} from "../controllers/userController.js";

//user routes
Router.post("/register", validateRegistration, handleValidationErrors, register);
Router.post("/login", validateLogin, handleValidationErrors, login);
Router.post("/google-login", googleLogin);

// Wishlist routes - moved to top to avoid route conflicts
Router.get("/wishlist", authenticate, getWishlist);
Router.post("/wishlist/add", authenticate, validateWishlistItem, handleValidationErrors, addToWishlist);
Router.post("/wishlist/remove", authenticate, validateWishlistItem, handleValidationErrors, removeFromWishlist);
Router.post("/wishlist/toggle", authenticate, validateWishlistItem, handleValidationErrors, toggleWishlist);

Router.get("/:id/profile", authenticate, validateUserId, profile);
Router.patch("/:id/profile", authenticate, validateUserId, validateUser, handleValidationErrors, updateProfile);

//admin routes - all require authentication and admin role
Router.get("/", authenticate, authorize("admin"), showUsers);
Router.post("/", authenticate, authorize("admin"), validateUser, handleValidationErrors, addUser);
Router.get("/admin/users", authenticate, authorize("admin"), getAllUsersForAdmin);
Router.get("/admin/users/:id", authenticate, authorize("admin"), validateUserId, getUserDetailsForAdmin);
Router.patch("/admin/users/:id", authenticate, authorize("admin"), validateUserId, validateUser, handleValidationErrors, updateUserByAdmin);
Router.delete("/admin/users/:id", authenticate, authorize("admin"), validateUserId, deleteUserByAdmin);
Router.get("/:id", authenticate, authorize("admin"), validateUserId, getUser);
Router.patch("/:id", authenticate, authorize("admin"), validateUserId, validateUser, handleValidationErrors, updateUser);
Router.delete("/:id", authenticate, authorize("admin"), validateUserId, deleteUser);


export default Router;