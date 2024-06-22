// src/middlewares/withAuth.ts
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

async function withAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization as string;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          return res.status(403).json({ message: 'Forbidden' });
        }
        req.userId = decoded.id;
        next();
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
export default withAuth