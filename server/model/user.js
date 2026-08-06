import mongoose from "mongoose";
import bcrypt from "bcrypt"

const addressSchema = new mongoose.Schema({
    label: { type: String, default: "Home" },
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    // phone: {
    //     type: Number,
    //     require: true
    // },
    password: {
        type: String,
        require: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ["customer", "admin", "delivery"],
        default: "customer"
    },
    avatar: { url: String, public_id: String },

    addresses: [addressSchema],

    isEmailVerified: { type: Boolean, default: false },

    emailOtp: { type: String, select: false },
    emailOtpExpire: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },

    // otp: {
    //     type: String
    // },
    // otpExpiry: {
    //     type: Date
    // },

    // isVerified: {
    //     type: Boolean,
    //     default: false
    // }
}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    // next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('userData', userSchema)

export default User