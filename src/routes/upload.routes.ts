import { Router } from "express";
import { getPutObjectSignedUrls } from "../controllers/upload.controller";

const router = Router();

router.route("/putobj-urls").post(getPutObjectSignedUrls)
// router.route("/getobj-url").patch(updateCategory)

export default router