// import express from "express";
// import dotenv from "dotenv";
// import cors from 'cors'
// import connection from "./config/db.js";
// import userRoute from "./routes/userRoute.js"



// const app = express()

// dotenv.config()
// app.use(cors())

// const port = process.env.PORT
// connection()

// app.use(express.json())
// app.use('/user', userRoute)

// app.listen(port, () => {
//     console.log(` server is running on port ${port}`)
// });


import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoute.js"
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

// console.log(process.env.MONGO_URL);

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Rate limiting on auth routes to prevent brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many requests, please try again later.",
});
app.use("/api/auth", authLimiter);

// Routes
app.use("/api/auth", userRouter);

app.get("/", (req, res) => res.send("API is running..."));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

