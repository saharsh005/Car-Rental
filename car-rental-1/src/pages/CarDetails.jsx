import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      console.log("Fetching car by field id:", id);
      try {
        const q = query(collection(db, "cars"), where("id", "==", id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const carDoc = querySnapshot.docs[0];
          console.log("Car found:", carDoc.data());
          setCar({ id: carDoc.id, ...carDoc.data() });
        } else {
          console.warn("Car not found in Firestore for field id:", id);
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

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
            <span className="font-medium">Back to listing</span>
          </button>
        </div>
      </div>

      {/* Main Content - Single Card */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-12 h-full">
            {/* LEFT - Image Section */}
            <div className="lg:col-span-3 relative bg-slate-50 flex items-center justify-center p-6">
              <div className="relative w-full">
                <img
                  src={car.imageUrl}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-auto object-contain rounded-lg"
                />
                <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                  <span className={`inline-flex items-center gap-2 font-semibold text-xs ${car.isAvailable ? "text-green-600" : "text-red-500"}`}>
                    <span className={`w-2 h-2 rounded-full ${car.isAvailable ? "bg-green-600" : "bg-red-500"} animate-pulse`}></span>
                    {car.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>

            {/* CENTER - Details Section */}
            <div className="lg:col-span-6 p-8 flex flex-col">
              {/* Car Title */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {car.brand} {car.model}
                </h1>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {car.year}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {car.category}
                  </span>
                </div>
              </div>

              {/* Specifications */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Seating</p>
                      <p className="text-sm font-bold text-slate-900">{car.seating_capacity} Seats</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Fuel Type</p>
                      <p className="text-sm font-bold text-slate-900">{car.fuel_type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Transmission</p>
                      <p className="text-sm font-bold text-slate-900">{car.transmission}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Location</p>
                      <p className="text-sm font-bold text-slate-900">{car.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-3">Description</h2>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {car.description || "No description available for this vehicle."}
                </p>
              </div>
            </div>

            {/* RIGHT - Book Me Ride Card */}
            <div className="lg:col-span-3 bg-gradient-to-br from-blue-600 to-blue-700 p-8 flex flex-col justify-center">
              <div className="text-center mb-6">
                <p className="text-blue-200 text-sm font-medium mb-2">Starting from</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-white">₹{car.pricePerDay}</span>
                  <span className="text-lg text-blue-200">/ day</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/book-ride/${id}`)}
                className="w-full bg-white text-blue-600 py-3.5 rounded-xl font-bold text-base hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-6"
              >
                Book Me Ride
              </button>

              <div className="space-y-3 text-sm text-blue-100">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Instant booking confirmation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>24/7 roadside assistance</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Free cancellation up to 24h</span>
                </div>
              </div>

              <p className="text-xs text-blue-200 text-center mt-6 pt-4 border-t border-blue-500">
                * Final price includes taxes and insurance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;