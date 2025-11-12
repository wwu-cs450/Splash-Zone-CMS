import { doc, setDoc } from "firebase/firestore"; 
import { db } from "./firebaseconfig";

// Main function to create or update the user document with ID "A123"
async function createMember(id, car, validPayment, notes) {
  const userId = id
  try {
    const userData = {
      car: car,
      validPayment: validPayment,
      notes: notes
    }
    await setDoc(doc(db, "users", userId), userData);
    return userId; // Return the generated user ID if needed
  } catch (error) {
    console.error("❌ Error creating document:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    throw error;
  }
}

export { createMember };
