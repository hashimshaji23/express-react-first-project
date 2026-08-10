import express from "express";
import { createProduct, deleteProduct, deleteProductImage, getProduct, getProducts, updateProduct, updateStock } from "../controllers/productController.js";
// import { authorized, protect } from "../middleware/authMiddleware.js";
// import { upload } from "../middleware/uploadMiddleware.js";


const router = express.Router();

router.get("/", getProduct);
router.get("/:idOrSlug", getProducts);

router.post("/", upload.array("image", 5), createProduct);
router.put("/:id", upload.array("image", 5), updateProduct);
router.delete("/:id", deleteProduct);
router.delete("/:id/image/:publicId", deleteProductImage);
router.patch("/:id/stock",  updateStock);

export default router;