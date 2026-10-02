import Product from "../model/Product.js";
import Category from "../model/Category.js";
import { slugify } from "../utils/slugify.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveCategoryId = async (category) => {
    const raw = Array.isArray(category) ? category[0] : category;
    const value = raw == null ? "" : String(raw).trim();

    if (OBJECT_ID_RE.test(value)) {
        const byId = await Category.findById(value);
        if (byId) return byId._id;
    }

    const catName = !value || value === "custom" ? "General" : value;
    const catSlug = slugify(catName);

    let catDoc = await Category.findOne({
        $or: [
            { slug: catSlug },
            { name: new RegExp(`^${escapeRegex(catName)}$`, "i") },
        ],
    });

    if (!catDoc) {
        try {
            catDoc = await Category.create({ name: catName, slug: catSlug });
        } catch (err) {
            catDoc = await Category.findOne({ slug: catSlug });
            if (!catDoc) throw err;
        }
    }

    return catDoc._id;
};

// @desc  Create product (admin)
export const createProduct = async (req, res, next) => {
    try {
        const {
            name, description, category,
            brand, price, discountPrice, stock,
            isActive, isFeatured,
        } = req.body;

        if (!name || !price) {
            return res.status(400).json({ success: false, message: "Name and price are required" });
        }

        const slug = slugify(name);
        const categoryId = await resolveCategoryId(category);

        // Upload all images (req.files from multer.array)
        let images = [];
        if (req.files && req.files.length > 0) {
            try {
                const uploads = await Promise.all(
                    req.files.map((file) => uploadBufferToCloudinary(file.buffer, "products"))
                );
                images = uploads.map((r) => ({ url: r.secure_url, public_id: r.public_id }));
            } catch (imgError) {
                console.error("Image upload to Cloudinary failed:", imgError.message || imgError);
            }
        }

        const productData = {
            name,
            slug,
            description: description || "No description provided",
            category: categoryId,
            brand: brand || "",
            price: Number(price),
            stock: stock !== undefined && stock !== "" ? Number(stock) : 0,
            images,
            isActive: isActive !== undefined ? String(isActive) === "true" || isActive === true : true,
            isFeatured: isFeatured !== undefined ? String(isFeatured) === "true" || isFeatured === true : false,
        };

        if (discountPrice !== undefined && discountPrice !== "" && discountPrice !== null) {
            productData.discountPrice = Number(discountPrice);
        }

        const product = await Product.create(productData);

        res.status(201).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};


export const getProducts = async (req, res, next) => {
    try {
        const {
            keyword, category, brand,
            minPrice, maxPrice, minRating,
            sort, page = 1, limit = 12, admin,
        } = req.query;

        // If admin parameter is passed as "true", show both active and inactive products
        const filter = admin === "true" ? {} : { isActive: true };

        if (keyword) filter.$text = { $search: keyword };

        if (category) {
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
            const categoryDoc = isObjectId
                ? await Category.findById(category)
                : await Category.findOne({ slug: category });

            if (!categoryDoc) {
                return res.status(200).json({
                    success: true,
                    count: 0,
                    total: 0,
                    totalPages: 0,
                    currentPage: Number(page),
                    products: [],
                });
            }

            filter.category = categoryDoc._id;
        }

        if (brand) filter.brand = brand;
        if (minRating) filter.ratingsAverage = { $gte: Number(minRating) };
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort === "price_asc") sortOption = { price: 1 };
        if (sort === "price_desc") sortOption = { price: -1 };
        if (sort === "rating") sortOption = { ratingsAverage: -1 };
        if (sort === "newest") sortOption = { createdAt: -1 };

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("category", "name slug")
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit)),
            Product.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            products,
        });
    } catch (error) {
        next(error);
    }
};


export const getProduct = async (req, res, next) => {
    try {
        const { idOrSlug } = req.params;
        const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
            ? { _id: idOrSlug }
            : { slug: idOrSlug };

        const product = await Product.findOne(query)
            .populate("category", "name slug")

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};


export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const fields = [
            "name", "description",
            "brand", "price", "discountPrice", "stock", "isActive", "isFeatured",
        ];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) product[field] = req.body[field];
        });

        if (req.body.category !== undefined) {
            product.category = await resolveCategoryId(req.body.category);
        }

        if (req.body.name) product.slug = slugify(req.body.name);

        // Append new images if provided (doesn't remove existing ones automatically)
        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map((file) => uploadBufferToCloudinary(file.buffer, "products"))
            );
            const newImages = uploads.map((r) => ({ url: r.secure_url, public_id: r.public_id }));
            product.images.push(...newImages);
        }

        await product.save();
        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};


const decodePublicId = (value) => {
    const raw = Array.isArray(value) ? value.join("/") : value;
    if (!raw) return "";
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
};

export const deleteProductImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const publicId = decodePublicId(req.params.publicId);
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        await deleteFromCloudinary(publicId);
        product.images = product.images.filter((img) => img.public_id !== publicId);
        await product.save();

        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};


export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        await Promise.all(
            product.images.map((img) => deleteFromCloudinary(img.public_id))
        );

        await product.deleteOne();
        res.status(200).json({ success: true, message: "Product deleted" });
    } catch (error) {
        next(error);
    }
};


export const updateStock = async (req, res, next) => {
    try {
        const { stock } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { stock },
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

// @desc  Low stock / out of stock products (admin inventory alerts)
// export const getInventoryAlerts = async (req, res, next) => {
//     try {
//         const lowStock = await Product.find({ stock: { $gt: 0, $lte: 5 } });
//         const outOfStock = await Product.find({ stock: 0 });
//         res.status(200).json({ success: true, lowStock, outOfStock });
//     } catch (error) {
//         next(error);
//     }
// };