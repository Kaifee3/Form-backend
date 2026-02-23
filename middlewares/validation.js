import { body, validationResult } from "express-validator";

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

export const validateUserId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }
  next();
};

export const validateReview = [
  body("difficulty")
    .notEmpty()
    .isIn(["easy", "moderate", "hard"])
    .withMessage("Difficulty must be one of: easy, moderate, hard"),
  
  body("comment")
    .notEmpty()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment is required and must be between 10 and 1000 characters"),
  
  body("rating")
    .notEmpty()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating is required and must be between 1 and 5"),
    
  body("monastery")
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Monastery name is required and must be between 2 and 100 characters"),
];

export const validateReviewId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid review ID format" });
  }
  next();
};

export const validateWishlistItem = [
  body("monasteryId")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Monastery ID is required and must be a positive integer"),
];