import express from "express";
import { addProduct, deleteProduct, showProduct, updatePrduct } from "../controllers/productController.js";

const Router = express.Router();

Router.post("/", addProduct);
Router.get("/product", showProduct);
Router.delete("/:id", deleteProduct);
Router.patch("/:id", updatePrduct);
//Router.post("/", addProduct);
export default Router;