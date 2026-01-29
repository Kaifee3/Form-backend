import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors"
import userRouter from "./routes/userRoute.js";
import adminRouter from "./routes/adminRoute.js";
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

// API Routes
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "MERN Cafe Backend - User Management System", 
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      admin: "/api/admin"
    }
  });
});

// mongodb+srv://kaifiazam130_db_user:N1fMUQtaed3LFFFL@monestryes.8dapf6y.mongodb.net/?appName=Monestryes