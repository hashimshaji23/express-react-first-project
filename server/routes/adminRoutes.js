import express from "express"
import { getAllOrders, updateOrderStatus } from "../controllers/adminOrderController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get('/getAllorders',adminMiddleware, getAllOrders)
router.put('/update-Order-status',adminMiddleware, updateOrderStatus)

export default router;