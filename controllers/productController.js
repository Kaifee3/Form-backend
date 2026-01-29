import productModel from "../models/productModel.js";

const addProduct = async (req, res) => {
  try {
    const body = req.body;
    const result = await productModel.create(body);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const showProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const count = await productModel.countDocuments({
      productName: { $regex: search, $options: "i" },
    });

    const total = Math.ceil(count / limit);

    const products = await productModel
      .find({ productName: { $regex: search, $options: "i" } })
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 });

    res.status(200).json({ products, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await productModel.findByIdAndDelete(id);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

const updatePrduct = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    const result = await productModel.findByIdAndUpdate(id, body);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};



export { addProduct, showProduct, deleteProduct, updatePrduct };
