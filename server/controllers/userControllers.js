import transporter from "../utils/sendEmail.js";
import User from "../model/user.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken"
import { sendTokenResponse } from "../utils/generateToken.js";
import { use } from "react";

export const Register = async (req, res, next) => {

    // console.log("Register");
    // console.log(req.body);

    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            res.status(404).json({
                message: "all feeld required"
            });
        }

        const existingEmail = await User.findOne({ email })
        // console.log(existingEmail);

        if (existingEmail) {
            res.status(404).json({
                message: "email alredy existing"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // console.log(otp);


        const saltRounds = 10
        const salt = bcrypt.genSaltSync(saltRounds)
        // console.log(process.env.saltRounds);
        const hash = bcrypt.hashSync(password, salt)



        const newUser = new User({ name, email, password: hash, emailOtp: otp, emailOtpExpire: Date.now() + 5 * 60 * 1000, });


        const saveUser = await newUser.save()

        await transporter.sendMail({
            from: process.env.EMAIL,

            to: email,

            subject: "Otp verification",

            html: `
            <h2>Welcome</h2>
            <p>your otp is </p>
            <h1>${otp}</>

            <p> Valid for 5 minutes</p>
            `,
        });

        res.status(201).json({
            status: true,
            message: "successfull",
            data: saveUser
        })
    } catch (err) {
        console.log(err)
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
    try {

        const { credential } = req.body

        if (!credential) {
            return res.status(400).json({
                message: "Credential Required",
            });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const { name, email } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                role: user,
                isVerified: true,
                phone: "",
                password: "",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d",
            }
        );

        res.status(200).json({
            status: true,
            message: "Google Login Success",
            token,
            user,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: false,
            message: "Google Authentication Failed",
        });
    }
}


export const verifyOtp = async (req, res, next) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId).select("+emailOtp +emailOtpExpire");
        if (!user) return res.status(404).json({
            success: false,
            message: "User not found"
        });

        if (user.emailOtp !== otp || user.emailOtpExpire < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        user.isEmailVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);

    } catch (err) {
        console.log(err, "form verifyOtp");
    };
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(404).json({
                success: false,
                message: "please provide email and password"
            });

            const user = await User.findOne({email}).select("+password");
            if (!user || ! (await user.comparePassword(password))) {
                return res.status(401).json({
                    success:false,
                    message:"Invalid credentials"
                });
            }

            if (!user.isEmailVerified) {
                return res.status(403).json({success: false, message: "please verify your first"});
            }
        }


        
    }catch(err) {
        console.log(err, "from login fun");
    }
}