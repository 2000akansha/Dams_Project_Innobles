import express from 'express';
import { register, login, logout } from '../webController/webUserController.js'; 
import { isAuthenticated } from '../../middleware/auth.js'; 

const router = express.Router();

router.post('/registerPage',register);
router.post('/loginPage', isAuthenticated,login);
router.get('/logoutPage', isAuthenticated, logout);

export default router;
