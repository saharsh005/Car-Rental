import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings for the logged-in user
  const fetchUserBookings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const bookingsRef = collection(db, "bookings");
      const q = query(bookingsRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      const userBookings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBookings(userBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        Loading your bookings...
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        You don’t have any bookings yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-12 py-10">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      <div className="space-y-8">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex flex-col sm:flex-row items-start sm:items-center bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 gap-6 hover:shadow-md transition"
          >
            {/* Left: Car Image */}
            <div className="flex-shrink-0">
              <img
                src={booking.carImage || "/placeholder-car.jpg"}
                alt={booking.model || "Car"}
                className="w-64 h-44 object-cover rounded-lg border border-gray-100"
              />
            </div>

            {/* Right: Booking Info */}
            <div className="flex flex-col flex-1">
              {/* Top Row: Booking ID + Price */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-gray-900 font-semibold text-base break-all">
                    {booking.carName}
                  </h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    <span className="font-medium text-gray-400">Status :</span>{" "}
                    {booking.status}
                  </p>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  ₹{booking.totalCost || 0}
                </div>
              </div>

              {/* Pickup & Drop Info */}
              <div className="grid grid-cols-2 gap-8 mt-4 text-sm text-gray-700">
                {/* Pickup */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pick up</h4>
                  <p className="flex items-center gap-2 mb-1">
                    📅 {booking.pickupDate}
                  </p>
                </div>

                {/* Drop off */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Drop off</h4>
                  <p className="flex items-center gap-2 mb-1">
                    📅 {booking.returnDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
