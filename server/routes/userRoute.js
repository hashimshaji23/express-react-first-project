import { Router } from "express";
import { Register } from "../controllers/userControllers.js";

const router = Router()

router.post('/register', Register)


export default router