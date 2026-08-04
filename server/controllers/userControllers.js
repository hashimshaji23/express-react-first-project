import transporter from "../config/mail.js";
import User from "../model/user.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken"

export const Register = async (req, res, next) => {

    console.log("Register");
    console.log(req.body);

    try {
        const { name, email, phone, password, role } = req.body

        if (!name || !email || !phone || !password || !role) {
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
        console.log(otp);


        const saltRounds = 10
        const salt = bcrypt.genSaltSync(saltRounds)
        // console.log(process.env.saltRounds);
        const hash = bcrypt.hashSync(password, salt)



        const newUser = new User({ name, email, phone, password: hash, role, otp, otpExpiry: Date.now() + 5 * 60 * 1000, });

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

        res.status(200).json({
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