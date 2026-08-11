import express from "express";
import {
    createProduct, getProducts, getProduct, updateProduct,
    deleteProduct, deleteProductImage, updateStock,
} from "../controllers/productController.js";
// import { protect, authorize } from "../middleware/authMiddleware.js";
// import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:idOrSlug", getProduct);

// Admin only
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.delete("/:id/image/:publicId", deleteProductImage);
router.patch("/:id/stock", updateStock);
// router.get("/admin/inventory-alerts", getInventoryAlerts);

export default router;