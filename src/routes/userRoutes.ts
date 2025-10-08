import { Router } from "express";
import { register, login, getUser, updateUser } from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/:id", authMiddleware, getUser);
router.put("/:id", authMiddleware, updateUser);
// router.get("/auth/google", googleAuth);
// router.get("/auth/google/callback", googleAuthCallback);
// router.post("/logout", logout);



export default router;