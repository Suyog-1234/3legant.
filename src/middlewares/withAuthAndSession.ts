import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

async function withAuthAndSession(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization as string;
        let userId: string | undefined;
        let sessionId = req.cookies.sessionId;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded: any) => {
                if (!err) {
                    userId = decoded.id;
                }
            });
        }
        if (!sessionId) {
            sessionId = uuidv4();
            res.cookie('sessionId', sessionId, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        }
        req.userId = userId;
        req.sessionId = sessionId;
        next();
    } catch (error) {
        console.error("Error in withAuthAndSession middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default withAuthAndSession;
