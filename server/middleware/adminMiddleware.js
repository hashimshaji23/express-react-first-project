export const adminMiddleware = async (req, res, next ) => {

    try {
        
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: 'Access denid'
            });
        }
        next();
    } catch (error) {
        
        res.status(500).json({
            message: error.message
        });
    }
}