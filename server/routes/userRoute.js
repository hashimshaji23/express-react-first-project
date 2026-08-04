// import { Router } from "express";
// import { Register } from "../controllers/userControllers.js";

// const router = Router()

// router.post('/register', Register)


// export default router;


import express from "express";
import { register, verifyOtp, login, logout, forgotPassword, resetPassword, getMe, } from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);
router.get("/me", protect, getMe);

export default router;