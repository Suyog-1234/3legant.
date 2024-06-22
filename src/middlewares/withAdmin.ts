import { NextFunction, Request, Response } from "express";
import User from "../database/models/user.model";
import mongoose from "mongoose";
import { UserRole } from "../types/models.types";

async function withAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await User.findOne({
            _id: new mongoose.Types.ObjectId(req.userId),
            role: UserRole.ADMIN
        });
        if (!user) {
            return res.status(403).json({ message: "You do not have permission to access this resource" });
        }
        next();
    } catch (error) {
        console.error("Error in withAdmin middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
export default withAdmin