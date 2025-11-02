import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const statusColor = {
  Confirmed: "bg-green-100 text-green-700 border-green-200",
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  Completed: "bg-blue-100 text-blue-700 border-blue-200",
};

const OwnerDashboard = () => {
  const [data, setData] = useState({
    totalCars: 0,
    totalEarnings: 0,
    activeBookings: 0,
    cancelledBookings: 0,
    recentBookings: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch owner's cars and related bookings
  const fetchOwnerDashboardData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // 1️⃣ Fetch cars owned by this owner (match using ownerId)
      const carsRef = collection(db, "cars");
      const carsQuery = query(carsRef, where("ownerId", "==", user.uid));
      const carsSnap = await getDocs(carsQuery);
      const ownedCars = carsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const carIds = ownedCars.map((car) => car.id);

      // 2️⃣ Fetch bookings for those cars (only if carIds not empty)
      let bookings = [];
      if (carIds.length > 0) {
        const bookingsRef = collection(db, "bookings");
        const bookingsQuery = query(bookingsRef, where("carId", "in", carIds));
        const bookingsSnap = await getDocs(bookingsQuery);
        bookings = bookingsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }

      // 3️⃣ Compute stats
      const totalEarnings = bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
      const activeBookings = bookings.filter(
        (b) => b.status === "Confirmed" || b.status === "Pending"
      ).length;
      const cancelledBookings = bookings.filter(
        (b) => b.status === "Cancelled"
      ).length;

      // 4️⃣ Sort and limit
      const recentBookings = bookings
        .sort((a, b) => new Date(b.pickupDate) - new Date(a.pickupDate))
        .slice(0, 5);

      // 5️⃣ Update state
      setData({
        totalCars: ownedCars.length,
        totalEarnings,
        activeBookings,
        cancelledBookings,
        recentBookings,
      });
    } catch (error) {
      console.error("Error fetching owner dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    { 
      title: "My Cars", 
      value: data.totalCars,
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    { 
      title: "Total Earnings", 
      value: `₹${data.totalEarnings.toLocaleString()}`,
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    { 
      title: "Active Bookings", 
      value: data.activeBookings,
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    { 
      title: "Cancelled", 
      value: data.cancelledBookings,
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    },
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 overflow-auto">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Owner Dashboard</h1>
          <p className="text-slate-600">View insights and bookings related to your cars.</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-slate-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-xl`}>
                  {card.icon}
                </div>
              </div>
              <div className="text-sm text-slate-600 font-medium mb-1">{card.title}</div>
              <div className={`text-3xl font-bold ${card.textColor}`}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Recent Bookings</h2>
              <p className="text-slate-600 text-sm">Latest bookings for your cars</p>
            </div>
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold">
              {data.recentBookings.length} Total
            </div>
          </div>

          {data.recentBookings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-500 font-medium">No recent bookings for your cars yet.</p>
              <p className="text-slate-400 text-sm mt-1">Bookings will appear here once customers rent your cars.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={booking.carImage || "/placeholder-car.jpg"}
                      alt={booking.carName || "Car"}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1">
                        {booking.carName || `${booking.brand} ${booking.model}`}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {booking.pickupDate} → {booking.returnDate}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {booking.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-1">Total</div>
                      <div className="text-lg font-bold text-slate-900">₹{booking.totalCost.toLocaleString()}</div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
                        statusColor[booking.status] || "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;