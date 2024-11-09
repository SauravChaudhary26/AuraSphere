const jwt = require("jsonwebtoken");

const JwtValidation = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    // Extract the token by removing the "Bearer " prefix

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token missing from header" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded._id; // Assuming the token payload includes an `id` field for the user ID
        console.log(req.userId);

        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = JwtValidation;