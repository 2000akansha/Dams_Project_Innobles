import express from 'express';
import { register, login, logout } from '../mobileController/userController.js';
import { getVillageDetails, getVillageDetailsWithBeneficiaryCount, uploadDocs } from '../mobileController/dashboardController.js';
import { isAuthenticated } from '../../middleware/auth.js';
import uploadDocsMiddleware from '../../middleware/multerconfig.js'; // Import the middleware

const router = express.Router();

// User routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

// Village details routes
router.get('/village/', isAuthenticated, getVillageDetails);
router.get('/villages/details-with-count', isAuthenticated, getVillageDetailsWithBeneficiaryCount);

// Document upload route
router.post('/uploadDocs', isAuthenticated, uploadDocsMiddleware, uploadDocs);

export default router;
