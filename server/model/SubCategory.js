import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, lowercase: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// A subcategory name should be unique within its parent category
subCategorySchema.index({ name: 1, category: 1 }, { unique: true });

export default mongoose.model("SubCategory", subCategorySchema);