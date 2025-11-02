import React, { useState } from "react";
import { auth } from "../firebaseConfig.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext.jsx";

const Login = () => {
  const { setShowLogin } = useAppContext();
  const [state, setState] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userCredential;

      if (state === "login") {
        // ✅ Firebase login
        userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        toast.success("Login successful!");
      } else {
        // ✅ Firebase registration
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Set display name in Firebase Auth
        await updateProfile(userCredential.user, {
          displayName: formData.name,
        });

        toast.success("Account created successfully!");
      }

      // ✅ Get Firebase ID token
      const token = await userCredential.user.getIdToken();

      // ✅ Send token to backend to sync Firestore user
      await axios.post("/api/user/firebase-login", { token });

      setShowLogin(false);
    } catch (error) {
      console.error("❌ Auth error:", error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) setShowLogin(false);
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
    >
      <form
        onSubmit={handleSubmit}
        className="sm:w-[380px] w-[90%] bg-white rounded-2xl shadow-lg border border-gray-200 text-gray-600 text-sm px-8 py-8 animate-fadeIn"
      >
        <h1 className="text-gray-900 text-3xl font-semibold text-center">
          {state === "login" ? "Login" : "Sign Up"}
        </h1>
        <p className="text-gray-500 text-sm text-center mt-2">
          Please {state === "login" ? "sign in" : "create an account"} to
          continue
        </p>

        {state !== "login" && (
          <div className="flex items-center mt-6 border border-gray-300 h-12 rounded-full pl-5 pr-3 gap-2">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="flex-1 bg-transparent outline-none text-gray-700"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="flex items-center mt-4 border border-gray-300 h-12 rounded-full pl-5 pr-3 gap-2">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            className="flex-1 bg-transparent outline-none text-gray-700"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center mt-4 border border-gray-300 h-12 rounded-full pl-5 pr-3 gap-2">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="flex-1 bg-transparent outline-none text-gray-700"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="mt-5 w-full h-11 rounded-full text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : state === "login"
            ? "Login"
            : "Sign Up"}
        </button>

        <p className="text-gray-500 text-sm mt-4 text-center">
          {state === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-indigo-500 hover:underline"
            onClick={() =>
              setState((prev) => (prev === "login" ? "register" : "login"))
            }
          >
            Click here
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
