import React, { useState } from "react";
import { db, auth } from "../../firebaseConfig"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const AddCar = () => {
  const [car, setCar] = useState({
    brand: "",
    model: "",
    year: "",
    pricePerDay: "",
    category: "",
    transmission: "",
    fuel_type: "",
    seating_capacity: "",
    location: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCar((prev) => ({ ...prev, [name]: value }));
  };

  // handle image selection + preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCar((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // upload to cloudinary
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Add_Car");
    formData.append("folder", "cars");

    const res = await fetch(`https://api.cloudinary.com/v1_1/dduymbxjb/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return; // prevent double submission

    setUploading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please log in first!");
        setUploading(false);
        return;
      }

      let imageUrl = "";
      if (car.image) {
        imageUrl = await handleImageUpload(car.image);
      }

      const { image, ...rest } = car;
      const payload = {
        id: uuidv4(),
        ownerId: user.uid,
        ...rest,
        pricePerDay: Number(car.pricePerDay),
        seating_capacity: Number(car.seating_capacity),
        imageUrl,
        createdAt: serverTimestamp(),
        isAvailable: true,
      };

      // ✅ only one Firestore write
      await addDoc(collection(db, "cars"), payload);

      alert("✅ Car listed successfully!");

      // reset form
      setCar({
        brand: "",
        model: "",
        year: "",
        pricePerDay: "",
        category: "",
        transmission: "",
        fuel_type: "",
        seating_capacity: "",
        location: "",
        description: "",
        image: null,
      });
      setPreview(null);
    } catch (err) {
      console.error("Error adding car:", err);
      alert("❌ Failed to list car. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 ">
      <div className="bg-white shadow-sm rounded-xl p-8 w-full max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Add New Car</h2>
          <p className="text-gray-500 text-sm mt-1">
            Fill in details to list a new car for booking, including pricing,
            availability, and car specifications.
          </p>
        </div>

        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center mb-6 cursor-pointer hover:border-blue-500 transition relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {preview ? (
            <img
              src={preview}
              alt="Car preview"
              className="w-40 h-28 object-cover rounded-lg"
            />
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="text-gray-600 text-sm font-medium">
                Upload a picture of your car
              </p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Brand and Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium">Brand</label>
              <input
                type="text"
                name="brand"
                value={car.brand}
                onChange={handleChange}
                placeholder="e.g. BMW, Audi..."
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium">Model</label>
              <input
                type="text"
                name="model"
                value={car.model}
                onChange={handleChange}
                placeholder="e.g. X5, Model S..."
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Year, Price, Category */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium">Year</label>
              <input
                type="number"
                name="year"
                value={car.year}
                onChange={handleChange}
                placeholder="2025"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium">
                Daily Price (₹)
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={car.pricePerDay}
                onChange={handleChange}
                placeholder="100"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={car.category}
                onChange={handleChange}
                placeholder="SUV"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Transmission, Fuel, Seating */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium">
                Transmission
              </label>
              <input
                type="text"
                name="transmission"
                value={car.transmission}
                onChange={handleChange}
                placeholder="Automatic"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium">
                Fuel Type
              </label>
              <input
                type="text"
                name="fuel_type"
                value={car.fuel_type}
                onChange={handleChange}
                placeholder="Petrol"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium">
                Seating Capacity
              </label>
              <input
                type="number"
                name="seating_capacity"
                value={car.seating_capacity}
                onChange={handleChange}
                placeholder="5"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-gray-700 text-sm font-medium">Location</label>
            <input
              type="text"
              name="location"
              value={car.location}
              onChange={handleChange}
              placeholder="e.g. Pune, Maharashtra"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-gray-700 text-sm font-medium">
              Description
            </label>
            <textarea
              name="description"
              value={car.description}
              onChange={handleChange}
              placeholder="Describe your car, its condition..."
              rows={4}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            {uploading ? "Listing..." : "✓ List Your Car"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCar;
