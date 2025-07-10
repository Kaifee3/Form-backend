import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors"
import userRouter from "./routes/userRoute.js";
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
mongoose.connect(`mongodb+srv://${dbuser}:${dbpass}@cluster0.gwloipc.mongodb.net/merncafe?retryWrites=true&w=majority&appName=Cluster0`).then(() => {
  app.listen(8080, () => {
    console.log("Server started");
  });
});
app.use("/api/users", userRouter);