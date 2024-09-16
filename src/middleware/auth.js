import userCredentials from "../mobileApi/mobileModel/userCredsSchema.js"; 
import jwt from 'jsonwebtoken';
import ErrorHandler from './error.js';
import { catchAsyncError } from "../middleware/catchAsyncError.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("User Not Authorised: Token Missing", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded || !decoded.id) {
            return next(new ErrorHandler("User Not Authorised: Invalid Token", 401));
        }

        const user = await userCredentials.findById(decoded.id);
        if (!user) {
            return next(new ErrorHandler("User Not Authorised: Invalid Token", 401));
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Token verification error:", error); // Log the error for debugging
        return next(new ErrorHandler("User Not Authorised: Invalid Token", 401));
    }
});
