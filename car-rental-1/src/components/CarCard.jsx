import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const CarCard = ({ car }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  return (
    <div className="group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 bg-white">
      {/* Car Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={car.imageUrl}
          alt="Car Image"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {car.isAvailable && (
          <p className="absolute top-4 left-4 bg-green-600 text-white text-xs px-2.5 py-1 rounded-full">
            Available Now
          </p>
        )}

        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
          <span className="font-semibold">
            {currency} {car.pricePerDay}
          </span>
          <span className="text-sm text-white/80"> / day</span>
        </div>
      </div>

      {/* Car Info */}
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-medium">
              {car.brand} {car.model}
            </h3>
            <p className="text-gray-500 text-sm">
              {car.category} • {car.year}
            </p>
          </div>
        </div>

        {/* Car Specs */}
        <div className="mt-4 grid grid-cols-2 gap-y-2 text-gray-600">
          <div className="flex items-center text-sm">
            <img src={assets.users_icon} alt="seating" className="h-4 mr-2" />
            <span>{car.seating_capacity} Seats</span>
          </div>
          <div className="flex items-center text-sm">
            <img src={assets.fuel_icon} alt="fuel" className="h-4 mr-2" />
            <span>{car.fuel_type}</span>
          </div>
          <div className="flex items-center text-sm">
            <img src={assets.car_icon} alt="transmission" className="h-4 mr-2" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center text-sm">
            <img src={assets.location_icon} alt="location" className="h-4 mr-2" />
            <span>{car.location}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => {
              navigate(`/car-details/${car.id}`);
              window.scrollTo(0, 0);
            }}
            className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Details
          </button>
          <button
            onClick={() => {
              navigate(`/book-ride/${car.id}`);
              window.scrollTo(0, 0);
            }}
            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Book Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
