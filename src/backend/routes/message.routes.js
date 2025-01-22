import { Router } from 'express';
import { sendMessage, getAllMessage, deleteMessage, updateMessage } from '../controllers/message.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/message').post(verifyJwt, sendMessage);
router.route("/:userId1/:userId2").get(verifyJwt, getAllMessage);
router.route("/delete/:messageId").delete(verifyJwt, deleteMessage);
router.route("/update/:messageId").patch(verifyJwt, updateMessage);

export default router;