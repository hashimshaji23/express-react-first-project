import { Router } from "express";
import { forgotPassword, getMe, login, logout, Register, resetPassword, verifyOtp } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router()

router.post('/register', Register)
router.post('/verify-otp', verifyOtp)
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword)
router.put("/reset-password/:resetToken", resetPassword);
router.get("/me", protect, getMe);


export default router;


