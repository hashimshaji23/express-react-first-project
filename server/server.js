import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import connection from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"


const app = express()

dotenv.config()
app.use(cors())

const port = process.env.PORT
connection()

app.use(express.json())
app.use('/api/auth', authRoutes );
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);


app.listen(port, () => {
    console.log(` server is running on port ${port}`)
});




