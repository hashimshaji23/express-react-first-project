// import express from "express"
// import { getAllOrders, updateOrderStatus } from "../controllers/adminOrderController.js";
// import { adminMiddleware } from "../middleware/adminMiddleware.js";

// const router = express.Router();

// router.get('/getAllorders',adminMiddleware, getAllOrders)
// router.put('/update-Order-status',adminMiddleware, updateOrderStatus)

// export default router;

import express from "express";
import { getAllOrders, updateOrderStatus } from "../controllers/adminController.js";
import { auth } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET  /api/admin/getAllorders
router.get("/getAllorders", auth, adminMiddleware, getAllOrders);

// PUT  /api/admin/update-Order-status/:id
router.put("/update-Order-status/:id", auth, adminMiddleware, updateOrderStatus);

export default router;