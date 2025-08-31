import jwt from "jsonwebtoken";
import users from "../Models/userSchema.js";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(404).json({ message: "Token Missing" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        const user = await users.findById(req._id).select("-password");
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


