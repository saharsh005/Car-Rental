import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cars, setCars] = useState([]);

  const currency = import.meta.env.VITE_CURRENCY;
  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

  // 🔹 Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Optionally sync with backend for extra info (like role)
        try {
          const token = await firebaseUser.getIdToken();
          const { data } = await axios.post("/api/user/firebase-login", { token });
          if (data.success && data.user.role === "owner") setIsOwner(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setUser(null);
        setIsOwner(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Fetch cars
  const fetchCars = async () => {
  try {
    if (!user) return; // wait until Firebase Auth is ready

    const token = await user.getIdToken();

    const { data } = await axios.get("/api/user/cars", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.success) {
      setCars(data.cars);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error("🔥 Error fetching cars:", error);
    toast.error("Failed to load cars");
  }
};




  // 🔹 Firebase logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsOwner(false);
    toast.success("You have been logged out");
    navigate("/");
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const value = {
    navigate,
    currency,
    axios,
    user,
    setUser,
    isOwner,
    setIsOwner,
    showLogin,
    setShowLogin,
    logout,
    fetchCars,
    cars,
    setCars,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
