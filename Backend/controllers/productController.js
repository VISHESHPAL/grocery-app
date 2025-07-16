import { v2 as cloudinary } from "cloudinary";
import Product from "../model/product.js";

//  Add Product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.productData);
    const images = req.files;

    if (!images?.length) {
      return res.status(400).json({ success: false, message: "No images provided" });
    }

    const imagesUrl = [];

    for (const img of images) {
      const uploaded = await cloudinary.uploader.upload(img.path, {
        resource_type: "image",
        folder: "grocery_products",
      });
      imagesUrl.push(uploaded.secure_url);
    }

    const product = await Product.create({ ...productData, images: imagesUrl });

    return res.status(201).json({
      success: true,
      message: "Product Added Successfully!",
      product,
    });

  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

// GET Product : /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//  Get Singal  Product : /api/product/id
export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;

    if (!id?.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ success: false, message: "Invalid or missing product ID" });

    const product = await Product.findByIdAndUpdate(id, { inStock }, { new: true });

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({
      success: true,
      message: `Product ${inStock ? "in stock" : "out of stock"}`,
      product
    });

  } catch (err) {
    console.error("❌ changeStock Error:", err);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: "Server error" });
  }
};
