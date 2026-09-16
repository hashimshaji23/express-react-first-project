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

const corsOptions = {
    origin: [
        "https://ecommerc-three.vercel.app",
        "http://localhost:5173",
        "http://localhost:4173",
        process.env.CLIENT_URL,
    ].filter(Boolean),
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

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
    const origin = req.headers.origin;
    if (origin) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Vary", "Origin");
    }
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Server error",
    });
});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
