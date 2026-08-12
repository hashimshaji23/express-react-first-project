import express from "express";
import { addToCart, getCart, updateCartQuantity } from "../controllers/cartController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router()

router.get("/", auth,getCart)

router.post("/",auth ,addToCart);
router.put("/update",auth ,auth,updateCartQuantity)


export default router;