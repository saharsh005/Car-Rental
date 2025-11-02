import express from 'express';
import {
  changeRoleToOwner,
  addCar,
  getOwnerCars,
  toggleCarAvailability,
  deleteCar,
  getDashboardData,
  updateUserImage,
} from '../controllers/ownerController.js';
import verifyFirebaseToken from '../middleware/firebaseAuth.js';
import upload from '../middleware/multer.js';

const ownerRouter = express.Router();

ownerRouter.post('/change-role', verifyFirebaseToken, changeRoleToOwner);
ownerRouter.post('/add-car', upload.single('image'), verifyFirebaseToken, addCar);
ownerRouter.get('/cars', verifyFirebaseToken, getOwnerCars);
ownerRouter.post('/toggle-car', verifyFirebaseToken, toggleCarAvailability);
ownerRouter.post('/delete-car', verifyFirebaseToken, deleteCar);
ownerRouter.get('/dashboard', verifyFirebaseToken, getDashboardData);
ownerRouter.post('/update-image', upload.single('image'), verifyFirebaseToken, updateUserImage);

export default ownerRouter;
