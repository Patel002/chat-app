import { storeFcmToken, getFcmToken, deleteFcmToken } from "../controllers/fcmToken.controller.js";

import { Router } from "express";

const router = Router();

router.route("/store-fcm-token").post(storeFcmToken);
router.route("/get-fcm-token/:userId").get(getFcmToken);
router.route("/delete-fcm-token/:userId").delete(deleteFcmToken);

export default router;