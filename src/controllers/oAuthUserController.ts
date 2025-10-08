// import express, { Request, Response, NextFunction } from "express";
// import passport from "passport";
// import jwt from "jsonwebtoken";
// import { asyncHandler, ApiResponse, ApiError } from "../utils/apiUtils";
// import User from "../models/User";
// import logger from "../utils/logger";

// const router = express.Router();

// // Google OAuth login
// router.get(
//   "/google",
//   (req: Request, res: Response, next: NextFunction) => {
//     passport.authenticate("google", {
//       scope: ["profile", "email"],
//       accessType: "offline",
//       prompt: "consent",
//       session: false // Disable sessions
//     })(req, res, next);
//   }
// );

// // Google OAuth callback with JWT
// router.get(
//   "/google/callback",
//   (req: Request, res: Response, next: NextFunction) => {
//     passport.authenticate("google", { 
//       session: false, // Disable sessions
//       failureRedirect: `${process.env.CLIENT_URI}/login`
//     }, async (err: any, user: any, info: any) => {
//       console.log(info);
//       try {
//         if (err) {
//           logger.error("Google auth error:", err);
//           return res.redirect(`${process.env.CLIENT_URI}/login`);
//         }
        
//         if (!user) {
//           return res.redirect(`${process.env.CLIENT_URI}/login`);
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//           { id: user._id, role: user.role }, 
//           process.env.JWT_SECRET!, 
//           { expiresIn: "7d" }
//         );

//         // Redirect to frontend with token
//         res.redirect(`${process.env.CLIENT_URI}/auth/callback?token=${token}`);
//       } catch (error) {
//         logger.error("Google callback error:", error);
//         res.redirect(`${process.env.CLIENT_URI}/login?error=server_error`);
//       }
//     })(req, res, next);
//   }
// );

// // Logout (client-side JWT removal)
// router.get(
//   "/logout",
//   asyncHandler(async (req: Request, res: Response) => {
//     // With JWT, logout is handled on the client side by removing the token
//     res.json(new ApiResponse(200, { success: true }, "Logged out successfully"));
//   })
// );

// // Get current user from JWT token
// router.get(
//   "/user",
//   asyncHandler(async (req: Request, res: Response) => {
//     // Check for JWT token in Authorization header
//     const token = req.header("Authorization")?.replace("Bearer ", "");
    
//     if (!token) {
//       // Return null user with success (not an error)
//       return res.json(new ApiResponse(200, null, "No authenticated user"));
//     }

//     try {
//       // Verify JWT token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
//       const user = await User.findById(decoded.id).select("-password");
      
//       if (!user) {
//         return res.json(new ApiResponse(200, null, "No authenticated user"));
//       }
      
//       res.json(new ApiResponse(200, user, "User retrieved successfully"));
//     } catch (error) {
//       if (error instanceof jwt.JsonWebTokenError) {
//         // Invalid token, return null user
//         return res.json(new ApiResponse(200, null, "No authenticated user"));
//       }
//       throw error; // Re-throw unexpected errors
//     }
//   })
// );

// export default router;