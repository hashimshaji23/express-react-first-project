import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import connection from "./config/db.js";
import userRoute from "./routes/userRoute.js"



const app = express()

dotenv.config()
app.use(cors())

const port = process.env.PORT
connection()

app.use(express.json())
app.use('/user', userRoute)

app.listen(port, () => {
    console.log(` server is running on port ${port}`)
});




