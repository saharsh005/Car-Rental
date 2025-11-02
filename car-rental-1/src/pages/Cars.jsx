import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import CarCard from "../components/CarCard";
import { useLocation } from "react-router-dom";

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: [],
    transmission: [],
    minPrice: "",
    maxPrice: "",
  });

  // ✅ Get search data passed from Hero.jsx
  const location = useLocation();
  const { location: selectedCity, pickupDate, returnDate } = location.state || {};

  // ✅ Helper: Check if date ranges overlap
  const isCarAvailable = (carUnavailableDates, pickupDate, returnDate) => {
    if (!carUnavailableDates || carUnavailableDates.length === 0) return true;

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    return !carUnavailableDates.some((date) => {
      const d = new Date(date);
      return d >= start && d <= end; // booked during selected range
    });
  };

  // ✅ Fetch cars with location & filters
  const fetchCars = async (applyFilters = false) => {
    setLoading(true);
    try {
      const carsRef = collection(db, "cars");
      let whereClauses = [];

      // Location filter if provided
      if (selectedCity) {
        whereClauses.push(where("location", "==", selectedCity));
      }

      // Category & transmission filters
      if (filters.category.length > 0)
        whereClauses.push(where("category", "in", filters.category));
      if (filters.transmission.length > 0)
        whereClauses.push(where("transmission", "in", filters.transmission));

      // Build query
      let q = carsRef;
      if (whereClauses.length > 0) q = query(carsRef, ...whereClauses);

      // Fetch cars
      const querySnapshot = await getDocs(q);
      let carList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ Date availability filter (client-side)
      if (pickupDate && returnDate) {
        carList = carList.filter((car) =>
          isCarAvailable(car.unavailableDates, pickupDate, returnDate)
        );
      }

      // ✅ Price filtering (client-side)
      if (applyFilters && (filters.minPrice || filters.maxPrice)) {
        carList = carList.filter((car) => {
          const price = parseFloat(car.pricePerDay);
          const min = parseFloat(filters.minPrice || 0);
          const max = parseFloat(filters.maxPrice || Infinity);
          return price >= min && price <= max;
        });
      }

      setCars(carList);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch cars when city/dates change
  useEffect(() => {
    fetchCars();
  }, [selectedCity, pickupDate, returnDate]);

  // ✅ Filter change handler
  const handleFilterChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "category" || name === "transmission") {
      setFilters((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((item) => item !== value),
      }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Apply filters
  const handleApplyFilters = () => {
    fetchCars(true);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar Filters */}
      <div className="w-1/4 p-4 bg-white shadow-md rounded-lg m-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Filters</h2>

        {/* Category */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Type</h3>
          {["SUV", "Sedan", "Hatchback"].map((type) => (
            <label key={type} className="block text-gray-600">
              <input
                type="checkbox"
                name="category"
                value={type}
                onChange={handleFilterChange}
                className="mr-2"
              />
              {type}
            </label>
          ))}
        </div>

        {/* Transmission */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Transmission</h3>
          {["Automatic", "Manual"].map((type) => (
            <label key={type} className="block text-gray-600">
              <input
                type="checkbox"
                name="transmission"
                value={type}
                onChange={handleFilterChange}
                className="mr-2"
              />
              {type}
            </label>
          ))}
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Price Range (₹/day)</h3>
          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="border p-1 rounded w-1/2"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="border p-1 rounded w-1/2"
            />
          </div>
        </div>

        <button
          onClick={handleApplyFilters}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Apply
        </button>
      </div>

      {/* Cars Grid */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800">
          {selectedCity
            ? `Available Cars in ${selectedCity}`
            : "Available Cars"}
        </h1>

        {loading ? (
          <div className="text-center text-gray-600">Loading cars...</div>
        ) : cars.length === 0 ? (
          <div className="text-center text-gray-500">
            No cars available for the selected filters or dates.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cars;
