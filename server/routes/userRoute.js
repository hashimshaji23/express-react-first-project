import { Router } from "express";
import { Register, verifyOtp } from "../controllers/userControllers.js";

const router = Router()

router.post('/register', Register)
router.post('/verify-otp', verifyOtp)


export default router;


