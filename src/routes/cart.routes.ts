import { Router } from "express";
import withAuthAndSession from "../middlewares/withAuthAndSession";
import { addToCart, getCart, manageCartQuantity, mergeAnonymousCartIntoUserCart, removeFromCart } from "../controllers/cart.controller";

const router = Router();
router.route("/add").post(withAuthAndSession, addToCart);
router.route("/remove/:productId").delete(withAuthAndSession, removeFromCart);
router.route("/get").get(withAuthAndSession, getCart);
router.route("/manage-cart-quntity").patch(withAuthAndSession, manageCartQuantity);
router.route("/merge-cart").patch(withAuthAndSession,mergeAnonymousCartIntoUserCart);

export default router