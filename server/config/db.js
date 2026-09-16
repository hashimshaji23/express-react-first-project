import mongoose from "mongoose";

const connection = () => {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
        console.error("MONGO_URL is not set");
        process.exit(1);
    }

    mongoose
        .connect(mongoUrl)
        .then(() => {
            console.log("mongodb connected");
        })
        .catch((err) => {
            console.error("mongodb connection failed", err);
            process.exit(1);
        });
};

export default connection;
