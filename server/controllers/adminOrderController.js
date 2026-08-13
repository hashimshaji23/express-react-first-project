import Order from "../model/Order.js";

// Get All orders (admin)
export const getAllOrders = async (req, res) => {
    try {
        
        const Orders = await Order.find()
        .populate('user', 'name email')
        .sort({createdAt: -1});

        res.status(200).json({
            Orders
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

// UPDATE ORDER STATES

export const updateOrderStatus = async(req, res) => {
    try {
        const {status} =req.body;
        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({
                message: 'order not found'
            });
        }

        order.status = status;

        await order.save();

        res.status(200).json({
            message: 'order status updated successfully',
            order
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}