import { Router } from "express";
import { registerUser, loginUser, getAllRegisterdUsers,userEmailVerification } from "../controllers/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()
router.use((req, res, next) => {
    req.url = req.url.replace(/\/{2,}/g, '/-/');
    next();
});

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/users/:userId?/:userName?").get(verifyJwt, getAllRegisterdUsers)
router.route("/email").post(userEmailVerification)

export default router