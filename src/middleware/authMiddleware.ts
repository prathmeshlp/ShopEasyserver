import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { ApiError } from "../utils/apiUtils";

// Extend Express Request type to include user
// declare global {
//   namespace Express {
//     interface Request {
//       user?:any ;
//     }
//   }
// }

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for JWT in Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Authentication required", [], "AUTH_REQUIRED");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(
        401,
        "Unauthorized: User not found",
        [],
        "USER_NOT_FOUND"
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, "Invalid token", [], "INVALID_TOKEN"));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, "Token expired", [], "TOKEN_EXPIRED"));
    }
    next(error);
  }
};

export default authMiddleware;
