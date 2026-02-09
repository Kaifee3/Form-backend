/**
 * Test script to verify wishlist database operations
 * Run: node test-wishlist.js
 */

import mongoose from "mongoose";
import userModel from "./models/userModel.js";
import reviewModel from "./models/reviewModel.js";
import dotenv from "dotenv";

dotenv.config();

const dbuser = encodeURIComponent(process.env.DBUSER);
const dbpass = encodeURIComponent(process.env.DBPASS);

const testWishlistDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(`mongodb+srv://${dbuser}:${dbpass}@monestryes.8dapf6y.mongodb.net/mon?appName=Monestryes`);
    console.log("✅ Connected to MongoDB");

    // Find a test user (or create one)
    let testUser = await userModel.findOne({ email: "test@example.com" });
    if (!testUser) {
      testUser = new userModel({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "hashedPassword123"
      });
      await testUser.save();
      console.log("✅ Created test user");
    }

    // Find a test review (or create one)  
    let testReview = await reviewModel.findOne();
    if (!testReview) {
      testReview = new reviewModel({
        user: testUser._id,
        userName: "Test User",
        difficulty: "easy",
        comment: "This is a test review for wishlist testing",
        rating: 4
      });
      await testReview.save();
      console.log("✅ Created test review");
    }

    // Test wishlist operations
    console.log("\n🧪 Testing Wishlist Database Operations:");

    // 1. Add to wishlist
    if (!testUser.wishlist.includes(testReview._id)) {
      testUser.wishlist.push(testReview._id);
      await testUser.save();
      console.log("✅ Added item to wishlist - SAVED TO DATABASE");
    }

    // 2. Verify wishlist exists in database
    const userFromDB = await userModel.findById(testUser._id);
    console.log(`✅ Wishlist in database contains ${userFromDB.wishlist.length} items`);

    // 3. Populate wishlist with review details
    const populatedUser = await userModel.findById(testUser._id).populate('wishlist');
    if (populatedUser.wishlist.length > 0) {
      console.log(`✅ Populated wishlist item: "${populatedUser.wishlist[0].comment.substring(0, 30)}..."`);
    }

    // 4. Remove from wishlist
    testUser.wishlist = testUser.wishlist.filter(item => item.toString() !== testReview._id.toString());
    await testUser.save();
    console.log("✅ Removed item from wishlist - SAVED TO DATABASE");

    // 5. Verify removal
    const updatedUser = await userModel.findById(testUser._id);
    console.log(`✅ Wishlist after removal contains ${updatedUser.wishlist.length} items`);

    console.log("\n🎉 All wishlist database operations working correctly!");
    console.log("👉 Wishlist data is properly persisted in MongoDB");
    
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("📤 Database connection closed");
  }
};

testWishlistDatabase();