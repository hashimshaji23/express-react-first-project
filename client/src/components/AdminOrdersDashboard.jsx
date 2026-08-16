import { useEffect, useMemo, useState } from "react";
import API from "../api/axios.js";
import "./AdminOrdersDashboard.css";

// Adjust these to match your actual route names
const ORDERS_URL = "/api/admin/getAllorders"; // GET all orders
const ORDER_STATUS_URL = (id) => `/api/orders/${id}/status`; // PUT update status — matches orderRoutes.js

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    // Which user groups are expanded — all expanded by default once loaded
    const [expandedUsers, setExpandedUsers] = useState(new Set());

    const authHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await API.get(ORDERS_URL, authHeaders());
            const fetched = res.data.Orders || [];
            setOrders(fetched);

            // expand every user group by default on first load
            const userIds = fetched.map((o) => o.user?._id || "unknown");
            setExpandedUsers(new Set(userIds));

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
            await API.put(ORDER_STATUS_URL(orderId), { status: newStatus }, authHeaders());
        } catch (err) {
            // Roll back on failure
            setOrders(prevOrders);
            setError(err.response?.data?.message || "Failed to update order status");
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleUser = (userId) => {
        setExpandedUsers((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    // Group orders by user, newest order first within each group,
    // groups sorted by their most recent order
    const groupedByUser = useMemo(() => {
        const groups = new Map();

        orders.forEach((order) => {
            const userId = order.user?._id || "unknown";

            if (!groups.has(userId)) {
                groups.set(userId, {
                    userId,
                    name: order.user?.name || "Unknown user",
                    email: order.user?.email || "—",
                    orders: [],
                });
            }

            groups.get(userId).orders.push(order);
        });

        const groupList = Array.from(groups.values());

        groupList.forEach((group) => {
            group.orders.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
        });

        groupList.sort((a, b) => {
            const aLatest = a.orders[0]?.createdAt
                ? new Date(a.orders[0].createdAt)
                : 0;
            const bLatest = b.orders[0]?.createdAt
                ? new Date(b.orders[0].createdAt)
                : 0;
            return bLatest - aLatest;
        });

        return groupList;
    }, [orders]);

    return (
        <div className="orders-dashboard">
            <div className="orders-header">
                <div>
                    <h1 className="orders-title">Orders</h1>
                    <p className="orders-subtitle">
                        {loading
                            ? "Loading..."
                            : `${orders.length} total orders across ${groupedByUser.length} customers`}
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
                <div className="orders-groups">
                    {groupedByUser.map((group) => {
                        const isExpanded = expandedUsers.has(group.userId);
                        const groupTotal = group.orders.reduce(
                            (sum, o) => sum + (Number(o.totalAmount) || 0),
                            0
                        );

                        return (
                            <div className="user-group" key={group.userId}>

                                <button
                                    className="user-group__header"
                                    onClick={() => toggleUser(group.userId)}
                                    aria-expanded={isExpanded}
                                >
                                    <span className={`user-group__chevron ${isExpanded ? "user-group__chevron--open" : ""}`}>
                                        ▸
                                    </span>

                                    <div className="user-group__identity">
                                        <span className="user-group__name">{group.name}</span>
                                        <span className="user-group__email">{group.email}</span>
                                    </div>

                                    <span className="user-group__count">
                                        {group.orders.length} order{group.orders.length !== 1 ? "s" : ""}
                                    </span>

                                    <span className="user-group__total">
                                        ${groupTotal.toFixed(2)}
                                    </span>
                                </button>

                                {isExpanded && (
                                    <div className="orders-table-wrap">
                                        <table className="orders-table">
                                            <thead>
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Total</th>
                                                    <th>Date</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.orders.map((order) => (
                                                    <tr key={order._id}>
                                                        <td className="order-id-cell">
                                                            #{order._id.slice(-8).toUpperCase()}
                                                        </td>
                                                        <td>
                                                            {order.totalAmount != null
                                                                ? `$${Number(order.totalAmount).toFixed(2)}`
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

                                                                {order.status === "pending" && (
                                                                    <button
                                                                        className="confirm-order-btn"
                                                                        disabled={updatingId === order._id}
                                                                        onClick={() =>
                                                                            handleStatusChange(order._id, "processing")
                                                                        }
                                                                    >
                                                                        {updatingId === order._id ? "…" : "Confirm"}
                                                                    </button>
                                                                )}

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
                    })}
                </div>
            )}
        </div>
    );
}