import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { FaEdit, FaTrash } from "react-icons/fa";

const ManageCars = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, "cars"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCars(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      await deleteDoc(doc(db, "cars", id));
    }
  };

  const handleEdit = (car) => {
    setSelectedCar(car);
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedCar?.id) return;

    try {
      const carRef = doc(db, "cars", selectedCar.id);
      await updateDoc(carRef, {
        brand: selectedCar.brand,
        pricePerDay: selectedCar.pricePerDay,
        location: selectedCar.location,
        isAvailable: selectedCar.isAvailable,
      });
      setIsEditModalOpen(false);
      setSelectedCar(null);
    } catch (error) {
      console.error("Error updating car:", error);
    }
  };

  if (loading)
    return <div className="text-center mt-8 text-gray-500">Loading cars...</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">All Vehicles</h2>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Price/Day</th>
              <th className="p-3 text-left">Availability</th>
              <th className="p-3 text-center">Edit</th>
              <th className="p-3 text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id} className="border-t hover:bg-gray-50 transition-all">
                <td className="p-3">
                  <img
                    src={car.imageUrl}
                    alt={car.brand}
                    className="w-20 h-14 rounded-lg object-cover"
                  />
                </td>
                <td className="p-3 font-medium text-gray-800">
                  {car.brand} {car.model}
                </td>
                <td className="p-3 text-gray-600">{car.location}</td>
                <td className="p-3 text-gray-600">₹{car.pricePerDay}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      car.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {car.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleEdit(car)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDelete(car.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}

            {cars.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No cars found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Edit Car</h3>

            <div className="space-y-3">
              <input
                type="text"
                value={selectedCar.brand}
                onChange={(e) =>
                  setSelectedCar({ ...selectedCar, brand: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Car Name"
              />
              <input
                type="text"
                value={selectedCar.location}
                onChange={(e) =>
                  setSelectedCar({ ...selectedCar, location: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Location"
              />
              <input
                type="number"
                value={selectedCar.pricePerDay}
                onChange={(e) =>
                  setSelectedCar({ ...selectedCar, pricePerDay: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Price Per Day"
              />
              <select
                value={selectedCar.isAvailable ? "true" : "false"}
                onChange={(e) =>
                  setSelectedCar({
                    ...selectedCar,
                    isAvailable: e.target.value === "true",
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCars;
