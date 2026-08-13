import { useEffect, useState } from "react";
import API from "../api/axios.js"; 
import "./AdminOrdersDashboard.css";

// Adjust these to match your actual route names
const ORDERS_URL = "/api/admin/getAllorders"; // GET all orders
const ORDER_STATUS_URL = (id) => `/api/admin/update-Order-status/${id}`; // PUT update status

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await API.get(ORDERS_URL);
            setOrders(res.data.Orders || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        setError("");

        // Optimistic update
        const prevOrders = orders;
        setOrders((prev) =>
            prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );

        try {
            await API.put(ORDER_STATUS_URL(orderId), { status: newStatus });
        } catch (err) {
            // Roll back on failure
            setOrders(prevOrders);
            setError(err.response?.data?.message || "Failed to update order status");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="orders-dashboard">
            <div className="orders-header">
                <div>
                    <h1 className="orders-title">Orders</h1>
                    <p className="orders-subtitle">
                        {loading ? "Loading..." : `${orders.length} total orders`}
                    </p>
                </div>
                <button className="refresh-btn" onClick={fetchOrders} disabled={loading}>
                    Refresh
                </button>
            </div>

            {error && <div className="orders-alert">{error}</div>}

            {loading ? (
                <div className="orders-empty">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="orders-empty">No orders found.</div>
            ) : (
                <div className="orders-table-wrap">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="order-id-cell">
                                        #{order._id.slice(-8).toUpperCase()}
                                    </td>
                                    <td>{order.user?.name || "—"}</td>
                                    <td>{order.user?.email || "—"}</td>
                                    <td>
                                        {order.totalPrice != null
                                            ? `$${Number(order.totalPrice).toFixed(2)}`
                                            : "—"}
                                    </td>
                                    <td>
                                        {order.createdAt
                                            ? new Date(order.createdAt).toLocaleDateString()
                                            : "—"}
                                    </td>
                                    <td>
                                        <div className="status-cell">
                                            <span className={`status-badge status-${order.status}`}>
                                                {order.status}
                                            </span>
                                            <select
                                                className="status-select"
                                                value={order.status}
                                                disabled={updatingId === order._id}
                                                onChange={(e) =>
                                                    handleStatusChange(order._id, e.target.value)
                                                }
                                            >
                                                {STATUS_OPTIONS.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}