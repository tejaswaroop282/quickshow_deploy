import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next)=>{
    try {
        const { userId } = req.auth();

        if(!userId){
            return res.status(401).json({success: false, message: "Sign in required"})
        }

        const user = await clerkClient.users.getUser(userId)

        const adminEmail = process.env.ADMIN_EMAIL;
        const userEmail = user.emailAddresses[0]?.emailAddress;

        if(!adminEmail || userEmail !== adminEmail){
            return res.status(403).json({success: false, message: `Admin access required. Sign in with ${adminEmail}`})
        }

        next();
    } catch (error) {
        console.error('protectAdmin error:', error.message);
        return res.status(401).json({ success: false, message: "Authentication failed" });
    }
}