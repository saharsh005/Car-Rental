import React, { useState } from "react";
import { assets, ownerMenuLinks } from "../../assets/assets";
import { NavLink, useLocation } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const Sidebar = () => {
  const { user, logout } = useAppContext();
  const location = useLocation();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // Update profile preview (local only)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="relative h-screen flex flex-col bg-white border-r border-slate-200 w-64">
      {/* User Profile Section */}
      <div className="p-6 border-b border-slate-200">
        <label
          htmlFor="image"
          className="relative flex flex-col items-center cursor-pointer group"
        >
          <div className="relative">
            <img
              src={
                preview ||
                user?.photoURL ||
                "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300"
              }
              alt="user"
              className="h-20 w-20 rounded-full object-cover border-4 border-slate-100 shadow-sm"
            />
            <input
              type="file"
              id="image"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-900">
            {user?.displayName || user?.email?.split("@")[0] || "Owner"}
          </p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </label>

        {/* Save button for image preview */}
        {image && (
          <button
            onClick={() => {
              alert("Image updated locally! (Cloud upload can be added later)");
              setImage(null);
            }}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </button>
        )}
      </div>

      {/* Menu Links */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {ownerMenuLinks.map((link, index) => {
            const isActive = link.path === location.pathname;
            return (
              <NavLink
                key={index}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <img
                  src={isActive ? link.coloredIcon : link.icon}
                  alt={link.name}
                  className="w-5 h-5"
                />
                <span>{link.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-6 bg-blue-600 rounded-full"></div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;