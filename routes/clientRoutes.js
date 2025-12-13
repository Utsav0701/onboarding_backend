import express from 'express';
import { upload } from '../middleware/multerMiddleware.js';
import {
  addClient,
  getAllClients,
  getClient,
  deleteClient,
  updateClientAndDocuments,
  resendUploadLink
} from '../controllers/clientController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { decoder } from '../middleware/userMiddleware.js';

const router = express.Router();

// Apply middleware to all routes below
// router.use(protect, adminOnly);

// client can update their own documents
router.put('/update/:token', decoder, upload.any(), updateClientAndDocuments);
// Admin
router.post('/resend',protect,adminOnly,resendUploadLink);
router.post('/add', protect, adminOnly, addClient);
router.get('/getall', protect,adminOnly,getAllClients);
router.get('/get/:id',protect,adminOnly, getClient);
router.get('/getdetails/:token', decoder, getClient); 
router.delete('/delete/:id',protect,adminOnly, deleteClient);



export default router;
