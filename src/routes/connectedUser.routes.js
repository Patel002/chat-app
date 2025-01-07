import { Socket } from "socket.io";
import { getConnectedUsers } from "../controllers/userService.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.route("/").get(verifyJwt, async(req, res) => {

try {
        const connectedUsers = await getConnectedUsers(req.user.id);
        res.status(200).json(connectedUsers);
} catch (error) {
        console.error('Error while fetching connected users',error);
        res.status(500).json({ message: 'Error while fetching connected users' });
    
}
})


export default router;