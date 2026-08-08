import express from "express";
import { createCategory, deleteCategory, getCategories, getCategory, updateCategory } from "../controllers/categoryController.js";
import { authorized, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory)

router.post("/", protect, authorized("admin", upload.single("image"), createCategory));
router.put("/:id", protect, authorized("admin"), upload.single("image"), updateCategory);
router.delete("/:id", protect, authorized("admin"), deleteCategory);

export default router;