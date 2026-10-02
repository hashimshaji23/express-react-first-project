import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { PRODUCT_CATEGORIES } from "../constants/categories";
import "./ProductManagement.css";

const PRODUCTS_LIST_URL = "/api/products"; // GET
const PRODUCT_CREATE_URL = "/api/products"; // POST
const PRODUCT_UPDATE_URL = (id) => `/api/products/${id}`; // PUT
const PRODUCT_DELETE_URL = (id) => `/api/products/${id}`; // DELETE
const PRODUCT_DELETE_IMAGE_URL = (id, publicId) =>
    `/api/products/${id}/images/${encodeURIComponent(publicId)}`; // DELETE
const PRODUCT_UPDATE_STOCK_URL = (id) => `/api/products/${id}/stock`; // PUT
const CATEGORIES_LIST_URL = "/api/categories"; // GET

const emptyForm = {
    name: "",
    description: "",
    category: "",
    customCategory: "",
    brand: "",
    price: "",
    discountPrice: "",
    stock: "",
    isActive: true,
    isFeatured: false,
};

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // "list" or "form"
    const [view, setView] = useState("list");
    const [editingId, setEditingId] = useState(null); // null = creating new
    const [editingProduct, setEditingProduct] = useState(null); // full product being edited

    const [form, setForm] = useState(emptyForm);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [deletingImageId, setDeletingImageId] = useState(null);
    const [deletingProductId, setDeletingProductId] = useState(null);

    const [stockDrafts, setStockDrafts] = useState({}); // { [productId]: "12" }
    const [savingStockId, setSavingStockId] = useState(null);

    const authHeaders = (extra = {}) => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...extra,
        },
    });

    // ---------- Load products & categories ----------

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get(PRODUCTS_LIST_URL, {
                params: { admin: "true", limit: 100 },
                ...authHeaders(),
            });
            setProducts(response.data.products || response.data || []);

        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await API.get(CATEGORIES_LIST_URL);
            setCategories(res.data.categories || []);
        } catch (err) {
            console.log("Could not load categories list", err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const categoryOptions = useMemo(() => {
        const byKey = new Map(
            PRODUCT_CATEGORIES.map((cat) => [cat.slug, cat.name])
        );

        categories.forEach((cat) => {
            const name = (cat.name || "").trim();
            if (!name) return;
            const key = (cat.slug || name).toLowerCase().replace(/\s+/g, "-");
            const already = [...byKey.entries()].some(
                ([, existingName]) => existingName.toLowerCase() === name.toLowerCase()
            );
            if (!already) byKey.set(key, name);
        });

        return [...byKey.values()];
    }, [categories]);

    // ---------- Form open/close ----------

    const openCreateForm = () => {
        setEditingId(null);
        setEditingProduct(null);
        setForm(emptyForm);
        setNewImageFiles([]);
        setFormError("");
        setView("form");
    };

    const openEditForm = (product) => {
        setEditingId(product._id);
        setEditingProduct(product);
        setForm({
            name: product.name || "",
            description: product.description || "",
            category: (() => {
                const raw = product.category?.name || product.category || "";
                const match = categories.find(
                    (c) => c._id === raw || (c.name || "").toLowerCase() === String(raw).toLowerCase()
                );
                if (match?.name) return match.name;
                if (product.category?.name) return product.category.name;
                if (raw && !/^[0-9a-fA-F]{24}$/.test(String(raw))) return raw;
                return "";
            })(),
            customCategory: "",
            brand: product.brand || "",
            price: product.price ?? "",
            discountPrice: product.discountPrice ?? "",
            stock: product.stock ?? "",
            isActive: product.isActive ?? true,
            isFeatured: product.isFeatured ?? false,
        });
        setNewImageFiles([]);
        setFormError("");
        setView("form");
    };

    const closeForm = () => {
        setView("list");
        setEditingId(null);
        setEditingProduct(null);
    };

    // ---------- Form field handlers ----------

    const handleFieldChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleNewImagesChange = (e) => {
        setNewImageFiles(Array.from(e.target.files || []));
    };

    const removeStagedFile = (index) => {
        setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // ---------- Create / Update submit ----------

    const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ""));

    const findCategoryByName = (list, name) => {
        const needle = String(name || "").trim().toLowerCase();
        if (!needle) return null;
        return list.find((cat) => {
            const catName = (cat.name || "").trim().toLowerCase();
            const catSlug = (cat.slug || "").trim().toLowerCase();
            return catName === needle || catSlug === needle;
        }) || null;
    };

    const resolveCategoryId = async () => {
        const selected = form.category === "custom"
            ? form.customCategory.trim()
            : String(form.category || "").trim();

        if (isObjectId(selected)) return selected;

        const name = selected || "General";
        const existing = findCategoryByName(categories, name);
        if (existing?._id) return existing._id;

        try {
            const categoryFd = new FormData();
            categoryFd.append("name", name);
            const res = await API.post(CATEGORIES_LIST_URL, categoryFd, authHeaders());
            const created = res.data.category;
            if (created?._id) {
                setCategories((prev) => {
                    if (prev.some((c) => c._id === created._id)) return prev;
                    return [...prev, created].sort((a, b) =>
                        String(a.name || "").localeCompare(String(b.name || ""))
                    );
                });
                return created._id;
            }
        } catch (err) {
            const alreadyExists = err.response?.status === 400
                || /already exists/i.test(err.response?.data?.message || "");
            if (!alreadyExists) throw err;
        }

        const listRes = await API.get(CATEGORIES_LIST_URL);
        const latest = listRes.data.categories || [];
        setCategories(latest);
        const found = findCategoryByName(latest, name);
        if (found?._id) return found._id;

        throw new Error("Could not resolve product category");
    };

    const buildFormData = (categoryId) => {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("category", categoryId);

        fd.append("brand", form.brand);
        fd.append("price", form.price);

        if (form.discountPrice !== "" && form.discountPrice !== null) {
            fd.append("discountPrice", form.discountPrice);
        }

        fd.append("stock", form.stock);
        fd.append("isActive", form.isActive);
        fd.append("isFeatured", form.isFeatured);

        // Append image files
        newImageFiles.forEach((file) => {
            fd.append("image", file);
        });

        return fd;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim() || !form.price) {
            setFormError("Product name and price are required.");
            return;
        }

        setSaving(true);
        setFormError("");

        try {
            const categoryId = await resolveCategoryId();
            const fd = buildFormData(categoryId);

            if (editingId) {
                await API.put(
                    PRODUCT_UPDATE_URL(editingId),
                    fd,
                    authHeaders()
                );
            } else {
                await API.post(
                    PRODUCT_CREATE_URL,
                    fd,
                    authHeaders()
                );
            }

            await fetchProducts();
            await fetchCategories();
            closeForm();

        } catch (err) {
            console.log(err);
            setFormError(err.response?.data?.message || err.message || "Failed to save product");
        } finally {
            setSaving(false);
        }
    };

    // ---------- Delete an existing image (edit mode only) ----------

    const handleDeleteImage = async (publicId) => {
        if (!editingId) return;

        setDeletingImageId(publicId);

        try {
            const response = await API.delete(
                PRODUCT_DELETE_IMAGE_URL(editingId, publicId),
                authHeaders()
            );

            const updatedProduct = response.data.product;
            setEditingProduct(updatedProduct);

        } catch (err) {
            console.log(err);
            setFormError(err.response?.data?.message || "Failed to delete image");
        } finally {
            setDeletingImageId(null);
        }
    };

    // ---------- Delete product ----------

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Delete this product? This can't be undone.")) return;

        setDeletingProductId(productId);

        try {
            await API.delete(PRODUCT_DELETE_URL(productId), authHeaders());
            setProducts((prev) => prev.filter((p) => p._id !== productId));

        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Failed to delete product");
        } finally {
            setDeletingProductId(null);
        }
    };

    // ---------- Quick stock update from the list ----------

    const handleStockDraftChange = (productId, value) => {
        setStockDrafts((prev) => ({ ...prev, [productId]: value }));
    };

    const handleStockSave = async (productId) => {
        const draft = stockDrafts[productId];
        if (draft === undefined || draft === "") return;

        setSavingStockId(productId);

        try {
            const response = await API.put(
                PRODUCT_UPDATE_STOCK_URL(productId),
                { stock: Number(draft) },
                authHeaders()
            );

            const updated = response.data.product;
            setProducts((prev) =>
                prev.map((p) => (p._id === productId ? updated : p))
            );
            setStockDrafts((prev) => {
                const next = { ...prev };
                delete next[productId];
                return next;
            });

        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Failed to update stock");
        } finally {
            setSavingStockId(null);
        }
    };

    // ==========================================================
    // Render
    // ==========================================================

    return (
        <div className="pm-page">

            <div className="pm-header">
                <div>
                    <h1>Products</h1>
                    <p>{loading ? "Loading..." : `${products.length} products total`}</p>
                </div>

                {view === "list" && (
                    <button className="pm-btn pm-btn--primary" onClick={openCreateForm}>
                        + Add Product
                    </button>
                )}
            </div>

            {error && <div className="pm-alert">{error}</div>}

            {view === "list" ? (
                loading ? (
                    <div className="pm-empty">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="pm-empty">
                        <p>No products available yet.</p>
                        <button className="pm-btn pm-btn--primary" onClick={openCreateForm}>
                            Add your first product
                        </button>
                    </div>
                ) : (
                    <div className="pm-table-wrap">
                        <table className="pm-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Brand</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id}>
                                        <td className="pm-product-cell">
                                            <img
                                                src={
                                                    product.image ||
                                                    product.images?.[0]?.url ||
                                                    "https://via.placeholder.com/44"
                                                }
                                                alt={product.name}
                                            />
                                            <span>{product.name}</span>
                                        </td>
                                        <td>{product.brand || "—"}</td>
                                        <td>{product.category?.name || "General"}</td>
                                        <td className="pm-mono">
                                            ₹{Number(product.price).toFixed(2)}
                                        </td>
                                        <td>
                                            <div className="pm-stock-cell">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="pm-stock-input"
                                                    value={
                                                        stockDrafts[product._id] !== undefined
                                                            ? stockDrafts[product._id]
                                                            : product.stock
                                                    }
                                                    onChange={(e) =>
                                                        handleStockDraftChange(product._id, e.target.value)
                                                    }
                                                />
                                                {stockDrafts[product._id] !== undefined &&
                                                    Number(stockDrafts[product._id]) !== product.stock && (
                                                        <button
                                                            className="pm-stock-save"
                                                            disabled={savingStockId === product._id}
                                                            onClick={() => handleStockSave(product._id)}
                                                        >
                                                            {savingStockId === product._id ? "…" : "Save"}
                                                        </button>
                                                    )}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`pm-status ${product.isActive ? "pm-status--active" : "pm-status--inactive"
                                                    }`}
                                            >
                                                {product.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="pm-actions-cell">
                                            <button
                                                className="pm-icon-btn"
                                                onClick={() => openEditForm(product)}
                                                aria-label="Edit product"
                                                title="Edit Product"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="pm-icon-btn pm-icon-btn--danger"
                                                disabled={deletingProductId === product._id}
                                                onClick={() => handleDeleteProduct(product._id)}
                                                aria-label="Delete product"
                                                title="Delete Product"
                                            >
                                                {deletingProductId === product._id ? "…" : "🗑️"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (

                // ---------- Create / Edit form ----------
                <form className="pm-form" onSubmit={handleSubmit}>

                    <div className="pm-form-header">
                        <h2>{editingId ? "Edit Product" : "Create New Product"}</h2>
                        <button type="button" className="pm-btn" onClick={closeForm}>
                            Cancel
                        </button>
                    </div>

                    {formError && <div className="pm-alert">{formError}</div>}

                    <div className="pm-form-grid">

                        <div className="pm-field pm-field--full">
                            <label>Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleFieldChange}
                                placeholder="e.g. Wireless Headphones"
                                required
                            />
                        </div>

                        <div className="pm-field pm-field--full">
                            <label>Description *</label>
                            <textarea
                                name="description"
                                rows={4}
                                value={form.description}
                                onChange={handleFieldChange}
                                placeholder="Enter detailed product description..."
                                required
                            />
                        </div>

                        <div className="pm-field">
                            <label>Category</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleFieldChange}
                            >
                                <option value="">Select Category (Default: General)</option>
                                {categoryOptions.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                                <option value="custom">+ Create New Category Name</option>
                            </select>
                        </div>

                        {form.category === "custom" && (
                            <div className="pm-field">
                                <label>New Category Name</label>
                                <input
                                    type="text"
                                    name="customCategory"
                                    value={form.customCategory}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. Electronics, Footwear"
                                />
                            </div>
                        )}

                        <div className="pm-field">
                            <label>Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={form.brand}
                                onChange={handleFieldChange}
                                placeholder="e.g. Sony, Nike"
                            />
                        </div>

                        <div className="pm-field">
                            <label>Price (₹) *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="price"
                                value={form.price}
                                onChange={handleFieldChange}
                                placeholder="999.00"
                                required
                            />
                        </div>

                        <div className="pm-field">
                            <label>Discount Price (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="discountPrice"
                                value={form.discountPrice}
                                onChange={handleFieldChange}
                                placeholder="Optional discounted price"
                            />
                        </div>

                        <div className="pm-field">
                            <label>Initial Stock *</label>
                            <input
                                type="number"
                                min="0"
                                name="stock"
                                value={form.stock}
                                onChange={handleFieldChange}
                                placeholder="10"
                                required
                            />
                        </div>

                        <div className="pm-field pm-field--checkboxes">
                            <label className="pm-checkbox">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={form.isActive}
                                    onChange={handleFieldChange}
                                />
                                Active (visible to customers)
                            </label>

                            <label className="pm-checkbox">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={form.isFeatured}
                                    onChange={handleFieldChange}
                                />
                                Featured Product
                            </label>
                        </div>

                        {/* Existing images — only shown when editing */}
                        {editingId && editingProduct?.images?.length > 0 && (
                            <div className="pm-field pm-field--full">
                                <label>Current Images</label>
                                <div className="pm-image-grid">
                                    {editingProduct.images.map((img) => (
                                        <div className="pm-image-tile" key={img.public_id}>
                                            <img src={img.url} alt="" />
                                            <button
                                                type="button"
                                                className="pm-image-remove"
                                                disabled={deletingImageId === img.public_id}
                                                onClick={() => handleDeleteImage(img.public_id)}
                                                aria-label="Delete image"
                                            >
                                                {deletingImageId === img.public_id ? "…" : "×"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pm-field pm-field--full">
                            <label>{editingId ? "Add More Images" : "Product Images"}</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleNewImagesChange}
                            />

                            {newImageFiles.length > 0 && (
                                <div className="pm-image-grid pm-image-grid--staged">
                                    {newImageFiles.map((file, index) => (
                                        <div className="pm-image-tile" key={index}>
                                            <img src={URL.createObjectURL(file)} alt="" />
                                            <button
                                                type="button"
                                                className="pm-image-remove"
                                                onClick={() => removeStagedFile(index)}
                                                aria-label="Remove staged image"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="pm-btn pm-btn--primary pm-form-submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving Product..."
                            : editingId
                                ? "Save Changes"
                                : "Create Product"}
                    </button>

                </form>
            )}

        </div>
    );
};

export default ProductManagement;