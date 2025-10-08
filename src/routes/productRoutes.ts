import { Router } from "express";
import { addReview , getProducts, getReviews, getUniqueCategories, searchProducts, validateDiscountHandler } from "../controllers/productController";
import authMiddleware from "../middleware/authMiddleware";
const router = Router();


router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:productId/reviews", getReviews);
router.post("/:productId/reviews", authMiddleware, addReview);
router.get("/categories", getUniqueCategories);
router.post("/validate", authMiddleware, validateDiscountHandler);

export default router;