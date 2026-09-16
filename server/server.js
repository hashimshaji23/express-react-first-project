import "./config/env.js";
import express from "express";
import cors from "cors";
import connection from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:4173",
].filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            if (origin.endsWith(".vercel.app")) return callback(null, true);
            return callback(new Error("Not allowed by CORS"));
        },
    })
);

connection();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ status: true, message: "API is running" });
});

app.get("/health", (req, res) => {
    res.json({ status: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Server error",
    });
});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
