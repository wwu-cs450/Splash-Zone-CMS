/* eslint-env jest */
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { deleteApp } from "firebase/app";
import { app } from "../api/firebaseconfig.js";

// Connect to the Firestore emulator using the same app instance that firebase-create-user.js uses
const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8080);

// Now import the actual functions from firebase-create-user.js
// They will use the same db instance we just connected to the emulator
import { createMember } from "../api/firebase-create-user.js";

// Cleanup after all tests to prevent hanging processes
afterAll(async () => {
  // Delete the Firebase app to close all connections
  await deleteApp(app);
});

// Helper function to generate unique user IDs for testing
function uniqId(prefix = "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// Helper function to clean up test documents
async function cleanupTestDoc(userId) {
  try {
    await deleteDoc(doc(db, "users", userId));
  } catch (error) {
    // Ignore errors if document doesn't exist
  }
}

describe("createMember (emulator)", () => {
  test("createMember successfully creates a new user document", async () => {
    const userId = uniqId("create");
    const carInfo = "Toyota Camry 2020";
    const validPayment = true;
    const notes = "Premium member";

    const returnedId = await createMember(userId, carInfo, validPayment, notes);

    expect(returnedId).toBe(userId);

    // Verify the document was created in Firestore
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data()).toEqual({
      car: carInfo,
      validPayment: validPayment,
      notes: notes,
    });

    // Cleanup
    await cleanupTestDoc(userId);
  });

  test("createMember creates document with validPayment as false", async () => {
    const userId = uniqId("nopay");
    const carInfo = "Honda Civic 2019";
    const validPayment = false;
    const notes = "Payment pending";

    await createMember(userId, carInfo, validPayment, notes);

    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data().validPayment).toBe(false);

    // Cleanup
    await cleanupTestDoc(userId);
  });

  test("createMember creates document with empty notes", async () => {
    const userId = uniqId("empty");
    const carInfo = "Ford F-150 2021";
    const validPayment = true;
    const notes = "";

    await createMember(userId, carInfo, validPayment, notes);

    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data().notes).toBe("");

    // Cleanup
    await cleanupTestDoc(userId);
  });

  test("createMember updates existing user document", async () => {
    const userId = uniqId("update");
    const initialCar = "Tesla Model 3";
    const updatedCar = "Tesla Model Y";

    // Create initial document
    await createMember(userId, initialCar, true, "Initial member");

    // Update the document
    await createMember(userId, updatedCar, false, "Updated notes");

    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data()).toEqual({
      car: updatedCar,
      validPayment: false,
      notes: "Updated notes",
    });

    // Cleanup
    await cleanupTestDoc(userId);
  });

  test("createMember handles special characters in data", async () => {
    const userId = uniqId("special");
    const carInfo = "BMW X5 with \"custom\" features & modifications";
    const notes = "Special notes: @#$%^&*()";

    await createMember(userId, carInfo, true, notes);

    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data().car).toBe(carInfo);
    expect(docSnap.data().notes).toBe(notes);

    // Cleanup
    await cleanupTestDoc(userId);
  });

  test("createMember handles long strings", async () => {
    const userId = uniqId("long");
    const longNotes = "A".repeat(1000);

    await createMember(userId, "Car", true, longNotes);

    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data().notes).toBe(longNotes);
    expect(docSnap.data().notes.length).toBe(1000);

    // Cleanup
    await cleanupTestDoc(userId);
  });
});
