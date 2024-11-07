const jwt = require("jsonwebtoken");
const ensureAuthenticated = (req, res, next) => {
    const auth = req.headers["authorization"];
    if (!auth) {
        return res
            .status(403)
            .json({ message: "Unauthorized, JWT token is require" });
    }
    try {
        const decoded = jwt.verify(auth, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res
            .status(403)
            .json({ message: "Unauthorized, JWT token wrong or expired" });
    }
};

// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//     const token = req.header("Authorization");
//     if (!token) {
//         return res.status(401).json({ message: "No token, authorization denied" });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded.userId; // Set the user ID from the token to the request
//         next(); // Proceed to the next middleware or route handler
//     } catch (error) {
//         res.status(401).json({ message: "Token is not valid" });
//     }
// };

// module.exports = authMiddleware;


module.exports = {
    ensureAuthenticated,
};
