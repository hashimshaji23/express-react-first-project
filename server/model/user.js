import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phone: {
        type: Number,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    role : {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    otp :{
        type: String
    },
    otpExpiry: {
        type: Date
    },

    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const User = mongoose.model('userData', userSchema)

export default User