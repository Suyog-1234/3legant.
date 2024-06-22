import { Router } from "express";
import { createProduct, deleteProduct, getAllProduct, getProduct, updateProduct } from "../controllers/product.controller";

const router = Router();

router.route("/create").post(createProduct)
router.route("/update").patch(updateProduct)
router.route("/delete/:id").delete(deleteProduct)
router.route("/get/:id").get(getProduct)
router.route("/get").get(getAllProduct)

export default router