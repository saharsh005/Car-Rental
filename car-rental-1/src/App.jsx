import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import BookRide from "./pages/BookRide";
import MyBookings from "./pages/MyBookings";
import Footer from "./components/Footer";
import Layout from "./pages/owner/layout";
import Dashboard from "./pages/owner/Dashboard";
import ManageCars from "./pages/owner/ManageCars";
import AddCar from "./pages/owner/AddCar";
import ManageBookings from "./pages/owner/ManageBookings";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "./context/AppContext.jsx";

const App = () => {
  const { showLogin } = useAppContext();
  const isOwner = useLocation().pathname.includes("/owner");

  return (
    <>
      {/* ✅ Toast Notification Container */}
      <ToastContainer position="top-center" autoClose={2000} />

      {/* ✅ Login Modal */}
      {showLogin && <Login />}

      {/* ✅ Hide Navbar & Footer on Owner Pages */}
      {!isOwner && <Navbar />}

      <Routes>
        {/* ---------------------- USER SIDE ---------------------- */}
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/car-details/:id" element={<CarDetails />} />
        <Route path="/book-ride/:id" element={<BookRide />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        {/* ---------------------- OWNER SIDE ---------------------- */}
        <Route path="/owner/*" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="manage-cars" element={<ManageCars />} />
          <Route path="add-car" element={<AddCar />} />
          <Route path="manage-bookings" element={<ManageBookings />} />
        </Route>
      </Routes>

      {!isOwner && <Footer />}
    </>
  );
};

export default App;
