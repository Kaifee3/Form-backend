import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';

const SECRET = "something";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    
    // Find or create user in database
    let user = await userModel.findOne({ email });
    if (!user) {
      user = await userModel.create({ 
        email, 
        name, 
        picture, 
        googleId,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || ''
      });
    } else {
      // Update user with Google info if not already present
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
        if (!user.name) user.name = name;
        await user.save();
      }
    }
    
    // Generate JWT token (using same format as regular login)
    const userObj = {
      id: user._id,
      firstName: user.firstName || user.name.split(' ')[0],
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(userObj, SECRET, { expiresIn: "1h" });
    
    res.status(200).json({ ...userObj, token });
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: 'Invalid Google token' });
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

const getAllUsersForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "", status = "" } = req.query;
    const skip = (page - 1) * limit;
    
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
      .find(filter, { password: 0 })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 });
      
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
    
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    
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
    
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
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

const addToWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { monasteryId } = req.body;
    
    if (!monasteryId) {
      return res.status(400).json({ message: "Monastery ID is required" });
    }
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.wishlist.includes(parseInt(monasteryId))) {
      return res.status(400).json({ message: "Monastery is already in wishlist" });
    }
    
    user.wishlist.push(parseInt(monasteryId));
    await user.save();
    
    res.status(200).json({ 
      message: "Monastery added to wishlist successfully",
      wishlist: user.wishlist 
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong while adding to wishlist" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { monasteryId } = req.body;
    
    if (!monasteryId) {
      return res.status(400).json({ message: "Monastery ID is required" });
    }
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.wishlist.includes(parseInt(monasteryId))) {
      return res.status(400).json({ message: "Monastery is not in wishlist" });
    }
    
    user.wishlist = user.wishlist.filter(id => id !== parseInt(monasteryId));
    await user.save();
    
    res.status(200).json({ 
      message: "Monastery removed from wishlist successfully",
      wishlist: user.wishlist 
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong while removing from wishlist" });
  }
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ 
      message: "Wishlist retrieved successfully",
      wishlist: user.wishlist 
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong while retrieving wishlist" });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { monasteryId } = req.body;
    
    if (!monasteryId) {
      return res.status(400).json({ message: "Monastery ID is required" });
    }
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const numId = parseInt(monasteryId);
    let isInWishlist = user.wishlist.includes(numId);
    let action;
    
    if (isInWishlist) {
      user.wishlist = user.wishlist.filter(id => id !== numId);
      action = "removed";
    } else {
      user.wishlist.push(numId);
      action = "added";
    }
    
    await user.save();
    
    res.status(200).json({ 
      message: `Monastery ${action} ${isInWishlist ? 'from' : 'to'} wishlist successfully`,
      action: action,
      isInWishlist: !isInWishlist,
      wishlist: user.wishlist 
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong while toggling wishlist" });
  }
};

export {
  register,
  login,
  googleLogin,
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
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  toggleWishlist,
};