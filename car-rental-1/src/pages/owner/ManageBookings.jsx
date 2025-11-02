import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { collection, query, where, getDocs, getDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch bookings belonging to current owner
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("Please log in as an owner to view bookings.");
          return;
        }

        const q = query(collection(db, "bookings"), where("ownerId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const bookingData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBookings(bookingData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  // ✅ Handle cancel booking
  const handleAction = async (id, action) => {
  try {
        if (action === "cancel") {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        // Step 1: Get booking data
        const bookingRef = doc(db, "bookings", id);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
          alert("Booking not found!");
          return;
        }

        const bookingData = bookingSnap.data();
        const { carId, pickupDate, returnDate } = bookingData;

        // Step 2: Delete booking
        await deleteDoc(bookingRef);
        setBookings((prev) => prev.filter((b) => b.id !== id));

        // Step 3: Fetch car using field `id`
        const carsRef = collection(db, "cars");
        const q = query(carsRef, where("id", "==", carId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.warn("Car not found for ID:", carId);
          return;
        }

        const carDoc = querySnapshot.docs[0];
        const carRef = doc(db, "cars", carDoc.id);
        const carData = carDoc.data();
        const existingUnavailable = carData.unavailableDates || [];

        // Step 4: Filter out removed date range
        const updatedUnavailable = existingUnavailable.filter(
          (range) => !(range.start === pickupDate && range.end === returnDate)
        );

        // Step 5: Update car’s unavailableDates
        await updateDoc(carRef, { unavailableDates: updatedUnavailable });

        alert("Booking cancelled and unavailable dates removed!");
      }


    else if (action === "view") {
      alert(`View details of booking: ${id}`);
    }

    else if (action === "status") {
      const newStatus = prompt("Enter new status (Confirmed, Pending, Completed):");
      if (newStatus) {
        const bookingRef = doc(db, "bookings", id);
        await updateDoc(bookingRef, { status: newStatus });
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
        alert("Status updated successfully!");
      }
    }
  } catch (err) {
    console.error("Error updating booking:", err);
    alert("Something went wrong while updating booking!");
  } finally {
    setDropdownOpen(null);
  }
};


  const getStatusStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Completed":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-500">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 flex justify-center">
      <div className="bg-white shadow-sm rounded-xl p-8 w-full max-w-5xl">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Manage Bookings</h2>
          <p className="text-gray-500 text-sm mt-1">
            Track all customer bookings, approve or cancel requests, and manage booking statuses.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-gray-700 text-sm font-semibold">
              <tr>
                <th className="text-left py-3 px-4">Car</th>
                <th className="text-left py-3 px-4">Date Range</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 flex items-center space-x-4">
                      <img
                        src={booking.carImage}
                        alt={booking.carName}
                        className="w-14 h-10 rounded-lg object-cover"
                      />
                      <p className="font-medium text-gray-800">{booking.carName}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {booking.pickupDate} → {booking.returnDate}
                    </td>
                    <td className="py-4 px-4 text-gray-700">₹{booking.totalCost}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center relative">
                      <button
                        onClick={() => toggleDropdown(booking.id)}
                        className="flex items-center justify-center w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                      >
                        Manage
                        <ChevronDown size={16} className="ml-1 text-gray-500" />
                      </button>

                      {dropdownOpen === booking.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => handleAction(booking.id, "cancel")}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAction(booking.id, "view")}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleAction(booking.id, "status")}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Update Status
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-gray-500 py-6 italic"
                  >
                    No bookings found for your cars.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
