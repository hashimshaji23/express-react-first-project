import React, { useEffect, useState } from "react";
import axios from "../api/axios.js";
import "./Product.css";
import API from "../api/axios";

const Product = () => {
    const [products, setProducts] = useState([]);

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
            setTotalPages(response.data.totalPages);

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

    // Show a small toast message for a couple seconds
    const flashMessage = (text) => {
        setCartMessage(text);
        setTimeout(() => setCartMessage(""), 2000);
    };

    // Add to cart — called when the 🛒 button is clicked
    const handleAddToCart = async (productId) => {
        // avoid double-clicks while a request for this product is in flight
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
                "/api/cart/",
                { productId, quantity: 1 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAddedIds((prev) => new Set(prev).add(productId));
            flashMessage(response.data?.message || "Added to cart");

            // revert the "added" checkmark back to the cart icon after a bit
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
                    <h1>Explore Products</h1>
                    <p>Find the perfect products for you</p>
                </div>

                <div className="product-count">
                    {products.length} Products
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
                            <option value="electronics">
                                Electronics
                            </option>
                            <option value="fashion">
                                Fashion
                            </option>
                            <option value="shoes">
                                Shoes
                            </option>
                            <option value="accessories">
                                Accessories
                            </option>
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
                        <label>Price Range</label>

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

                {/* ================= PRODUCTS ================= */}
                <main className="products-section">

                    {/* Sort */}
                    <div className="products-top">

                        <p>
                            {loading
                                ? "Loading..."
                                : `Showing ${products.length} products`}
                        </p>

                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">
                                Sort By
                            </option>

                            <option value="newest">
                                Newest
                            </option>

                            <option value="price_asc">
                                Price: Low to High
                            </option>

                            <option value="price_desc">
                                Price: High to Low
                            </option>

                            <option value="rating">
                                Highest Rated
                            </option>
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
                            <p>
                                Try changing your filters or search.
                            </p>

                            <button onClick={clearFilters}>
                                Clear Filters
                            </button>
                        </div>

                    ) : (

                        <div className="product-grid">

                            {products.map((product) => (

                                <div
                                    className="product-card"
                                    key={product._id}
                                >

                                    {/* Image */}
                                    <div className="product-image">

                                        <img
                                            src={
                                                product.image ||
                                                product.images?.[0] ||
                                                "https://via.placeholder.com/400"
                                            }
                                            alt={product.name}
                                        />

                                        <button className="wishlist">
                                            ♡
                                        </button>

                                    </div>

                                    {/* Product Info */}
                                    <div className="product-info">

                                        <span className="product-brand">
                                            {product.brand}
                                        </span>

                                        <h3>
                                            {product.name}
                                        </h3>

                                        <div className="rating">

                                            <span>
                                                ⭐
                                            </span>

                                            <strong>
                                                {product.ratingsAverage
                                                    ? product.ratingsAverage.toFixed(1)
                                                    : "0.0"}
                                            </strong>

                                            <span className="review-count">
                                                ({product.ratingsQuantity || 0})
                                            </span>

                                        </div>

                                        <div className="product-bottom">

                                            <span className="price">
                                                ₹{product.price}
                                            </span>

                                            <button
                                                className={`cart-btn ${addedIds.has(product._id)
                                                        ? "cart-btn--added"
                                                        : ""
                                                    }`}
                                                disabled={addingIds.has(product._id)}
                                                onClick={() =>
                                                    handleAddToCart(product._id)
                                                }
                                                aria-label="Add to cart"
                                            >
                                                {addingIds.has(product._id)
                                                    ? "…"
                                                    : addedIds.has(product._id)
                                                        ? "✅"
                                                        : "🛒"}
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                    {/* Pagination */}
                    {!loading && products.length > 0 && (
                        <div className="pagination">

                            <button
                                disabled={page === 1}
                                onClick={() =>
                                    setPage(page - 1)
                                }
                            >
                                ←
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
                                    onClick={() =>
                                        setPage(pageNumber)
                                    }
                                >
                                    {pageNumber}
                                </button>

                            ))}

                            <button
                                disabled={page === totalPages}
                                onClick={() =>
                                    setPage(page + 1)
                                }
                            >
                                →
                            </button>

                        </div>
                    )}

                </main>

            </div>
        </div>
    );
};

export default Product;