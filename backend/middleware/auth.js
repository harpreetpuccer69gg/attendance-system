const jwt = require("jsonwebtoken");

const SECRET = "attendance_secret";

function auth(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Token required"
        });
    }

    // Remove "Bearer "
    const token = authHeader.replace("Bearer ", "");

    try {

        const decoded = jwt.verify(token, SECRET);

        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token"
        });

    }
}

module.exports = auth;