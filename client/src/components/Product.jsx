import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Product.css";
import API from "../api/axios";
import { PRODUCT_CATEGORIES } from "../constants/categories";

const Product = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minRating, setMinRating] = useState("");
    const [sort, setSort] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Single Product View modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [modalQty, setModalQty] = useState(1);

    // Tracks which product ids are currently being added, and which were just added
    const [addingIds, setAddingIds] = useState(new Set());
    const [addedIds, setAddedIds] = useState(new Set());
    const [cartMessage, setCartMessage] = useState(""); // small toast text

    const limit = 12;

    // Fetch products
    const getProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get(
                "/api/products",
                {
                    params: {
                        keyword,
                        category,
                        brand,
                        minPrice,
                        maxPrice,
                        minRating,
                        sort,
                        page,
                        limit,
                    },
                }
            );

            setProducts(response.data.products);
            setTotalPages(response.data.totalPages || 1);

        } catch (error) {
            console.log(error);
            setError("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    // Fetch whenever filters/page change
    useEffect(() => {
        getProducts();
    }, [
        keyword,
        category,
        brand,
        minPrice,
        maxPrice,
        minRating,
        sort,
        page,
    ]);

    // Fetch cart item count once
    const getCartCount = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await API.get("/api/cart", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const items = response.data.cart || [];
            setCartCount(items.length);

        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getCartCount();
    }, []);

    // Reset filters
    const clearFilters = () => {
        setKeyword("");
        setCategory("");
        setBrand("");
        setMinPrice("");
        setMaxPrice("");
        setMinRating("");
        setSort("");
        setPage(1);
    };

    // Show toast message
    const flashMessage = (text) => {
        setCartMessage(text);
        setTimeout(() => setCartMessage(""), 2500);
    };

    // Single product modal handlers
    const openProductModal = (product) => {
        setSelectedProduct(product);
        const mainImg = product.image || product.images?.[0]?.url || "https://via.placeholder.com/400";
        setSelectedImage(mainImg);
        setModalQty(1);
    };

    const closeProductModal = () => {
        setSelectedProduct(null);
    };

    // Add to cart
    const handleAddToCart = async (productId, quantity = 1, e) => {
        if (e) e.stopPropagation();

        if (addingIds.has(productId)) return;

        setAddingIds((prev) => new Set(prev).add(productId));

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                flashMessage("Please log in to add items to cart");
                setAddingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(productId);
                    return next;
                });
                return;
            }

            const response = await API.post(
                "/api/cart",
                { productId, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAddedIds((prev) => new Set(prev).add(productId));
            const serverMessage = response.data?.message || "Added to cart";
            flashMessage(serverMessage);

            if (serverMessage === "Product added to cart") {
                setCartCount((prev) => prev + 1);
            }

            setTimeout(() => {
                setAddedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(productId);
                    return next;
                });
            }, 1500);

        } catch (error) {
            console.log(error);
            const message =
                error.response?.data?.message ||
                "Failed to add product to cart";
            flashMessage(message);
        } finally {
            setAddingIds((prev) => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
        }
    };

    return (
        <div className="product-page">

            {/* Header */}
            <div className="product-header">
                <div>
                    <h1>Discover Something You’ll Love</h1>
                    <p>Shop quality products at great prices.</p>
                </div>

                <div className="product-header__right">
                    <div className="product-count">
                        {products.length} Products
                    </div>

                    <button
                        className="view-cart-btn"
                        onClick={() => navigate("/Tocart")}
                        aria-label="View cart"
                    >
                        🛒
                        {cartCount > 0 && (
                            <span className="view-cart-btn__badge">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Cart toast */}
            {cartMessage && (
                <div className="cart-toast">
                    {cartMessage}
                </div>
            )}

            <div className="product-layout">

                {/* ================= FILTER SIDEBAR ================= */}
                <aside className="filter-sidebar">

                    <div className="filter-title">
                        <h2>Filters</h2>

                        <button onClick={clearFilters}>
                            Clear All
                        </button>
                    </div>

                    {/* Search */}
                    <div className="filter-group">
                        <label>Search</label>

                        <div className="search-box">
                            <span>🔍</span>

                            <input
                                type="text"
                                placeholder="Search products..."
                                value={keyword}
                                onChange={(e) => {
                                    setKeyword(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="filter-group">
                        <label>Category</label>

                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Categories</option>
                            {PRODUCT_CATEGORIES.map((cat) => (
                                <option key={cat.slug} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Brand */}
                    <div className="filter-group">
                        <label>Brand</label>

                        <input
                            type="text"
                            placeholder="Enter brand"
                            value={brand}
                            onChange={(e) => {
                                setBrand(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    {/* Price */}
                    <div className="filter-group">
                        <label>Price Range (₹)</label>

                        <div className="price-inputs">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => {
                                    setMinPrice(e.target.value);
                                    setPage(1);
                                }}
                            />

                            <span>—</span>

                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => {
                                    setMaxPrice(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="filter-group">
                        <label>Minimum Rating</label>

                        <select
                            value={minRating}
                            onChange={(e) => {
                                setMinRating(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">Any Rating</option>
                            <option value="4">4 ⭐ & above</option>
                            <option value="3">3 ⭐ & above</option>
                            <option value="2">2 ⭐ & above</option>
                            <option value="1">1 ⭐ & above</option>
                        </select>
                    </div>

                </aside>

                {/* ================= PRODUCTS GRID ================= */}
                <main className="products-section">

                    {/* Sort */}
                    <div className="products-top">
                        <p>
                            {loading
                                ? "Loading products..."
                                : `Showing ${products.length} products`}
                        </p>

                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">Sort By: Default</option>
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                            <p>Loading products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="no-products">
                            <div>🛍️</div>
                            <h2>No Products Found</h2>
                            <p>Try adjusting your search query or filters.</p>
                            <button onClick={clearFilters}>
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {products.map((product) => {
                                const mainImage =
                                    product.image ||
                                    product.images?.[0]?.url ||
                                    "https://via.placeholder.com/400";

                                const displayPrice = product.discountPrice && product.discountPrice < product.price
                                    ? product.discountPrice
                                    : product.price;

                                const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                                const discountPct = hasDiscount
                                    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                                    : 0;

                                return (
                                    <div
                                        className="product-card"
                                        key={product._id}
                                        onClick={() => openProductModal(product)}
                                    >
                                        {/* Image Box */}
                                        <div className="product-image">
                                            <img
                                                src={mainImage}
                                                alt={product.name}
                                            />

                                            {hasDiscount && (
                                                <span className="product-badge-discount">
                                                    {discountPct}% OFF
                                                </span>
                                            )}

                                            <div className="product-image-overlay">
                                                <button
                                                    className="quick-view-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openProductModal(product);
                                                    }}
                                                >
                                                    👁 Quick View
                                                </button>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="product-info">
                                            <div className="product-meta">
                                                {product.brand && (
                                                    <span className="product-brand">
                                                        {product.brand}
                                                    </span>
                                                )}
                                                {product.category?.name && (
                                                    <span className="product-cat-tag">
                                                        {product.category.name}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="product-title" title={product.name}>
                                                {product.name}
                                            </h3>

                                            {/* Description preview */}
                                            <p className="product-description-preview">
                                                {product.description
                                                    ? product.description
                                                    : "High quality product with premium features."}
                                            </p>

                                            {/* Rating */}
                                            <div className="rating">
                                                <span>⭐</span>
                                                <strong>
                                                    {product.ratingsAverage
                                                        ? product.ratingsAverage.toFixed(1)
                                                        : "0.0"}
                                                </strong>
                                                <span className="review-count">
                                                    ({product.numReviews || product.ratingsQuantity || 0})
                                                </span>
                                            </div>

                                            {/* Pricing & Cart Action */}
                                            <div className="product-bottom">
                                                <div className="price-container">
                                                    <span className="price-current">
                                                        ₹{displayPrice}
                                                    </span>
                                                    {hasDiscount && (
                                                        <span className="price-original">
                                                            ₹{product.price}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    className={`cart-btn ${addedIds.has(product._id) ? "cart-btn--added" : ""}`}
                                                    disabled={addingIds.has(product._id) || product.stock === 0}
                                                    onClick={(e) => handleAddToCart(product._id, 1, e)}
                                                    aria-label="Add to cart"
                                                    title={product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                                                >
                                                    {addingIds.has(product._id)
                                                        ? "…"
                                                        : addedIds.has(product._id)
                                                            ? "✅"
                                                            : product.stock === 0
                                                                ? "🚫"
                                                                : "🛒"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && products.length > 0 && totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                ← Prev
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1
                            ).map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    className={
                                        page === pageNumber
                                            ? "active-page"
                                            : ""
                                    }
                                    onClick={() => setPage(pageNumber)}
                                >
                                    {pageNumber}
                                </button>
                            ))}

                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next →
                            </button>
                        </div>
                    )}

                </main>
            </div>

            {/* ================= SINGLE PRODUCT VIEW MODAL ================= */}
            {selectedProduct && (
                <div className="product-modal-overlay" onClick={closeProductModal}>
                    <div
                        className="product-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="product-modal-close"
                            onClick={closeProductModal}
                            aria-label="Close product view"
                        >
                            ✕
                        </button>

                        <div className="product-modal-grid">
                            {/* Left: Product Images */}
                            <div className="product-modal-gallery">
                                <div className="product-modal-main-image">
                                    <img src={selectedImage} alt={selectedProduct.name} />
                                </div>

                                {selectedProduct.images && selectedProduct.images.length > 1 && (
                                    <div className="product-modal-thumbnails">
                                        {selectedProduct.images.map((imgObj, idx) => {
                                            const url = imgObj.url || imgObj;
                                            return (
                                                <button
                                                    key={idx}
                                                    className={`thumbnail-btn ${selectedImage === url ? "active" : ""}`}
                                                    onClick={() => setSelectedImage(url)}
                                                >
                                                    <img src={url} alt={`${selectedProduct.name} ${idx + 1}`} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Right: Detailed Info */}
                            <div className="product-modal-details">
                                <div className="product-modal-meta">
                                    {selectedProduct.brand && (
                                        <span className="product-modal-brand">
                                            {selectedProduct.brand}
                                        </span>
                                    )}
                                    {selectedProduct.category?.name && (
                                        <span className="product-modal-category">
                                            {selectedProduct.category.name}
                                        </span>
                                    )}
                                </div>

                                <h2 className="product-modal-title">{selectedProduct.name}</h2>

                                <div className="product-modal-rating">
                                    <span className="stars">⭐ {selectedProduct.ratingsAverage ? selectedProduct.ratingsAverage.toFixed(1) : "0.0"}</span>
                                    <span className="count">({selectedProduct.numReviews || selectedProduct.ratingsQuantity || 0} customer reviews)</span>
                                </div>

                                <div className="product-modal-pricing">
                                    <span className="current-price">
                                        ₹{selectedProduct.discountPrice && selectedProduct.discountPrice < selectedProduct.price
                                            ? selectedProduct.discountPrice
                                            : selectedProduct.price}
                                    </span>
                                    {selectedProduct.discountPrice && selectedProduct.discountPrice < selectedProduct.price && (
                                        <>
                                            <span className="original-price">₹{selectedProduct.price}</span>
                                            <span className="discount-badge">
                                                {Math.round(((selectedProduct.price - selectedProduct.discountPrice) / selectedProduct.price) * 100)}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="product-modal-stock">
                                    {selectedProduct.stock > 0 ? (
                                        <span className="stock-badge in-stock">
                                            ✓ In Stock ({selectedProduct.stock} units left)
                                        </span>
                                    ) : (
                                        <span className="stock-badge out-of-stock">
                                            ✕ Out of Stock
                                        </span>
                                    )}
                                </div>

                                <div className="product-modal-description">
                                    <h4>Product Description</h4>
                                    <p>
                                        {selectedProduct.description ||
                                            "No detailed description provided for this product."}
                                    </p>
                                </div>

                                <div className="product-modal-actions">
                                    <div className="quantity-selector">
                                        <label>Qty:</label>
                                        <button
                                            disabled={modalQty <= 1}
                                            onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                                        >
                                            -
                                        </button>
                                        <span className="qty-number">{modalQty}</span>
                                        <button
                                            disabled={selectedProduct.stock > 0 && modalQty >= selectedProduct.stock}
                                            onClick={() => setModalQty((q) => q + 1)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        className="product-modal-cart-btn"
                                        disabled={selectedProduct.stock === 0 || addingIds.has(selectedProduct._id)}
                                        onClick={(e) => handleAddToCart(selectedProduct._id, modalQty, e)}
                                    >
                                        {addingIds.has(selectedProduct._id)
                                            ? "Adding to Cart..."
                                            : addedIds.has(selectedProduct._id)
                                                ? "✅ Added to Cart"
                                                : "🛒 Add to Cart"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Product;