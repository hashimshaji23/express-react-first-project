import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Cart.css";

const Cart = () => {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingIds, setUpdatingIds] = useState(new Set());
    const [message, setMessage] = useState("");

    const getToken = () => localStorage.getItem("token");

    const authHeaders = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const flashMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(""), 2000);
    };

    // Fetch cart items
    const getCart = async () => {
        const token = getToken();

        if (!token) {
            setError("Please log in to view your cart");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await API.get("/api/cart", authHeaders());

            setCartItems(response.data.cart || []);

        } catch (err) {
            console.log(err);
            setError(
                err.response?.data?.message || "Failed to load cart"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCart();
    }, []);

    // Update quantity (absolute value) — keyed by the CART ITEM's _id,
    // matching updateCartQuantity's req.params.id
    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdatingIds((prev) => new Set(prev).add(cartItemId));

        try {
            await API.put(
                `/api/cart/update/${cartItemId}`,
                { quantity: newQuantity },
                authHeaders()
            );

            setCartItems((prev) =>
                prev.map((item) =>
                    item._id === cartItemId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );

        } catch (err) {
            console.log(err);
            flashMessage(
                err.response?.data?.message || "Failed to update quantity"
            );
        } finally {
            setUpdatingIds((prev) => {
                const next = new Set(prev);
                next.delete(cartItemId);
                return next;
            });
        }
    };

    // Remove item from cart — keyed by the CART ITEM's _id,
    // matching removeFromCart's req.params.id
    const removeItem = async (cartItemId) => {
        setUpdatingIds((prev) => new Set(prev).add(cartItemId));

        try {
            await API.delete(`/api/cart/remove/${cartItemId}`, authHeaders());

            setCartItems((prev) =>
                prev.filter((item) => item._id !== cartItemId)
            );

            flashMessage("Item removed from cart");

        } catch (err) {
            console.log(err);
            flashMessage(
                err.response?.data?.message || "Failed to remove item"
            );
        } finally {
            setUpdatingIds((prev) => {
                const next = new Set(prev);
                next.delete(cartItemId);
                return next;
            });
        }
    };

    // Clear the entire cart
    const [clearing, setClearing] = useState(false);

    const handleClearCart = async () => {
        setClearing(true);

        try {
            await API.delete("/api/cart/delete", authHeaders());
            setCartItems([]);
            flashMessage("Cart cleared");

        } catch (err) {
            console.log(err);
            flashMessage(
                err.response?.data?.message || "Failed to clear cart"
            );
        } finally {
            setClearing(false);
        }
    };

    const total = cartItems.reduce(
        (sum, item) => sum + (item.price || item.Product?.price || 0) * item.quantity,
        0
    );

    if (loading) {
        return (
            <div className="cart-page">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-page">
                <div className="cart-empty">
                    <div className="cart-empty__icon">🔒</div>
                    <h2>{error}</h2>
                    <button
                        className="cart-continue-btn"
                        onClick={() => navigate("/")}
                    >
                        Go to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">

            <div className="cart-header">
                <div>
                    <h1>Your Cart</h1>
                    <p>{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
                </div>

                {cartItems.length > 0 && (
                    <button
                        className="cart-clear-btn"
                        onClick={handleClearCart}
                        disabled={clearing}
                    >
                        {clearing ? "Clearing..." : "Clear Cart"}
                    </button>
                )}
            </div>

            {message && <div className="cart-toast">{message}</div>}

            {cartItems.length === 0 ? (

                <div className="cart-empty">
                    <div className="cart-empty__icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added anything yet.</p>

                    <button
                        className="cart-continue-btn"
                        onClick={() => navigate("/")}
                    >
                        Continue Shopping
                    </button>
                </div>

            ) : (

                <div className="cart-layout">

                    {/* Cart items */}
                    <div className="cart-items">

                        {cartItems.map((item) => {
                            const product = item.Product || {};
                            const isUpdating = updatingIds.has(item._id);

                            return (
                                <div className="cart-item" key={item._id}>

                                    <img
                                        src={
                                            product.image ||
                                            product.images?.[0] ||
                                            "https://via.placeholder.com/120"
                                        }
                                        alt={product.name}
                                        className="cart-item__image"
                                    />

                                    <div className="cart-item__info">
                                        <span className="cart-item__brand">
                                            {product.brand}
                                        </span>
                                        <h3>{product.name}</h3>
                                        <span className="cart-item__price">
                                            ₹{item.price || product.price}
                                        </span>
                                    </div>

                                    <div className="cart-item__quantity">
                                        <button
                                            disabled={isUpdating || item.quantity <= 1}
                                            onClick={() =>
                                                updateQuantity(item._id, item.quantity - 1)
                                            }
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button
                                            disabled={isUpdating}
                                            onClick={() =>
                                                updateQuantity(item._id, item.quantity + 1)
                                            }
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="cart-item__subtotal">
                                        ₹{((item.price || product.price || 0) * item.quantity).toFixed(2)}
                                    </div>

                                    <button
                                        className="cart-item__remove"
                                        disabled={isUpdating}
                                        onClick={() => removeItem(item._id)}
                                        aria-label="Remove item"
                                    >
                                        🗑️
                                    </button>

                                </div>
                            );
                        })}

                    </div>

                    {/* Summary */}
                    <div className="cart-summary">
                        <h2>Order Summary</h2>

                        <div className="cart-summary__row">
                            <span>Subtotal</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>

                        <div className="cart-summary__row cart-summary__row--total">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>

                        <button className="cart-checkout-btn">
                            Proceed to Checkout
                        </button>

                        <button
                            className="cart-continue-btn"
                            onClick={() => navigate("/")}
                        >
                            Continue Shopping
                        </button>
                    </div>

                </div>
            )}

        </div>
    );
};

export default Cart;