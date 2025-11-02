import { db, admin } from "../configs/firebaseAdmin.js";
//import Car from "../models/Car.js"; // keep this if you still use MongoDB for cars

/**
 * @desc  Register or login user using Firebase Auth token
 * @route POST /api/user/firebase-login
 * @access Public
 */
export const firebaseLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No Firebase token provided",
      });
    }

    // ✅ Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decoded;

    // ✅ Firestore user reference
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new Firestore user
      const newUser = {
        firebaseUID: uid,
        email: email || "",
        username: name || "New User",
        image: picture || "",
        role: "user",
        createdAt: new Date(),
      };

      await userRef.set(newUser);

      console.log(`✅ New Firestore user created: ${email}`);

      return res.status(200).json({
        success: true,
        message: "New Firestore user created",
        user: newUser,
      });
    } else {
      console.log(`✅ Existing Firestore user found: ${email}`);

      return res.status(200).json({
        success: true,
        message: "User already exists",
        user: userDoc.data(),
      });
    }
  } catch (error) {
    console.error("🔥 Firebase login error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc  Get logged-in user data
 * @route GET /api/user/data
 * @access Private
 */
export const getUserData = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: userDoc.data() });
  } catch (error) {
    console.error("🔥 Error fetching user data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Get all cars (public route)
 * @route GET /api/user/cars
 * @access Public
 */
// userController.js
export const getCars = async (req, res) => {
  try {
    const userId = req.user.uid; // comes from middleware

    const carsRef = db.collection("cars");
    const snapshot = await carsRef.where("ownerId", "==", userId).get();

    const cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, cars });
  } catch (error) {
    console.error("🔥 Error fetching cars:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




/**
 * @desc Change user role (e.g. from "user" to "owner")
 * @route PUT /api/user/change-role/:uid
 * @access Admin or System-level
 */
export const changeUserRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const { newRole } = req.body;

    if (!uid || !newRole) {
      return res.status(400).json({ success: false, message: "UID and newRole are required" });
    }

    const validRoles = ["user", "owner", "admin"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await userRef.update({ role: newRole, updatedAt: new Date() });

    res.status(200).json({
      success: true,
      message: `User role updated to '${newRole}' successfully`,
    });
  } catch (error) {
    console.error("🔥 Error changing user role:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

