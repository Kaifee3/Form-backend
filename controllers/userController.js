import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const SECRET = "something";
const profile = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await userModel.findOne({ _id: id });
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await userModel.findByIdAndDelete(id);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};
const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    const result = await userModel.findByIdAndUpdate(id, body);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await userModel.findOne({ _id: id });
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (isMatch) {
        const userObj = {
          id: existingUser._id,
          firstName: existingUser.firstName,
          email: existingUser.email,
          role: existingUser.role,
        };
        const token = jwt.sign(userObj, SECRET, { expiresIn: "1h" });
        res.status(200).json({ ...userObj, token });
      } else {
        res.status(400).json({ message: "Invalid Password" });
      }
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedpwd = await bcrypt.hash(password, 10);
    const user = {
      firstName,
      lastName,
      email,
      password: hashedpwd,
    };
    const result = await userModel.create(user);
    res.status(201).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const addUser = async (req, res) => {
  try {
    const body = req.body;
    const hashedpwd = await bcrypt.hash(body.password, 10);
    body.password = hashedpwd;
    const result = await userModel.create(body);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const { firstName, lastName, email, password } = req.body;
    const hashedpwd = await bcrypt.hash(password, 10);
    const userObj = {
      firstName,
      lastName,
      email,
      password: hashedpwd,
    };
    const result = await userModel.findByIdAndUpdate(id, userObj);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

// const showUsers = async (req, res) => {
//   try {
//     const result = await userModel.find();
//     res.status(200).json(result);
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ message: "Something went wrong" });
//   }
// };

const showUsers = async (req, res) => {
  try {
    const { page = 1, limit = 3, search = "" } = req.query;
    const skip = (page - 1) * limit;
    const count = await userModel.countDocuments({ firstName: { $regex: search, $options: "i" } });
    const total = Math.ceil(count / limit);
    const users = await userModel
      .find({ firstName: { $regex: search, $options: "i" } })
      .skip(skip)
      .limit(limit)
      .sort({updatedAt:-1})
    res.status(200).json({ users, total });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Admin specific functions for comprehensive user management
const getAllUsersForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "", status = "" } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter object
    let filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    if (role) {
      filter.role = role;
    }
    if (status) {
      filter.status = status;
    }

    const count = await userModel.countDocuments(filter);
    const totalPages = Math.ceil(count / limit);
    
    const users = await userModel
      .find(filter, { password: 0 }) // Exclude password from response
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 });
      
    // Get user statistics
    const stats = await userModel.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
          regularUsers: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({ 
      users, 
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: count,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: stats[0] || { totalUsers: 0, activeUsers: 0, adminUsers: 0, regularUsers: 0 }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong while fetching users" });
  }
};

const getUserDetailsForAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.findById(id, { password: 0 });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Additional user analytics could be added here
    const userDetails = {
      ...user.toObject(),
      accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)), // days
      lastUpdated: user.updatedAt
    };
    
    res.status(200).json(userDetails);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong while fetching user details" });
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const { firstName, lastName, email, role, status, password } = req.body;
    
    // Check if user exists
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Build update object
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    
    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const updatedUser = await userModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      res.status(400).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Something went wrong while updating user" });
    }
  }
};

const deleteUserByAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if user exists
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prevent admin from deleting themselves
    if (req.userId === id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    
    await userModel.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: "User deleted successfully",
      deletedUser: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong while deleting user" });
  }
};

export {
  register,
  login,
  showUsers,
  deleteUser,
  updateUser,
  profile,
  updateProfile,
  getUser,
  addUser,
  getAllUsersForAdmin,
  getUserDetailsForAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
};