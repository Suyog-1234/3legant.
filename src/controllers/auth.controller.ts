import { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import User from "../database/models/user.model";
import { bcryptPassword, comparePassword, generateAccessToken, generateRefreshToken } from "../utils/helpers/common";

const roleEnum = z.enum(['ADMIN', 'USER']);

const registerUserSchema = z.object({
    username: z.string({ required_error: "Username is required" }).min(1, { message: "Username cannot be empty" }),
    email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email format" }),
    password: z.string({ required_error: "Password is required" }).min(6, { message: "Password must be at least 6 characters long" }),
    profileImage: z.string().url({ message: "Profile image must be a valid URL" }).optional(),
    role: roleEnum.optional(),
});

const loginUserValidation = z.object({
    email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email format" }),
    password: z.string({ required_error: "Password is required" }).min(6, { message: "Password must be at least 6 characters long" }),
});

export async function registerUser(req: Request, res: Response) {
    try {
        const parsedReqBody = registerUserSchema.parse(req.body);

        const userExists = await User.findOne({ email: parsedReqBody.email }).lean().exec();
        if (userExists) {
            return res.status(400).json({ message: "User already has an account. Please log in directly." });
        }
        const hashedPassword = await bcryptPassword(parsedReqBody.password);

        const registeredUser = await User.create({
            ...parsedReqBody,
            password: hashedPassword,
        });

        if (!registeredUser) {
            return res.status(400).json({ message: "Failed to register user." });
        }
        const userData = await User.findById(registeredUser._id).select("-password").lean().exec();
        return res.status(201).json({ data: userData });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.issues.map(issue => issue.message).join(", ") });
        }
        console.error("Error registering user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function loginUser(req: Request, res: Response) {
    try {
        const parsedReqBody = loginUserValidation.parse(req.body);

        const user = await User.findOne({ email: parsedReqBody.email }).exec();
        if (!user) {
            return res.status(400).json({ message: "User not found. Please register before logging in." });
        }

        const isPasswordMatched = await comparePassword(parsedReqBody.password, user.password);
        if (!isPasswordMatched) {
            return res.status(400).json({ message: "Incorrect password." });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });
        return res.status(200).json({ accessToken });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.issues.map(issue => issue.message).join(", ") });
        }
        console.error("Error logging in user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const refresh = (req: Request, res: Response) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })
    const refreshToken = cookies.jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        async (err: any, decoded: any) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })
            const foundUser = await User.findById(decoded.id).exec()
            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })
            const accessToken = generateAccessToken(foundUser._id)
            res.json({ accessToken })
        }
    )
}

export const logout = (req: Request, res: Response) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true })
    res.json({ message: 'Cookie cleared' })
}