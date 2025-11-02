import express from 'express';
import {
  checkAvailabilityOfCar,
  createBooking,
  getUserBookings,
  getOwnerBookings,
  changeBookingStatus,
} from '../controllers/bookingController.js';
import verifyFirebaseToken from '../middleware/firebaseAuth.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfCar);
bookingRouter.post('/create', verifyFirebaseToken, createBooking);
bookingRouter.get('/user', verifyFirebaseToken, getUserBookings);
bookingRouter.get('/owner', verifyFirebaseToken, getOwnerBookings);
bookingRouter.post('/change-status', verifyFirebaseToken, changeBookingStatus);

export default bookingRouter;
