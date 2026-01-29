import { body, validationResult } from "express-validator";

// Validation middleware for user creation/update
export const validateUser = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("First name must be between 2 and 30 characters"),
  
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Last name must be between 2 and 30 characters"),
  
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
  
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either 'active' or 'inactive'"),
];

// Validation middleware for user registration
export const validateRegistration = [
  body("firstName")
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("First name is required and must be between 2 and 30 characters"),
  
  body("lastName")
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Last name is required and must be between 2 and 30 characters"),
  
  body("email")
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  
  body("password")
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),
];

// Validation middleware for login
export const validateLogin = [
  body("email")
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array()
    });
  }
  next();
};

// Middleware to check if user ID is valid MongoDB ObjectId
export const validateUserId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }
  next();
};