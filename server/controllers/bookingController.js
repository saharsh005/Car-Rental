import { db } from "../configs/firebaseAdmin.js";
import admin from "firebase-admin";

// Check car availability by comparing booking dates
const checkAvailability = async (carId, pickupDate, returnDate) => {
  const bookingsRef = db.collection("bookings");
  const snapshot = await bookingsRef
    .where("car", "==", carId)
    .get();

  let available = true;
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (
      new Date(data.pickupDate) < new Date(returnDate) &&
      new Date(data.returnDate) > new Date(pickupDate)
    ) {
      available = false;
    }
  });

  return available;
};

// Check availability of cars by location and date
export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;

    const carsRef = db.collection("cars");
    const snapshot = await carsRef.where("location", "==", location).get();

    const availableCars = [];
    for (const doc of snapshot.docs) {
      const car = doc.data();
      const isAvailable = await checkAvailability(doc.id, pickupDate, returnDate);
      if (isAvailable && car.isAvailable) {
        availableCars.push({ id: doc.id, ...car });
      }
    }

    res.json({ success: true, availableCars });
  } catch (error) {
    console.error("checkAvailabilityOfCar error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new booking
export const createBooking = async (req, res) => {
  try {
    const { uid } = req.user; // comes from Firebase decoded token
    const { car, pickupDate, returnDate } = req.body;

    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: "Car not available" });
    }

    const carDoc = await db.collection("cars").doc(car).get();
    if (!carDoc.exists) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const carData = carDoc.data();
    const pickup = new Date(pickupDate);
    const returned = new Date(returnDate);
    const days = Math.ceil((returned - pickup) / (1000 * 60 * 60 * 24));
    const price = carData.pricePerDay * days;

    const bookingRef = db.collection("bookings").doc();
    await bookingRef.set({
      car,
      user: uid,
      owner: carData.owner,
      pickupDate,
      returnDate,
      status: "pending",
      price,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "Booking created successfully" });
  } catch (error) {
    console.error("createBooking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get bookings for logged-in user
export const getUserBookings = async (req, res) => {
  try {
    const { uid } = req.user;

    const snapshot = await db.collection("bookings").where("user", "==", uid).get();
    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("getUserBookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get bookings for owner
export const getOwnerBookings = async (req, res) => {
  try {
    const { uid } = req.user;

    const snapshot = await db.collection("bookings").where("owner", "==", uid).get();
    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("getOwnerBookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change booking status
export const changeBookingStatus = async (req, res) => {
  try {
    const { uid } = req.user;
    const { bookingId, status } = req.body;

    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const bookingData = bookingDoc.data();
    if (bookingData.owner !== uid) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await bookingRef.update({ status });
    res.json({ success: true, message: "Booking status updated" });
  } catch (error) {
    console.error("changeBookingStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
