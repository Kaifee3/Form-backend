import express from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
const Router = express.Router();
import {
  register,
  login,
  profile,
  updateUser,
  deleteUser,
  showUsers,
  updateProfile,
  getUser,
} from "../controllers/userController.js";
Router.post("/register", register);
Router.post("/login", login);
Router.get("/", authenticate, authorize("admin"), showUsers);
Router.get("/:id", authenticate, authorize("admin"), getUser);
Router.patch("/:id", authenticate, authorize("admin"), updateUser);
Router.delete("/:id", authenticate, authorize("admin"), deleteUser);
Router.get("/:id/profile", authenticate, profile);
Router.patch("/:id/profile", authenticate, updateProfile);

export default Router;