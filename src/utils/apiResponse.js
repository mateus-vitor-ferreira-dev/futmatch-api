export function success(res, data, statusCode = 200) {
    return res.status(statusCode).json({ success: true, data });
}

export function created(res, data) {
    return success(res, data, 201);
}
