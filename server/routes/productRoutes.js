import express from "express";
import {
    createProduct, getProducts, getProduct, updateProduct, deleteProduct, deleteProductImage, updateStock,
} from "../controllers/productController.js";
// import { protect, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { auth } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:idOrSlug", getProduct);

const adminOnly = [auth, adminMiddleware];

// Admin only — more specific paths before /:id
router.post("/", ...adminOnly, upload.array("image"), createProduct);
router.put("/:id/stock", ...adminOnly, updateStock);
router.patch("/:id/stock", ...adminOnly, updateStock);
router.delete("/:id/images/*publicId", ...adminOnly, deleteProductImage);
router.delete("/:id/image/*publicId", ...adminOnly, deleteProductImage);
router.put("/:id", ...adminOnly, upload.array("image"), updateProduct);
router.delete("/:id", ...adminOnly, deleteProduct);

export default router;