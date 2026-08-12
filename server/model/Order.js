import mongoose from "mongoose";

export const orderShema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },

    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                require: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],

    totalAmount: {
        type: Number,
        required: true,
    },

    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        postCode: { type: String, required: true },
        country: { type: String, required: true },
    },

    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
    },

    isPaid: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true, })

export default mongoose.model("order", orderShema)