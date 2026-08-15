import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Orders.css";

const MY_ORDERS_URL = "/api/orders/myorders";

const MyOrders = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getToken = () => localStorage.getItem("token");

    const authHeaders = () => ({
        headers: { Authorization: `Bearer ${getToken()}` },
    });

    const fetchMyOrders = async () => {
        const token = getToken();

        if (!token) {
            setError("Please log in to view your orders");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await API.get(MY_ORDERS_URL, authHeaders());
            setOrders(response.data.orders || []);

        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();
    }, []);

    if (loading) {
        return (
            <div className="my-orders-page">
                <div className="my-orders-loading">
                    <div className="my-orders-spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-orders-page">
                <div className="my-orders-empty">
                    <h2>{error}</h2>
                    <button
                        className="my-orders-btn"
                        onClick={() => navigate("/")}
                    >
                        Go to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders-page">

            <div className="my-orders-header">
                <h1>Your Orders</h1>
                <p>{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
            </div>

            {orders.length === 0 ? (

                <div className="my-orders-empty">
                    <div className="my-orders-empty__icon">📦</div>
                    <h2>No orders yet</h2>
                    <p>Once you place an order, it'll show up here.</p>
                    <button
                        className="my-orders-btn"
                        onClick={() => navigate("/")}
                    >
                        Start Shopping
                    </button>
                </div>

            ) : (

                <div className="my-orders-list">
                    {orders.map((order) => (
                        <div className="order-card" key={order._id}>

                            <div className="order-card__header">
                                <div>
                                    <span className="order-card__id">
                                        Order #{order._id.slice(-8).toUpperCase()}
                                    </span>
                                    <span className="order-card__date">
                                        {order.createdAt
                                            ? new Date(order.createdAt).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                            : "—"}
                                    </span>
                                </div>

                                <span className={`order-status order-status--${order.status || "pending"}`}>
                                    {order.status || "pending"}
                                </span>
                            </div>

                            <div className="order-card__items">
                                {(order.prducts || []).map((item, index) => (
                                    <div className="order-card__item" key={item._id || index}>
                                        <img
                                            src={
                                                item.product?.image ||
                                                item.product?.images?.[0]?.url ||
                                                "https://via.placeholder.com/56"
                                            }
                                            alt={item.product?.name || "Product"}
                                        />
                                        <div className="order-card__item-info">
                                            <span>{item.product?.name || "Product"}</span>
                                            <span className="order-card__item-qty">
                                                Qty {item.quantity}
                                            </span>
                                        </div>
                                        <span className="order-card__item-price">
                                            ₹{((item.price || 0) * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="order-card__footer">
                                <div className="order-card__address">
                                    {order.shippingAddress?.addressLine1 && (
                                        <span>
                                            {order.shippingAddress.addressLine1},{" "}
                                            {order.shippingAddress.city},{" "}
                                            {order.shippingAddress.state}{" "}
                                            {order.shippingAddress.postalCode}
                                        </span>
                                    )}
                                </div>

                                <div className="order-card__total">
                                    Total: ₹{Number(order.totalAmount || 0).toFixed(2)}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

            )}

        </div>
    );
};

export default MyOrders;