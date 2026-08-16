import mongoose from "mongoose";

export const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // Renamed from "products" to "prducts" to match createOrder,
    // getMyOrders, getMyAllOrders, and the frontend (Checkout.jsx /
    // MyOrders.jsx) — all of which already use this spelling.
    prducts: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
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

    // Matches the fields collected in Checkout.jsx's address form.
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
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
}, { timestamps: true });

export default mongoose.model("order", orderSchema);