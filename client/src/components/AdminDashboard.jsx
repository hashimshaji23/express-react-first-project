import React, { useState } from "react";
import AdminOrdersDashboard from "./AdminOrdersDashboard";
import ProductManagement from "./ProductManagement";
import "./AdminDashboard.css";

const TABS = [
    { id: "orders", label: "Orders" },
    { id: "products", label: "Products" },
];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("orders");

    return (
        <div className="admin-dashboard">

            <div className="admin-dashboard__topbar">
                <h1>Admin</h1>

                <div className="admin-dashboard__tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            className={`admin-dashboard__tab ${activeTab === tab.id ? "admin-dashboard__tab--active" : ""
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-dashboard__content">
                {activeTab === "orders" && <AdminOrdersDashboard />}
                {activeTab === "products" && <ProductManagement />}
            </div>

        </div>
    );
};

export default AdminDashboard;