import express from "express";
import { forgotPassword, getUser, resetPassword, userLogin, userRegister } from "../Controllers/authController.js";
// import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token()", resetPassword)

export default router;
