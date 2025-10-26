import jwt from "jsonwebtoken";

export const authMiddleware = async (req,res,next) => {
    try{
        const header = req.headers.authorization;
        if(!header || !header.startsWith("Bearer "))
            return res.status(401).json({ error: "unauthorized token"});
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //decode token
        req.employee = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
            isHR: decoded.isHR
        };
        next();
    }catch(err){
        res.status(401).json({ error: "unauthorized token"}); // 401 auth error
    }
};