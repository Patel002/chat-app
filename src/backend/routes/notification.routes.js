import{
    storeNotification,
    getNotifications,
    markSeenNotification,
    updateToken
} from '../controllers/notification.controller.js';
import Router from "express";

const router = Router();

    router.route("/notify").post(storeNotification);
    router.route("/:userId").get(getNotifications);
    router.route("/:userId/seen").patch(markSeenNotification);
    router.route("/update-token").patch(updateToken); 
    
export default router;