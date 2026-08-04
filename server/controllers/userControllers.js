// import transporter from "../config/mail.js";
// import User from "../model/user.js";
// import bcrypt from "bcrypt";
// import { OAuth2Client } from "google-auth-library";
// import jwt from "jsonwebtoken"

// export const Register = async (req, res, next) => {

//     console.log("Register");
//     console.log(req.body);

//     try {
//         const { name, email, phone, password, role } = req.body

//         if (!name || !email || !phone || !password || !role) {
//             res.status(404).json({
//                 message: "all feeld required"
//             });
//         }

//         const existingEmail = await User.findOne({ email })
//         // console.log(existingEmail);

//         if (existingEmail) {
//             res.status(404).json({
//                 message: "email alredy existing"
//             });
//         }

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         console.log(otp);


//         const saltRounds = 10
//         const salt = bcrypt.genSaltSync(saltRounds)
//         // console.log(process.env.saltRounds);
//         const hash = bcrypt.hashSync(password, salt)



//         const newUser = new User({ name, email, phone, password: hash, role, otp, otpExpiry: Date.now() + 5 * 60 * 1000, });

//         const saveUser = await newUser.save()

//         await transporter.sendMail({
//             from: process.env.EMAIL,

//             to: email,

//             subject: "Otp verification",

//             html: `
//             <h2>Welcome</h2>
//             <p>your otp is </p>
//             <h1>${otp}</>

//             <p> Valid for 5 minutes</p>
//             `,
//         });

//         res.status(200).json({
//             status: true,
//             message: "successfull",
//             data: saveUser
//         })
//     } catch (err) {
//         console.log(err)
//     }
// }

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// export const googleAuth = async (req, res) => {
//     try {

//         const { credential } = req.body

//         if (!credential) {
//             return res.status(400).json({
//                 message: "Credential Required",
//             });
//         }

//         const ticket = await client.verifyIdToken({
//             idToken: credential,
//             audience: process.env.GOOGLE_CLIENT_ID
//         });

//         const payload = ticket.getPayload();

//         const { name, email } = payload;

//         let user = await User.findOne({ email });

//         if (!user) {
//             user = await User.create({
//                 name,
//                 email,
//                 role: user,
//                 isVerified: true,
//                 phone: "",
//                 password: "",
//             });
//         }

//         const token = jwt.sign(
//             {
//                 id: user._id,
//                 role: user.role,
//             },

//             process.env.JWT_SECRET,

//             {
//                 expiresIn: "7d",
//             }
//         );

//         res.status(200).json({
//             status: true,
//             message: "Google Login Success",
//             token,
//             user,
//         });

//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             status: false,
//             message: "Google Authentication Failed",
//         });
//     }
// }

import crypto from "crypto"
import User from "../model/user.js";
import sendEmail from "../utils/sendEmail.js";
import { sendTokenResponse } from "../utils/generateToken.js";

// @desc  Register user & send OTP
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.create({
            name,
            email,
            password,
            emailOtp: otp,
            emailOtpExpire: Date.now() + 10 * 60 * 1000, // 10 min
        });

        await sendEmail({
            to: email,
            subject: "Verify your email - OTP",
            html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`,
        });

        res.status(201).json({
            success: true,
            message: "Registered. OTP sent to email for verification.",
            userId: user._id,
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Verify OTP
export const verifyOtp = async (req, res, next) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId).select("+emailOtp +emailOtpExpire");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.emailOtp !== otp || user.emailOtpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        user.isEmailVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc  Login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({ success: false, message: "Please verify your email first" });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc  Logout
export const logout = async (req, res) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ success: true, message: "Logged out" });
};

// @desc  Forgot password - send reset link
export const forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ success: false, message: "No user with that email" });

        const resetToken = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 15 minutes.</p>`,
        });

        res.status(200).json({ success: true, message: "Reset link sent to email" });
    } catch (error) {
        next(error);
    }
};

// @desc  Reset password
export const resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.resetToken)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc  Get current logged-in user
export const getMe = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, user: req.user });
    } catch (error) {
        next(error);
    }
};