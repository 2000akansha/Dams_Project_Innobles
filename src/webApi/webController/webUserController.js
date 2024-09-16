import { catchAsyncError } from '../../middleware/catchAsyncError.js';
import webUserDetails from '../webModel/webUserDetails.js';
import webUserCredentials from '../webModel/webUserCredsSchema.js';
import ErrorHandler from '../../middleware/error.js';
import { sendToken } from '../../utils/jwt.js';
// import bcrypt from 'bcryptjs';  // Ensure bcrypt is installed and used for password hashing

export const register = catchAsyncError(async (req, res, next) => {
    const { username, password, userRole, fullName, phoneNumber } = req.body;

    // Validate request body
    if (!username || !password || !userRole || !fullName || !phoneNumber) {
        return next(new ErrorHandler("Please provide all required fields.", 400));
    }

    // Check if the username already exists
    const isUsernameExists = await webUserCredentials.findOne({ username });
    if (isUsernameExists) {
        return next(new ErrorHandler("Username already exists!", 400));
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user credentials
    const newUserCreds = await webUserCredentials.create({ 
        username, 
        password: hashedPassword 
    });

    // Create corresponding user details with the userId from newUserCreds
    await webUserDetails.create({
        userId: newUserCreds._id,  // Link user details with credentials
        username,
        userRole,
        fullName,
        phoneNumber,
        isUserDeleted: false,
        updatedAt: Date.now(),
    });

    // Generate JWT token
    const token = newUserCreds.getJWTToken();

    // Send token and response
    sendToken(newUserCreds, 201, res, "User registered successfully!", {
        phoneNumber,
        userRole,
        fullName,
        id: newUserCreds._id,
    });
});


export const login = catchAsyncError(async (req, res, next) => {
    const { username, password } = req.body;

    // Validate request body
    if (!username || !password) {
        return next(new ErrorHandler("Please provide username and password.", 400));
    }

    // Find user credentials by username
    const userCreds = await webUserCredentials.findOne({ username }).select("+password");
    if (!userCreds) {
        return next(new ErrorHandler("Invalid username or password.", 400));
    }

    // Compare the provided password with the stored password
    const isPasswordMatched = await userCreds.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid username or password.", 400));
    }

    // Fetch user details using the userId (which is the _id from webUserCredentials)
    const userDetails = await webUserDetails.findOne({ userId: userCreds._id });
    if (!userDetails) {
        return next(new ErrorHandler("User details not found.", 404));
    }

    // Combine user details and credentials
    const combinedUser = {
        phoneNumber: userDetails.phoneNumber,
        userRole: userDetails.userRole,
        username: userDetails.username,
        fullName: userDetails.fullName,
        id: userCreds._id
    };

    // Send token and response
    sendToken(userCreds, 200, res, "Login successful", combinedUser);
});


export const logout = catchAsyncError(async (req, res, next) => {
    res
        .status(200)
        .cookie('token', '', {
            httpOnly: true,
            expires: new Date(Date.now()),
        })
        .json({
            success: true,
            message: 'User logged out successfully.',
        });
});
