// middleware/auth.js
import {admin} from "../configs/firebaseAdmin.js";
import { db } from "../configs/firebaseAdmin.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔐 Incoming Authorization Header:", authHeader);

    // ✅ Verify token
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("✅ Decoded Token:", decoded);

    // ✅ Get user from Firestore
    const userRef = db.collection("users").doc(decoded.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log("❌ User not found in Firestore for UID:", decoded.uid);
      return res.status(401).json({ success: false, message: "User not found in Firestore" });
    }

    req.user = { uid: decoded.uid, ...userDoc.data() };
    next();

  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default protect;
