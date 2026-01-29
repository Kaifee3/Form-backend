import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors"
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
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
    console.log("Server started");
  });
});
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);

// mongodb+srv://kaifiazam130_db_user:N1fMUQtaed3LFFFL@monestryes.8dapf6y.mongodb.net/?appName=Monestryes