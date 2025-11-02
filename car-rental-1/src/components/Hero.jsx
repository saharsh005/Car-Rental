import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch cities from Firestore
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cars"));
        const allCities = querySnapshot.docs.map(
          (doc) => doc.data().location || doc.data().city
        );

        const uniqueCities = [...new Set(allCities.filter(Boolean))];
        setCities(uniqueCities);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, []);

  // ✅ Search available cars
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!pickupLocation || !pickupDate || !returnDate) {
      alert("Please select location, pickup date, and return date!");
      return;
    }

    try {
      const querySnapshot = await getDocs(collection(db, "cars"));
      const carsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ Filter cars by location and availability
      const availableCars = carsData.filter((car) => {
        const locationMatch =
          car.location?.toLowerCase() === pickupLocation.toLowerCase();

        const unavailableDates = car.unavailableDates || [];

        // Convert pickup/return range to array of dates
        const selectedDates = getDatesInRange(pickupDate, returnDate);

        // Check if any selected date overlaps unavailableDates
        const isAvailable = !selectedDates.some((date) =>
          unavailableDates.includes(date)
        );

        return locationMatch && isAvailable;
      });

      if (availableCars.length === 0) {
        alert("No cars available for these dates at this location!");
        return;
      }

      // ✅ Navigate to cars page with search results
      navigate("/cars", {
        state: {
          cars: availableCars,
          location: pickupLocation,
          pickupDate,
          returnDate,
        },
      });
    } catch (error) {
      console.error("Error fetching available cars:", error);
      alert("Something went wrong while searching for cars.");
    }
  };

  // ✅ Helper function: get all dates in a range
  const getDatesInRange = (start, end) => {
    const dateArray = [];
    let currentDate = new Date(start);
    const stopDate = new Date(end);

    while (currentDate <= stopDate) {
      dateArray.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-14 bg-light text-center">
      <h1 className="text-4xl md:text-5xl font-semibold">Luxury cars on Rent</h1>

      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg md:rounded-full w-full max-w-80 md:max-w-200 bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)]"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-10 md:ml-8">
          {/* Location */}
          <div className="flex flex-col items-start gap-2">
            <select
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Pickup Location</option>
              {cities.length > 0 ? (
                cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))
              ) : (
                <option disabled>Loading cities...</option>
              )}
            </select>
            <p className="px-1 text-sm text-gray-500">
              {pickupLocation || "Please select location"}
            </p>
          </div>

          {/* Pickup Date */}
          <div className="flex flex-col items-start gap-2">
            <label htmlFor="pickup-date">Pick-up Date</label>
            <input
              type="date"
              id="pickup-date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="text-sm text-gray-500 border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Return Date */}
          <div className="flex flex-col items-start gap-2">
            <label htmlFor="return-date">Return Date</label>
            <input
              type="date"
              id="return-date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={pickupDate}
              className="text-sm text-gray-500 border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-9 py-3 max-sm:mt-4 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer"
        >
          <img src={assets.search_icon} alt="search" className="brightness-200" />
          Search
        </button>
      </form>

      <img src={assets.main_car} alt="car" className="max-h-74" />
    </div>
  );
};

export default Hero;
