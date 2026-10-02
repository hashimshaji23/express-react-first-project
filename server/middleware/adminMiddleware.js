import User from "../model/user.js";

export const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (req.user.role === "admin" || req.user.role === "Admin") {
            return next();
        }

        // Fallback check DB if user role in JWT token payload is outdated or missing
        if (req.user.id || req.user._id) {
            const userId = req.user.id || req.user._id;
            const dbUser = await User.findById(userId);
            if (dbUser && (dbUser.role === "admin" || dbUser.role === "Admin")) {
                req.user.role = "admin";
                return next();
            }
        }

        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    } catch (error) {
        console.error("Error in adminMiddleware:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error in admin verification"
        });
    }
};