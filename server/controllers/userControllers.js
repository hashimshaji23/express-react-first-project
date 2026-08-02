import transporter from "../config/mail.js";
import User from "../model/user.js";
import bcrypt from "bcrypt";


export const Register = async (req, res, next ) => {

    try {
        const { name, email, phone, password, role } = req.body

        if (!name || !email || !phone || !password || !role){
            res.status(404).json({
                message: "all feeld required"
            });
        } 

        const existingEmail = await User.findOne({email})
        console.log(existingEmail);
        
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



        const newUser = new User({ name, email, phone, password:hash, role, otp, otpExpiry: Date.now() + 5 * 60 * 1000, });

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
    }catch (err) {
        console.log(err)
    }
}