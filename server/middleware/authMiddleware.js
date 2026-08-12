
// import User from "../model/user.js"

// export const protect = async (req, res, next) => {
//     let token;

//     if (req.headers.authorization?.startWith("Bearer")) {
//         token = req.headers.authorization.split(" ")[1];

//     } else if (req.cookies?.token) {
//         token = req.cookies.token;
//     }

//     if (!token) {
//         return res.status(401).json({
//             success: false,
//             message: "Not authorized, no token",
//         });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = await User.findById(decoded.id);
//         if (!req.user) {
//             return res.status(401).json({ success: false, message: "user no longer exists" });
//         }
//         next();

//     } catch (err) {
//         console.log(err, "from protect middle")
//         return res.status(401).json({ success: false, message: "Not authorized, token failed" });
//     }
// };

// export const authorized = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             return res.status(403).json({
//                 success: false,
//                 message: `Role '${req.user.role}' is not authorized to access this resource '`,
//             });
//         }
//         next();
//     };
// };


import jwt from "jsonwebtoken"
import User from "../model/user.js"
// import Order from "../model/Order.js"

export const auth = async (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next()
    }

    try {

        const token = req.headers.authorization?.split(" ")[1];
        // console.log("Headers:", req.headers);
        // console.log("Authorization:", req.headers.authorization);


        if (!token) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const decoded = jwt.verify(
            token, process.env.JWT_SECRET
        );

        req.user = decoded;
        next();

    } catch (error) {
        console.log(error)
        res.status(404).json({
            message: "NOt found"
        })
    }
}