import {admin} from "./firebaseAdmin.js";
import { getFirestore } from "firebase-admin/firestore";

let db;

const connectDB = async () => {
  try {
    if (!db) {
      db = getFirestore(admin.app());
      console.log("✅ Firestore database connected successfully");
    }
    return db;
  } catch (error) {
    console.error("🔥 Firestore connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
