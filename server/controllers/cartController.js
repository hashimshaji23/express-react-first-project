import Cart from "../model/Cart.js";
import Product from "../model/Product.js";

// Add product to cart
export const addToCart = async (req, res) => {
    try {
        // console.log("BODY:", req.body);
        // console.log("USER:", req.user);
        const { productId, quantity = 1 } = req.body;
        const userId = req.user.id;
        console.log("user", req.user.id);
        

        const product = await Product.findById(productId);
        console.log("Product ID received:", productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Check whether product already exists in user's cart
        let cartItem = await Cart.findOne({
            user: userId,
            Product: productId
        });

        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();

            return res.status(200).json({
                message: "Cart quantity updated",
                cartItem
            });
        }

        // Create new cart item
        cartItem = await Cart.create({
            user: userId,
            Product: productId,
            quantity,
            price: product.price
        });

        res.status(201).json({
            message: "Product added to cart",
            cartItem
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to add product to cart",
            error: error.message
        });
    }
};


// Get user's cart
export const getCart = async (req, res) => {
    try {
        // console.log("BODY:", req.body);
        // console.log("USER:", req.user);
        const userId = req.user.id;

        const cart = await Cart.find({ user: userId })
            .populate("Product");

        res.status(200).json({
            message: "Cart fetched successfully",
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get cart",
            error: error.message
        });
    }
};


// Update cart quantity
export const updateCartQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userId = req.user.id;

        if (quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1"
            });
        }

        const cartItem = await Cart.findOne({
            _id: id,
            user: userId
        });

        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found"
            });
        }

        cartItem.quantity = quantity;

        await cartItem.save();

        res.status(200).json({
            message: "Cart quantity updated",
            cartItem
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update cart",
            error: error.message
        });
    }
};


// Remove product from cart
export const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const cartItem = await Cart.findOneAndDelete({
            _id: id,
            user: userId
        });

        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found"
            });
        }

        res.status(200).json({
            message: "Product removed from cart"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to remove product",
            error: error.message
        });
    }
};


// Clear entire cart
export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        await Cart.deleteMany({
            user: userId
        });

        res.status(200).json({
            message: "Cart cleared successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to clear cart",
            error: error.message
        });
    }
};