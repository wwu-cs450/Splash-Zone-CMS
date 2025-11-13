/* eslint-env jest */
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { deleteApp } from "firebase/app";
import { app } from "../api/firebaseconfig.js";

// Connect to the Firestore emulator using the same app instance
const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8080);

// Import all functions from firebase-users.js
import {
  createMember,
  getMember,
  getAllMembers,
  getMembersByPaymentStatus,
  updateMember,
  deleteMember,
} from "../api/firebase-crud.js";

// Cleanup after all tests to prevent hanging processes
afterAll(async () => {
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

describe("User CRUD Operations (emulator)", () => {
  describe("createMember", () => {
    test("successfully creates a new user document", async () => {
      const userId = uniqId("create");
      const carInfo = "Toyota Camry 2020";
      const validPayment = true;
      const notes = "Premium member";

      const returnedId = await createMember(userId, carInfo, validPayment, notes);

      expect(returnedId).toBe(userId);

      // Verify using getMember
      const user = await getMember(userId);
      expect(user).toEqual({
        id: userId,
        car: carInfo,
        validPayment: validPayment,
        notes: notes,
      });

      await cleanupTestDoc(userId);
    });

    test("overwrites existing user document", async () => {
      const userId = uniqId("overwrite");

      await createMember(userId, "Old Car", true, "Old notes");
      await createMember(userId, "New Car", false, "New notes");

      const user = await getMember(userId);
      expect(user.car).toBe("New Car");
      expect(user.validPayment).toBe(false);
      expect(user.notes).toBe("New notes");

      await cleanupTestDoc(userId);
    });
  });

  describe("getMember", () => {
    test("retrieves an existing user document", async () => {
      const userId = uniqId("get");
      const carInfo = "Honda Accord 2021";
      const validPayment = true;
      const notes = "Test user";

      await createMember(userId, carInfo, validPayment, notes);

      const user = await getMember(userId);

      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
      expect(user.car).toBe(carInfo);
      expect(user.validPayment).toBe(validPayment);
      expect(user.notes).toBe(notes);

      await cleanupTestDoc(userId);
    });

    test("returns null for non-existent user", async () => {
      const userId = uniqId("nonexistent");
      const user = await getMember(userId);

      expect(user).toBeNull();
    });
  });

  describe("getAllMembers", () => {
    test("retrieves all user documents", async () => {
      const userId1 = uniqId("all1");
      const userId2 = uniqId("all2");
      const userId3 = uniqId("all3");

      await createMember(userId1, "Car 1", true, "Notes 1");
      await createMember(userId2, "Car 2", false, "Notes 2");
      await createMember(userId3, "Car 3", true, "Notes 3");

      const allMembers = await getAllMembers();

      // Should include at least our 3 test users
      expect(allMembers.length).toBeGreaterThanOrEqual(3);

      const testUsers = allMembers.filter(
        (u) => u.id === userId1 || u.id === userId2 || u.id === userId3
      );
      expect(testUsers.length).toBe(3);

      await cleanupTestDoc(userId1);
      await cleanupTestDoc(userId2);
      await cleanupTestDoc(userId3);
    });

    test("returns empty array when no users exist", async () => {
      // This test assumes emulator is cleared, but may have other users
      const allMembers = await getAllMembers();
      expect(Array.isArray(allMembers)).toBe(true);
    });
  });

  describe("getMembersByPaymentStatus", () => {
    test("retrieves users with valid payment", async () => {
      const userId1 = uniqId("valid1");
      const userId2 = uniqId("valid2");
      const userId3 = uniqId("invalid");

      await createMember(userId1, "Car 1", true, "Valid payment");
      await createMember(userId2, "Car 2", true, "Valid payment");
      await createMember(userId3, "Car 3", false, "Invalid payment");

      const validMembers = await getMembersByPaymentStatus(true);

      const testUsers = validMembers.filter(
        (u) => u.id === userId1 || u.id === userId2
      );
      expect(testUsers.length).toBe(2);

      // Should not include the invalid payment user
      const invalidUser = validMembers.find((u) => u.id === userId3);
      expect(invalidUser).toBeUndefined();

      await cleanupTestDoc(userId1);
      await cleanupTestDoc(userId2);
      await cleanupTestDoc(userId3);
    });

    test("retrieves users with invalid payment", async () => {
      const userId1 = uniqId("inv1");
      const userId2 = uniqId("inv2");
      const userId3 = uniqId("val");

      await createMember(userId1, "Car 1", false, "Invalid payment");
      await createMember(userId2, "Car 2", false, "Invalid payment");
      await createMember(userId3, "Car 3", true, "Valid payment");

      const invalidMembers = await getMembersByPaymentStatus(false);

      const testUsers = invalidMembers.filter(
        (u) => u.id === userId1 || u.id === userId2
      );
      expect(testUsers.length).toBe(2);

      await cleanupTestDoc(userId1);
      await cleanupTestDoc(userId2);
      await cleanupTestDoc(userId3);
    });
  });

  describe("updateMember", () => {
    test("updates specific fields of a user", async () => {
      const userId = uniqId("update");

      await createMember(userId, "Original Car", true, "Original notes");

      await updateMember(userId, {
        car: "Updated Car",
        notes: "Updated notes",
      });

      const user = await getMember(userId);
      expect(user.car).toBe("Updated Car");
      expect(user.notes).toBe("Updated notes");
      expect(user.validPayment).toBe(true); // Should remain unchanged

      await cleanupTestDoc(userId);
    });

    test("updates only one field", async () => {
      const userId = uniqId("partial");

      await createMember(userId, "Car", true, "Notes");

      await updateMember(userId, {
        validPayment: false,
      });

      const user = await getMember(userId);
      expect(user.car).toBe("Car");
      expect(user.notes).toBe("Notes");
      expect(user.validPayment).toBe(false);

      await cleanupTestDoc(userId);
    });

    test("throws error when updating non-existent user", async () => {
      const userId = uniqId("noexist");

      await expect(
        updateMember(userId, { car: "New Car" })
      ).rejects.toThrow(`User with ID ${userId} does not exist`);
    });
  });

  describe("deleteMember", () => {
    test("deletes an existing user document", async () => {
      const userId = uniqId("delete");

      await createMember(userId, "Car", true, "Notes");

      // Verify it exists
      let user = await getMember(userId);
      expect(user).toBeDefined();

      // Delete it
      const deletedId = await deleteMember(userId);
      expect(deletedId).toBe(userId);

      // Verify it's gone
      user = await getMember(userId);
      expect(user).toBeNull();
    });

    test("throws error when deleting non-existent user", async () => {
      const userId = uniqId("nothere");

      await expect(deleteMember(userId)).rejects.toThrow(
        `User with ID ${userId} does not exist`
      );
    });
  });

  describe("Integration tests", () => {
    test("complete CRUD workflow", async () => {
      const userId = uniqId("workflow");

      // Create
      await createMember(userId, "Toyota", true, "New customer");
      let user = await getMember(userId);
      expect(user.car).toBe("Toyota");

      // Update
      await updateMember(userId, { car: "Honda", notes: "Regular customer" });
      user = await getMember(userId);
      expect(user.car).toBe("Honda");
      expect(user.notes).toBe("Regular customer");

      // Read from list
      const allMembers = await getAllMembers();
      const foundUser = allMembers.find((u) => u.id === userId);
      expect(foundUser).toBeDefined();

      // Delete
      await deleteMember(userId);
      user = await getMember(userId);
      expect(user).toBeNull();
    });

    test("query after multiple operations", async () => {
      const userId1 = uniqId("query1");
      const userId2 = uniqId("query2");

      // Create both with valid payment
      await createMember(userId1, "Car 1", true, "Notes 1");
      await createMember(userId2, "Car 2", true, "Notes 2");

      // Update one to invalid payment
      await updateMember(userId2, { validPayment: false });

      // Query for valid payments
      const validMembers = await getMembersByPaymentStatus(true);
      const testValidUsers = validMembers.filter((u) => u.id === userId1);
      expect(testValidUsers.length).toBe(1);

      // Query for invalid payments
      const invalidMembers = await getMembersByPaymentStatus(false);
      const testInvalidUsers = invalidMembers.filter((u) => u.id === userId2);
      expect(testInvalidUsers.length).toBe(1);

      await cleanupTestDoc(userId1);
      await cleanupTestDoc(userId2);
    });
  });
});
