import express from "express";
import { createOrder ,deleteOrder,getAllOrders, getMyOrders, getOrderById, updateOrderStatus } from "../controllers/orderController.js"
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router()

router.post("/", auth, createOrder);
router.get("/",auth, getAllOrders);
router.get("/myorders", auth, getMyOrders);
router.get("/:id", auth, getOrderById);
router.delete("/:id", auth, deleteOrder);
router.put("/:id/status", auth, updateOrderStatus);

export default router;