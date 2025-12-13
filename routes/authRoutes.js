import express from 'express';
import { login, logout,getadmindetails } from '../controllers/authController.js';
import {protect} from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/login', login);
router.post('/logout',protect, logout); // POST to clear the cookie securely
router.get('/getadmin',protect, getadmindetails);
export default router;
