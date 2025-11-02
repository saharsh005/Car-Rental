// server/routes/userRoutes.js
import express from "express";
import { firebaseLogin, getUserData, getCars, changeUserRole } from '../controllers/userController.js';
import  protect from '../middleware/firebaseAuth.js';

const router = express.Router();

router.post('/firebase-login', firebaseLogin);
router.get('/data', getUserData);
router.get('/cars', protect, getCars);
router.put('/change-role/:uid', changeUserRole);

export default router;

