import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../controllers/category.controller";

const router = Router();

router.route("/create").post(createCategory)
router.route("/update").patch(updateCategory)
router.route("/delete/:id").delete(deleteCategory)
router.route("/get").get(getAllCategories);

export default router