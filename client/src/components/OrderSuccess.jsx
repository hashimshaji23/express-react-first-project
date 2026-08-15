import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderSuccess.css";

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Passed in from Checkout.jsx: navigate("/order-success", { state: { order } })
    const order = location.state?.order;

    return (
        <div className="order-success-page">

            <div className="order-success-card">

                <div className="order-success-icon">✓</div>

                <h1>Order Placed!</h1>
                <p className="order-success-subtitle">
                    Thanks for your order — we're getting it ready.
                </p>

                {order && (
                    <div className="order-success-details">
                        {order._id && (
                            <div className="order-success-row">
                                <span>Order ID</span>
                                <span className="order-success-mono">
                                    #{order._id.slice(-8).toUpperCase()}
                                </span>
                            </div>
                        )}

                        {order.totalAmount != null && (
                            <div className="order-success-row">
                                <span>Total</span>
                                <span className="order-success-mono">
                                    ₹{Number(order.totalAmount).toFixed(2)}
                                </span>
                            </div>
                        )}

                        {order.shippingAddress?.city && (
                            <div className="order-success-row">
                                <span>Shipping to</span>
                                <span>
                                    {order.shippingAddress.city}, {order.shippingAddress.state}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="order-success-actions">
                    <button
                        className="order-success-btn order-success-btn--primary"
                        onClick={() => navigate("/Myorders")}
                    >
                        View My Orders
                    </button>

                    <button
                        className="order-success-btn"
                        onClick={() => navigate("/")}
                    >
                        Continue Shopping
                    </button>
                </div>

            </div>

        </div>
    );
};

export default OrderSuccess;