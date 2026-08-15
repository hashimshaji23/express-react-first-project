import Order from "../model/Order.js";

export const createOrder = async (req, res) => {
    try {
        const { prducts, totalAmount, shippingAddress } = req.body;

        if (!prducts || prducts.length === 0) {
            return res.status(400).json({ message: "No order items found" });
        }

        const order = new Order({
            user: req.user.id,
            prducts,
            totalAmount,
            shippingAddress,
        });

        const saveOrder = await order.save();
        res.status(201).json(saveOrder);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Admin/general: all orders belonging to the logged-in user, populated.
export const getMyAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate("prducts.product")
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// FIXED: was using req.user._id (undefined, since JWT payload only has `id`)
// and was returning { order } instead of { orders } — the frontend reads
// response.data.orders, so the mismatched key alone caused an empty list
// even when the id filter worked.
export const getMyOrders = async (req, res) => {
    console.log("getMyOrders hit, user:", req.user); // temporary debug line
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate("prducts.product")
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        console.log("getMyOrders ERROR:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status || order.status;
        const updateOrder = await order.save();

        res.status(200).json(updateOrder);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await order.deleteOne();
        res.status(200).json({ message: "Order deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};