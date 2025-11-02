// import User from '../models/User.js';
// import Car from '../models/Car.js';
// import Booking from '../models/Booking.js';
import imagekit from '../configs/imagekit.js';
import { db } from "../configs/firebaseAdmin.js";
import fs from 'fs';

// Change role to owner
export const changeRoleToOwner = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await userRef.update({ role: "owner" });

    res.json({ success: true, message: "Now you can list cars" });
  } catch (error) {
    console.error("🔥 Error changing role:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add car
export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const carData = JSON.parse(req.body.carData);
    const imageFile = req.file;

    // Upload image to ImageKit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: '/cars',
    });

    // Optimize through ImageKit URL transformation
    const optimizedImageUrl = imagekit.url({
      path: uploadResponse.filePath,
      transformation: [
        { width: 1280 },
        { quality: 'auto' },
        { format: 'webp' },
      ],
    });

    const car = await Car.create({
      ...carData,
      owner: _id,
      image: optimizedImageUrl,
    });

    res.json({ success: true, message: 'Car added', car });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get owner cars
export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    const cars = await Car.find({ owner: _id });
    res.json({ success: true, cars });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle car availability
export const toggleCarAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;

    const car = await Car.findById(carId);
    if (car.owner.toString() !== _id.toString()) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    car.isAvailable = !car.isAvailable;
    await car.save();

    res.json({ success: true, message: 'Availability toggled' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete car
export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;

    const car = await Car.findById(carId);
    if (car.owner.toString() !== _id.toString()) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Instead of deleting, we remove the owner and set isAvailable to false
    car.owner = null;
    car.isAvailable = false;
    await car.save();

    res.json({ success: true, message: 'Car removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== 'owner') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const cars = await Car.find({ owner: _id });
    const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });
    const pendingBookings = await Booking.find({ owner: _id, status: 'pending' });
    const completedBookings = await Booking.find({ owner: _id, status: 'confirmed' });

    // Calculate monthly revenue from confirmed bookings
    const monthlyRevenue = bookings
      .filter(booking => booking.status === 'confirmed')
      .reduce((acc, booking) => acc + booking.price, 0);

    const dashboardData = {
      totalCars: cars.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user image
export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.user;
    const imageFile = req.file;

    // Upload image to ImageKit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: '/users',
    });

    // Optimize through ImageKit URL transformation
    const optimizedImageUrl = imagekit.url({
      path: uploadResponse.filePath,
      transformation: [
        { width: 400 },
        { quality: 'auto' },
        { format: 'webp' },
      ],
    });

    await User.findByIdAndUpdate(_id, { image: optimizedImageUrl });

    res.json({ success: true, message: 'Image updated' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};