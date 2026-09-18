import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import { body } from "express-validator";
import { User } from "../user/user-model";
import { jwtService } from "../services/jwt-service";

export const loginValidation = [
        body("email")
                .trim()
                .notEmpty().withMessage("Email is required")
                .isEmail().withMessage("Invalid email format"),
        body("password")
                .notEmpty().withMessage("Password is required"),
];


export const teacherLogin: RequestHandler = async (req, res, next) => {
        try {
                const { email, password } = req.body;

                const user = await User.findOne({ email }).select("+password").exec();
                
                if (!user || !user.password) {
                        return res.status(401).json({ message: "Invalid email or password" });
                }
                if (!user.isActive) {
                        return res.status(403).json({ message: "Your account has been deactivated. Please contact the administrator."});
                }

                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                        return res.status(401).json({ message: "Invalid email or password" });
                }

                const token = jwtService.createToken(
                        { id: user._id, email: user.email, role: user.role }, 
                        { expiresIn: "2h" }
                );

                const refreshToken = jwtService.createToken(
                        { id: user._id, email: user.email, role: user.role },
                        { expiresIn: "7d" }
                );

                const userObj = user.toObject();
                const { password: _, ...userWithoutPassword } = userObj;
                return res.status(200).json({
                        message: "Logged in successfully",
                        token,
                        refreshToken,
                        user: userWithoutPassword
                });
        } catch (err) {
                next(err);
        }
};