export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Server Error";

    if (err.name === "CastError") {
        statusCode = 404;
        message = "Resource not found";
    }
    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value entered";
    }
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((v) => v.message).join(", ");
    }

    res.status(statusCode).json({ success: false, message });
};