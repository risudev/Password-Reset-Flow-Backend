import users from "../Models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sendEmail from "../Utils/mailer.js";

dotenv.config();

//Register user

export const userRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new users({ name, email, password: hashPassword });
        await newUser.save();
        res
            .status(200)
            .json({ message: "user Registered Successfully", data: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//login user

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await users.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User Not Found" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(404).json({ message: "Invalid Password" });
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        user.token = token;
        await user.save();
        res
            .status(200)
            .json({ message: "User LoggedIn Successfully", token: token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//get user
export const getUser = async (req, res) => {
    try {
        const _id = req.user._id;
        const user = await users.findOne({ _id });
        res.status(200).json({ message: `welcome ${user.username}`, data: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//forgot password

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        await sendEmail(
            user.email,
            "Password Reset Link",
            `you are receiving this because you try to reset your password for you account.
      Click the following Link to complete the process 
      https://regloginpage.netlify.app/reset-password/${user._id}/${token}
      please ignore if you have not Requested for reset password`
        );

        res.status(200).json({ message: "Email Sent Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Reset Password

export const resetPassword = async (req, res) => {
    try {
        const { id, token } = req.params;
        const { password } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(404).json({ message: "Invalid Token" });
        }
        const hashPassword = await bcrypt.hash(password, 10);

        //update the user password in db
        const updateUser = await users.findByIdAndUpdate(
            id,
            { password: hashPassword },
            { new: true }
        );
        if (!updateUser) {
            return res.status(404).json({ message: "User not Found" });
        }
        res.status(200).json({ message: "Password Changed Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};