import express from "express";
import { addToCart, clearCart, getCart, removeFromCart, updateCartQuantity } from "../controllers/cartController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", auth, getCart);

router.post("/", auth, addToCart);
router.put("/update/:id", auth, updateCartQuantity);
router.delete("/remove/:id", auth, removeFromCart);
router.delete("/delete", auth, clearCart);

export default router;