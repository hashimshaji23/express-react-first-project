// import transporter from "../utils/sendEmail.js";
import User from "../model/user.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken"
// import { sendTokenResponse } from "../utils/generateToken.js";

export const Register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "all field required"
            });
        }

        const existingEmail = await User.findOne({ email })

        if (existingEmail) {
            return res.status(400).json({
                message: "email already exist"
            });
        }

        // const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const saltRounds = 10
        const salt = bcrypt.genSaltSync(saltRounds)
        const hash = bcrypt.hashSync(password, salt)

        const newUser = new User({
            name,
            email,
            role,
            password: hash,
            // emailOtp: otp,
            // emailOtpExpire: Date.now() + 5 * 60 * 1000,
        });

        const saveUser = await newUser.save()

        // await transporter.sendMail({
        //     from: process.env.EMAIL,
        //     to: email,
        //     subject: "Otp verification",
        //     html: `
        //     <h2>Welcome</h2>
        //     <p>your otp is</p>
        //     <h1>${otp}</h1>
        //     <p>Valid for 5 minutes</p>
        //     `,
        // });

        res.status(201).json({
            status: true,
            message: "successful",
            data: saveUser,
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "something went wrong"
        })
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


// export const verifyOtp = async (req, res, next) => {
//     try {
//         const { userId, otp } = req.body;

//         const user = await User.findById(userId).select("+emailOtp +emailOtpExpire");
//         if (!user) return res.status(404).json({
//             success: false,
//             message: "User not found"
//         });

//         if (user.emailOtp !== otp || user.emailOtpExpire < Date.now()) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid or expired OTP"
//             });
//         }

//         user.isEmailVerified = true;
//         user.emailOtp = undefined;
//         user.emailOtpExpire = undefined;
//         await user.save();

//         sendTokenResponse(user, 200, res);

//     } catch (err) {
//         console.log(err, "form verifyOtp");
//     };
// }

export const login = async (req, res, next) => {
    try {

        const { email, password, } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: "user Not found"
            })
        }

        // if (!user.isEmailVerified) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Please verify your email first"
        //     });
        // }

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        console.log("8. Password match:", isPasswordMatch);

        if (!isPasswordMatch) {
            return res.status(404).json({
                message: "password is not match"
            });
        }

        // console.log("JWT_SECRET:", process.env.JWT_SECRET);
        // console.log("JWT_EXPIRE:", process.env.JWT_EXPIRE);


        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE
            }
        );

        // console.log("TOKEN:", token);
        // const token = jwt.sign(
        //     { id: user._id, role: user.role },
        //     process.env.JWT_SECRET,
        //     { expiresIn: process.env.JWT_EXPIRE },

        // )
        //     console.log("TOKEN:", token);

        res.status(201).json({
            message: "login successfully",
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token: token
        })

    } catch (err) {
        console.log(err, "from login fun");
        res.status(500).json({
            success: false,
            message: "something went wrong"
        });
    }
};

// export const logout = async (req, res) => {
//     try {

//         const user = await User.findOne({ email: req.body.email });
//         if (!user) return res.status(404).json({ success: false, message: "No user with that email" });

//         const restToken = crypto.randomBytes(20).toString("hex");
//         user.resetPasswordToken = crypto.createHash("sha256").update(restToken).digest("hex");
//         user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
//         await user.save();

//         const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

//         await sendEmail({
//             to: user.email,
//             subject: "password Reset Request",
//             html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 15 minutes. </p>`,
//         });

//         res.status(200).json({
//             success: true, message: "Reset link sent to email"
//         });

//     } catch (err) {
//         console.log(err, "from logout")
//     }
// }

// export const forgotPassword = async (req, res, next) => {
//     try {

//         const user = await User.findOne({ email: req.body.email });
//         if (!user) return res.status(404).json({ success: false, message: "NO user with that email" });

//         const resetToken = crypto.randomBytes(20).toString("hex");
//         user.resetPasswordToken = crypto.createHash("sha56").update(resetToken).digest("hex");
//         user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
//         await user.save();

//         const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

//         await sendEmail({
//             to: user.email,
//             subject: "password Reset Request",
//             html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 15 minutes.</p>`,
//         });
//         res.status(200).json({ success: true, message: "Reset link sent to email" });

//     } catch (err) {
//         console.log(err, "from forgotPass")
//     }
// }

// export const resetPassword = async (req, res, next) => {
//     try {

//         const resetPasswordToken = crypto
//             .createHash("sha256")
//             .update(req.params.resetToken)
//             .digest("hex");

//         const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() }, });

//         if (!user) {
//             return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
//         }

//         user.password = req.body.password;
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;
//         await user.save();

//         sendTokenResponse(user, 200, res);

//     } catch (err) {
//         console.log(err, "reset pass")
//     }
// }
