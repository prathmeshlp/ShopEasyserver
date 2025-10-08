import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
// import passport from "passport";
import { asyncHandler, ApiResponse, ApiError } from "../utils/apiUtils";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    throw new ApiError(
      400,
      "Email, username, and password are required",
      [],
      "INVALID_INPUT"
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists", [], "USER_EXISTS");
  }

  const newUser = new User({ email, username, password });
  await newUser.save();

  res.json(
    new ApiResponse(
      201,
      {
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
        },
      },
      "User registered successfully"
    )
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(
      400,
      "Email and password are required",
      [],
      "INVALID_INPUT"
    );
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials", [], "INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  res.json(
    new ApiResponse(
      200,
      {
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      },
      "User logged in successfully"
    )
  );
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "User ID is required", [], "MISSING_USER_ID");
  }

  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found", [], "USER_NOT_FOUND");
  }

  res.json(new ApiResponse(200, user, "User retrieved successfully"));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "User ID is required", [], "MISSING_USER_ID");
  }

  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found", [], "USER_NOT_FOUND");
  }

  res.json(new ApiResponse(200, user, "User updated successfully"));
});

// export const googleAuth = passport.authenticate("google", {
//   scope: ["profile", "email"],
//   session: false,
// });

// export const googleAuthCallback = asyncHandler(
//   async (req: Request, res: Response) => {
//     const user = req.user as IUser;

//     if (!user) {
//       throw new ApiError(
//         401,
//         "Google authentication failed",
//         [],
//         "GOOGLE_AUTH_FAILED"
//       );
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET!,
//       {
//         expiresIn: "7d",
//       }
//     );

//     res.redirect(`${process.env.CLIENT_URI}/auth/callback?token=${token}`);
//   }
// );

// export const logout = asyncHandler(async (req: Request, res: Response) => {
//   res.json(
//     new ApiResponse(
//       200,
//       { message: "Logged out successfully" },
//       "Logged out successfully"
//     )
//   );
// });
