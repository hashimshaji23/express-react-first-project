import mongoose from "mongoose";

const DEFAULT_MONGO_URL = "mongodb+srv://hashimshaji12_db_user:UVJSsDtYLEh0Mzz7@cluster0.pjjgymw.mongodb.net/E-com";

const connection = () => {
    const mongoUrl = process.env.MONGO_URL || DEFAULT_MONGO_URL;

    mongoose
        .connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000,
        })
        .then(() => {
            console.log("mongodb connected successfully");
        })
        .catch((err) => {
            console.error("mongodb connection failed:", err.message);
        });
};

export default connection;
