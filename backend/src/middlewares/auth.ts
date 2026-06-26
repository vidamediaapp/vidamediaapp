import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


interface TokenPayload {
    id: string;
    email: string;
}


declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'No token provided'
        });
        return; 
    }

    const token = authHeader.split(' ')[1];

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;

        
        req.user = { id: decoded.id, email: decoded.email };

        
        next();
    } catch (error) {
        
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
        return;
    }
};