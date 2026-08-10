import { Router } from "express";
import { login, Register } from "../controllers/authController.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = Router()

router.post('/register', Register)
// router.post('/verify-otp', verifyOtp)
router.post("/login", login);
// router.post("/logout", logout);
// router.post("/forgot-password", forgotPassword)
// router.put("/reset-password/:resetToken", resetPassword);



export default router;


