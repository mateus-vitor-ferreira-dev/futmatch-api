export function errorMiddleware(error, req, res, next) {
    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "INTERNAL_SERVER_ERROR",
    });
}