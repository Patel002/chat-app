import jwt from "jsonwebtoken";

const verifyJwt = (req, res, next) => {

    try {
        const authHeader = req.headers.authorization;;
        if (!authHeader ||!authHeader.startsWith("Bearer ")) {
            throw new Error("Invalid access token")
        }

        const token = authHeader?.split(" ")[1];
        const decoded = jwt.verify(token,"somegebrrishwordintextformat");

        if (!decoded || !decoded.id) {
            throw new Error("Invalid token or missing user ID");
        }

        req.user = {id: decoded.id};
        next();
        
    } catch (error) {
        throw new Error(error.message || "Invalid access token")    
    }
}

export {
    verifyJwt
}