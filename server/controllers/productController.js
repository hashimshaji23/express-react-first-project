import Product from "../model/Product.js";
import { slugify } from "../utils/slugify.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

// @desc  Create product (admin)
export const createProduct = async (req, res, next) => {
    try {
        const {
            name, description, category,
            brand, price, discountPrice, stock,
        } = req.body;

        const slug = slugify(name);

        // Upload all images (req.files from multer.array)
        let images = [];
        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map((file) => uploadBufferToCloudinary(file.buffer, "products"))
            );
            // images = uploads.map((r) => ({ url: r.secure_url, public_id: r.public_id }));
        }

        const product = await Product.create({
            name, slug, description, category,
            brand, price, discountPrice, stock, images,
        });

        res.status(201).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

// @desc  Get all products (public) - with search, filter, sort, pagination
export const getProducts = async (req, res, next) => {
    try {
        const {
            keyword, category, brand,
            minPrice, maxPrice, minRating,
            sort, page = 1, limit = 12,
        } = req.query;

        const filter = { isActive: true };

        if (keyword) filter.$text = { $search: keyword };
        if (category) filter.category = category;
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

// @desc  Get single product by slug or id
export const getProduct = async (req, res, next) => {
    try {
        const { idOrSlug } = req.params;
        const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
            ? { _id: idOrSlug }
            : { slug: idOrSlug };

        const product = await Product.findOne(query)
            .populate("category", "name slug")
            .populate("subCategory", "name slug");

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

// @desc  Update product (admin)
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const fields = [
            "name", "description", "category", "subCategory",
            "brand", "sku", "price", "discountPrice", "stock", "isActive", "isFeatured",
        ];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) product[field] = req.body[field];
        });

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

// @desc  Remove a single image from a product (admin)
export const deleteProductImage = async (req, res, next) => {
    try {
        const { id, publicId } = req.params;
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

// @desc  Delete product (admin)
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

// @desc  Update stock only (used by Inventory module)
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
export const getInventoryAlerts = async (req, res, next) => {
    try {
        const lowStock = await Product.find({ stock: { $gt: 0, $lte: 5 } });
        const outOfStock = await Product.find({ stock: 0 });
        res.status(200).json({ success: true, lowStock, outOfStock });
    } catch (error) {
        next(error);
    }
};