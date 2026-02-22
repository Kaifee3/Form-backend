import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors"
import userRouter from "./routes/userRoute.js";
import adminRouter from "./routes/adminRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
const app = express();
app.use(express.json());
dotenv.config();
app.use(cors())
const dbuser=encodeURIComponent(process.env.DBUSER)
const dbpass=encodeURIComponent(process.env.DBPASS)

// mongoose.connect(`mongodb://localhost:27017/merncafe`).then(() => {
//   app.listen(8080, () => {
//     console.log("Server started");
//   });
// });
mongoose.connect(`mongodb+srv://${dbuser}:${dbpass}@monestryes.8dapf6y.mongodb.net/mon?appName=Monestryes`).then(() => {
  app.listen(8080, () => {
    console.log("Server started - User Authentication & Admin System");
  });
});

app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewRouter);

app.get("/", (req, res) => {
  res.json({ 
    message: "MERN Cafe Backend - User Management & Reviews System", 
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      admin: "/api/admin", 
      reviews: "/api/reviews",
      wishlist: "/api/users/wishlist"
    },
    features: [
      "User Authentication & Authorizations",
      "Admin Panel & User Management", 
      "Review System",
      "Personal Wishlist (Database Persistent)"
    ]
  });
});

export default app;