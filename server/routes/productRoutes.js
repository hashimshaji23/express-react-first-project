import express from "express";
import { createProduct, deleteProduct, deleteProductImage, getProduct, getProducts, updateProduct, updateStock } from "../controllers/productController.js";
import { authorized, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";


const router = express.Router();

router.get("/", getProduct);
router.get("/:idOrSlug", getProducts);

router.post("/", protect, authorized("admin"), upload.array("image", 5), createProduct);
router.put("/:id", protect, authorized("admin"), upload.array("image", 5), updateProduct);
router.delete("/:id", protect, authorized("admin"), deleteProduct);
router.delete("/:id/image/:publicId", protect, authorized("admin"), deleteProductImage);
router.patch("/:id/stock", protect, authorized("admin"), updateStock);

export default router;