import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Checkout.css";

const ORDER_URL = "/api/orders"; 

const initialAddress = {
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
};

const Checkout = () => {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [address, setAddress] = useState(initialAddress);
    const [formErrors, setFormErrors] = useState({});
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState("");

    const getToken = () => localStorage.getItem("token");

    const authHeaders = () => ({
        headers: { Authorization: `Bearer ${getToken()}` },
    });

    // Load cart so we can build the order summary + line items
    const getCart = async () => {
        const token = getToken();

        if (!token) {
            setError("Please log in to check out");
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
            setError(err.response?.data?.message || "Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCart();
    }, []);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validateAddress = () => {
        const requiredFields = [
            "fullName",
            "phone",
            "addressLine1",
            "city",
            "state",
            "postalCode",
            "country",
        ];

        const errors = {};
        requiredFields.forEach((field) => {
            if (!address[field]?.trim()) {
                errors[field] = "Required";
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const subtotal = cartItems.reduce(
        (sum, item) =>
            sum + (item.price || item.Product?.price || 0) * item.quantity,
        0
    );

    // Flat-rate shipping placeholder — swap for real logic if you have it
    const shippingFee = subtotal > 0 && subtotal < 50 ? 5 : 0;
    const totalAmount = subtotal + shippingFee;

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;
        if (!validateAddress()) return;

        setPlacingOrder(true);
        setOrderError("");

        // Matches createOrder's expected body shape: { prducts, totalAmount, shippingAddress }
        const prducts = cartItems.map((item) => ({
            product: item.Product?._id,
            quantity: item.quantity,
            price: item.price || item.Product?.price || 0,
        }));

        try {
            const response = await API.post(
                ORDER_URL,
                {
                    prducts,
                    totalAmount,
                    shippingAddress: address,
                },
                authHeaders()
            );

            // Clear the cart now that the order was placed
            try {
                await API.delete("/api/cart/delete", authHeaders());
            } catch (clearErr) {
                console.log("Cart clear after order failed:", clearErr);
            }

            navigate("/Order-success", {
                state: { order: response.data },
            });

        } catch (err) {
            console.log(err);
            setOrderError(
                err.response?.data?.message || "Failed to place order"
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="checkout-page">
                <div className="checkout-loading">
                    <div className="checkout-spinner"></div>
                    <p>Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="checkout-page">
                <div className="checkout-empty">
                    <h2>{error}</h2>
                    <button
                        className="checkout-secondary-btn"
                        onClick={() => navigate("/")}
                    >
                        Go to Products
                    </button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <div className="checkout-empty">
                    <div className="checkout-empty__icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Add something to your cart before checking out.</p>
                    <button
                        className="checkout-secondary-btn"
                        onClick={() => navigate("/")}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">

            <div className="checkout-header">
                <h1>Checkout</h1>
                <p>Review your order and enter a shipping address</p>
            </div>

            {orderError && <div className="checkout-alert">{orderError}</div>}

            <div className="checkout-layout">

                {/* Shipping address form */}
                <div className="checkout-form">
                    <h2>Shipping Address</h2>

                    <div className="checkout-field">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={address.fullName}
                            onChange={handleAddressChange}
                            className={formErrors.fullName ? "checkout-input--error" : ""}
                        />
                        {formErrors.fullName && (
                            <span className="checkout-field-error">Required</span>
                        )}
                    </div>

                    <div className="checkout-field">
                        <label>Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={address.phone}
                            onChange={handleAddressChange}
                            className={formErrors.phone ? "checkout-input--error" : ""}
                        />
                        {formErrors.phone && (
                            <span className="checkout-field-error">Required</span>
                        )}
                    </div>

                    <div className="checkout-field">
                        <label>Address Line 1</label>
                        <input
                            type="text"
                            name="addressLine1"
                            value={address.addressLine1}
                            onChange={handleAddressChange}
                            className={formErrors.addressLine1 ? "checkout-input--error" : ""}
                        />
                        {formErrors.addressLine1 && (
                            <span className="checkout-field-error">Required</span>
                        )}
                    </div>

                    <div className="checkout-field">
                        <label>Address Line 2 (optional)</label>
                        <input
                            type="text"
                            name="addressLine2"
                            value={address.addressLine2}
                            onChange={handleAddressChange}
                        />
                    </div>

                    <div className="checkout-field-row">
                        <div className="checkout-field">
                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                value={address.city}
                                onChange={handleAddressChange}
                                className={formErrors.city ? "checkout-input--error" : ""}
                            />
                            {formErrors.city && (
                                <span className="checkout-field-error">Required</span>
                            )}
                        </div>

                        <div className="checkout-field">
                            <label>State</label>
                            <input
                                type="text"
                                name="state"
                                value={address.state}
                                onChange={handleAddressChange}
                                className={formErrors.state ? "checkout-input--error" : ""}
                            />
                            {formErrors.state && (
                                <span className="checkout-field-error">Required</span>
                            )}
                        </div>
                    </div>

                    <div className="checkout-field-row">
                        <div className="checkout-field">
                            <label>Postal Code</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={address.postalCode}
                                onChange={handleAddressChange}
                                className={formErrors.postalCode ? "checkout-input--error" : ""}
                            />
                            {formErrors.postalCode && (
                                <span className="checkout-field-error">Required</span>
                            )}
                        </div>

                        <div className="checkout-field">
                            <label>Country</label>
                            <input
                                type="text"
                                name="country"
                                value={address.country}
                                onChange={handleAddressChange}
                                className={formErrors.country ? "checkout-input--error" : ""}
                            />
                            {formErrors.country && (
                                <span className="checkout-field-error">Required</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order summary */}
                <div className="checkout-summary">
                    <h2>Order Summary</h2>

                    <div className="checkout-summary__items">
                        {cartItems.map((item) => {
                            const product = item.Product || {};
                            return (
                                <div className="checkout-summary__item" key={item._id}>
                                    <img
                                        src={
                                            product.image ||
                                            product.images?.[0]?.url ||
                                            "https://via.placeholder.com/60"
                                        }
                                        alt={product.name}
                                    />
                                    <div className="checkout-summary__item-info">
                                        <span>{product.name}</span>
                                        <span className="checkout-summary__item-qty">
                                            Qty {item.quantity}
                                        </span>
                                    </div>
                                    <span className="checkout-summary__item-price">
                                        ₹{((item.price || product.price || 0) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="checkout-summary__row">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="checkout-summary__row">
                        <span>Shipping</span>
                        <span>{shippingFee === 0 ? "Free" : `₹${shippingFee.toFixed(2)}`}</span>
                    </div>

                    <div className="checkout-summary__row checkout-summary__row--total">
                        <span>Total</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                    </div>

                    <button
                        className="checkout-place-btn"
                        onClick={handlePlaceOrder}
                        disabled={placingOrder}
                    >
                        {placingOrder ? "Placing Order..." : "Place Order"}
                    </button>
                </div>

            </div>

        </div>
    );
};

export default Checkout;