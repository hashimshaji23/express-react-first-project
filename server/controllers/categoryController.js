import Category from "../model/Category.js";
import { deleteFromCloudinary, uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import { slugify } from "../utils/slugify.js";

export const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        const slug = slugify(name);

        const exists = await Category.findOne({ slug });
        if (exists) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        let image;
        if (req.file) {
            const result = await uploadBufferToCloudinary(req.file.buffer, "categories");
            image = { url: result.secure_url, public_id: result.public_id };
        }

        const category = await Category.create({ name, slug, description, image });
        res.status(201).json({ success: true, category });
    } catch (err) {
        next(err);
    }
};

export const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        res.status(200).json({ success: true, count: categories.length, categories });
    } catch (err) {
        next(err);
    }
};

export const getCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, category });
    } catch (err) {
        next(err);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        const { name, description, isActive } = req.body;

        if (name && name !== category.name) {
            category.name = name;
            category.slug = slugify(name);
        }

        if (description !== undefined) category.description = description;
        if (isActive !== undefined) category.isActive = isActive;

        if (req.file) {
            if (category.image?.public_id) {
                await deleteFromCloudinary(category.image.public_id);
            }
            const result = await uploadBufferToCloudinary(req.file.buffer, "categories");
            category.image = { url: result.secure_url, public_id: result.public_id };
        }

        await category.save();
        res.status(200).json({ success: true, category });
    } catch (err) {
        next(err);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        if (category.image?.public_id) {
            await deleteFromCloudinary(category.image.public_id);
        }

        await category.deleteOne();
        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (err) {
        next(err);
    }
};