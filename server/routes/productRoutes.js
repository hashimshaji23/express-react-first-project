import express from "express";
import {
    createProduct, getProducts, getProduct, updateProduct, deleteProduct, deleteProductImage, updateStock,
} from "../controllers/productController.js";
// import { protect, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:idOrSlug", getProduct);

// Admin only
router.post("/",auth ,upload.array("image"), createProduct);
router.put("/:id",auth ,upload.array("image"), updateProduct);
router.delete("/:id",auth ,deleteProduct);
router.delete("/:id/image/:publicId",auth ,deleteProductImage);
router.patch("/:id/stock",auth ,updateStock);
// router.get("/admin/inventory-alerts", getInventoryAlerts);

export default router;