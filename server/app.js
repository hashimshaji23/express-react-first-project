import express from "express";
const app = express()

import dotenv from "dotenv";
import connection from "./config/db.js";
dotenv.config()
import cors from 'cors'
import userRoute from "./routes/userRoute.js"
app.use(cors())

const port = process.env.PORT
connection()

app.use(express.json())
app.use('/user', userRoute)

app.listen(port, () => {
    console.log(` server is running on port ${port}`)
});

