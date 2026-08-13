import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import connection from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"


const app = express()

dotenv.config()
app.use(cors())

const port = process.env.PORT
connection()

app.use(express.json())
app.use('/api/auth', authRoutes );
app.use('/api/admin', orderRoutes)
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes)


app.listen(port, () => {
    console.log(` server is running on port ${port}`)
});
