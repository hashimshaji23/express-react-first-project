import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String, required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
        brand: { type: String, trim: true },
        sku: { type: String, unique: true, sparse: true, trim: true },

        price: { type: Number, required: true, min: 0 },
        discountPrice: { type: Number, min: 0 },
        stock: { type: Number, required: true, min: 0, default: 0 },

        images: [
            {
                url: String,
                public_id: String,
            },
        ],

        ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
        numReviews: { type: Number, default: 0 },

        isFeatured: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Virtual: effective selling price
productSchema.virtual("finalPrice").get(function () {
    return this.discountPrice && this.discountPrice < this.price
        ? this.discountPrice
        : this.price;
});

// Virtual: low-stock flag (Inventory module hook)
productSchema.virtual("isLowStock").get(function () {
    return this.stock > 0 && this.stock <= 5;
});

productSchema.set("toJSON", { virtuals: true });

productSchema.index({ name: "text", brand: "text", description: "text" });

export default mongoose.model("Product", productSchema);