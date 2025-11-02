import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import axios from "axios";

const BookRide = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [totalDays, setTotalDays] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ownerId, setOwnerId] = useState("");

  // ✅ Fetch car details
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const q = query(collection(db, "cars"), where("id", "==", id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const carDoc = querySnapshot.docs[0];
          const carData = { docId: carDoc.id, ...carDoc.data() };
          setCar(carData);

          // ✅ Fetch and set ownerId if present in the car document
          if (carData.ownerId) {
            setOwnerId(carData.ownerId);
          } else {
            console.warn("⚠️ No ownerId found in car document");
          }
        } else {
          console.warn("⚠️ Car not found in database");
        }
      } catch (err) {
        console.error("Error fetching car:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  // ✅ Calculate cost
  useEffect(() => {
    if (pickupDate && returnDate) {
      const start = new Date(pickupDate);
      const end = new Date(returnDate);
      const days = (end - start) / (1000 * 60 * 60 * 24);
      if (days > 0) {
        setTotalDays(days);
        setTotalCost(days * car?.pricePerDay || 0);
      } else {
        setTotalDays(0);
        setTotalCost(0);
      }
    }
  }, [pickupDate, returnDate, car]);

  // ✅ Razorpay payment + booking handler
const handlePayment = async () => {
  if (!pickupDate || !returnDate || totalDays <= 0) {
    alert("Please select valid pickup and return dates.");
    return;
  }
  if (!email || !phoneNumber) {
    alert("Please enter email and phone number.");
    return;
  }

  const selectedStart = new Date(pickupDate);
  const selectedEnd = new Date(returnDate);

  // ✅ Check date overlap
  const hasOverlap = car.unavailableDates?.some((range) => {
    const rangeStart = new Date(range.start);
    const rangeEnd = new Date(range.end);
    return selectedStart <= rangeEnd && selectedEnd >= rangeStart;
  });

  if (hasOverlap) {
    alert("❌ Sorry, this car is not available for the selected dates.");
    return;
  }

  setIsProcessing(true);

  try {
    const { data } = await axios.post("http://localhost:5000/api/payment/create-order", {
      amount: totalCost * 100,
    });

    const options = {
      key: "rzp_test_RaS6CLZQIpsugo",
      amount: data.amount,
      currency: "INR",
      name: "Rent-A-Ride",
      description: `Booking for ${car.brand} ${car.model}`,
      order_id: data.id,
      handler: async function (response) {
        try {
          // ✅ Step 1: Add booking document
          const bookingRef = await addDoc(collection(db, "bookings"), {
            userId: auth.currentUser?.uid || "guest",
            email,
            phoneNumber,
            carId: car.id,
            carName: `${car.brand} ${car.model}`,
            carImage: car.imageUrl || car.image, // ✅ ensure image appears
            pickupDate,
            returnDate,
            totalCost,
            totalDays,
            status: "Confirmed",
            ownerId,
            createdAt: new Date().toISOString(),
          });

          // ✅ Step 2: Update car's unavailable dates
          const carRef = doc(db, "cars", car.docId);
          const existingUnavailable = car.unavailableDates || [];
          await updateDoc(carRef, {
            unavailableDates: [
              ...existingUnavailable,
              { start: pickupDate, end: returnDate },
            ],
          });

          alert("✅ Booking confirmed successfully!");
          navigate("/my-bookings");
        } catch (err) {
          console.error("Error saving booking:", err);
          alert("Error saving booking details!");
        }
      },
      prefill: {
        email,
        contact: phoneNumber,
      },
      theme: {
        color: "#2563eb",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error("Payment error:", error);
    alert("Payment failed!");
  } finally {
    setIsProcessing(false);
  }
};


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading car details...</p>
        </div>
      </div>
    );

  if (!car)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <p className="text-slate-500 text-lg font-medium">Car not found</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header Navigation */}
      <div className="border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT SECTION */}
          <div className="space-y-6">
            {/* Car Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Car Details</h2>
              <div className="flex items-center gap-4">
                <img
                  src={car.imageUrl}
                  alt={car.brand}
                  className="w-32 h-24 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-sm text-slate-500">{car.year}</p>
                  <p className="mt-2 font-semibold text-blue-600">
                    ₹{car.pricePerDay} / day
                  </p>
                </div>
              </div>
            </div>

            {/* Ride Dates Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Ride Dates</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary Card */}
            {totalDays > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Duration:</span>
                    <span className="font-semibold text-slate-900">{totalDays} days</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Price per day:</span>
                    <span className="font-semibold text-slate-900">₹{car.pricePerDay}</span>
                  </div>
                  <div className="border-t border-slate-200 my-3"></div>
                  <div className="flex justify-between text-lg font-bold text-slate-900">
                    <span>Total Cost:</span>
                    <span className="text-blue-600">₹{totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SECTION - Payment Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 h-fit sticky top-24">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Payment Details</h2>
            
            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Phone Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 1234567890"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Total Payable */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">Total Payable:</span>
                <span className="text-2xl font-bold text-blue-600">₹{totalCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Pay & Confirm Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
                isProcessing
                  ? "bg-slate-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                "Pay & Confirm"
              )}
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">
              By confirming, you agree to our rental terms and conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRide;