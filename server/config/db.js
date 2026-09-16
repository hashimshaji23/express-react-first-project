import mongoose from "mongoose";

const connection = () => {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
        console.error("MONGO_URL is not set");
        return;
    }

    mongoose
        .connect(mongoUrl)
        .then(() => {
            console.log("mongodb connected");
        })
        .catch((err) => {
            console.error("mongodb connection failed", err);
        });
};

export default connection;
