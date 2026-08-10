import Product from "../model/Product.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";
import { slugify } from "../utils/slugify.js";


export const createProduct = async (req, res, next) => {
    try {
        const {
            name, description, category, brand, price,
            discountPrice, stock,
        } = req.body;

        const slug = slugify(name);

        let image = [];

        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map((file) => uploadBufferToCloudinary(file.buffer, "product"))
            );
            image = uploads.map((r) => ({ url: r.secure_url, public_id: r.public_id }));
        }

        const product = await Product.create({
            name, slug, description, category,
            brand, price, discountPrice, stock, 
        });

        res.status(201).json({ success: true, product });

    } catch (err) {
        console.log(err, "from create product");
    }
}

export const getProducts = async (req, res, next) => {
    try {

        const { keyword, category, subCategory, brand,
            minPrice, maxPrice, minRating, sort, page = 1, limit = 12,
        } = req.query;

        const filter = { isActive: true };

        if (keyword) filter.$text = { $search: keyword };
        if (category) filter.category = category;
        if (subCategory) filter.subCategory = subCategory;
        if (brand) filter.ratingAverage = { $gte: Number(minRating) };
        if (minRating) filter.ratingAverage = { $gte: Number(minRating) };
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort == "price_asc") sortOption = { price: 1 };
        if (sort == "price_desc") sortOption = { price: -1 };
        if (sort === "rating") sortOption = { ratingAverage: -1 };
        if (sort === "newest") sortOption = { createdAt: -1 };

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("category", "name slug")
                .populate("subCategory", "name slug")
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

    } catch (err) {
        console.log(err, "from getProduct");

    }
}

export const getProduct = async (req, res, next) => {
    try {
        const { idOrslug } = req.params;
        const query = idOrslug.match(/^[0-9a-fA-F]{24}$/)
            ? { _id: idOrslug }
            : { slug: idOrslug };

        const product = await Product.findOne(query)
            .populate("category", "name slug")
            .populate("subCategory", "name slug");

        if (!product) {
            return res.status(404).json({ success: false, message: "product not found" });
        }
        res.status(200).json({ success: true, product });

    } catch (err) {
        console.log(err, "from getsingle product")
    }
}

export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "product not found" })
        }

        const fields = [
            "name", "description", "category", "subCategory", "brand",
            "sku", "price", "discountPrice", "stock", "isActive", "isFeatured",
        ];

        fields.forEach((field) => {
            if (req.body[field] !== undefined) product[field] = req.body[field];
        });

        if (req.body.name) product.slug = slugify(req.body.name);

        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map((file) => uploadBufferToCloudinary(file.buffer, "products"))
            );

            const newImages = uploads.map((r) => ({ url: r.secure_url, public_id: r.public_id }));
            product.image.push(...newImages);
        }

        await product.save();
        res.status(200).json({ success: true, product });

    } catch (err) {
        console.log(err, "from updateproduct")
    }
}

export const deleteProductImage = async(req, res, next) => {
    try{
        const { id, public_id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "product not found" });
        };

        await deleteFromCloudinary(publicId);
        product.images = product.image.filter((img) => img.public_id !== publicId);
        await product.save();

        res.status(200).json({ success: true, product });

    }catch(err) {
        console.log(err, "from dlt product img");
        
    }
}

export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) {
            return res.status(404).json({ success: false, message: "product not found" });
        }

        await Promise.all (
            product.images.map((img) => deleteFromCloudinary(img.public_id))
        );

        await product.deleteOne();
        res.status(200).json({ success: true, message: "product deleted" });

    }catch (err) {
        console.log(err, "from dlt product")
    }
}

export const updateStock = async(req, res, next) => {
    try {
        const { stock } = req.body;
        const product = await Product.findByIdAndDelete(
            req.params.id,
            { stock },
            {new: true, runValidators: true}
        );
        if (!product) {
            return res.status(404).json({ success:false, message: "product not found" });
        }

        res.status(200).json({ success: true, product });

    }catch(err){
        console.log(err, "from updatestock")
    }
}

