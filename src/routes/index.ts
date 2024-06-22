import { Router } from "express";
import categoriesRoutes from "./categories.routes";
import productsRoutes from "./products.routes";
import uploadRoutes from "./upload.routes";
import authRoutes from "./auth.routes";
import cartRoutes from "./cart.routes";

const router =Router();
router.use("/category",categoriesRoutes);
router.use("/product",productsRoutes);
router.use("/upload",uploadRoutes);
router.use("/auth",authRoutes);
router.use("/cart",cartRoutes);

export default router