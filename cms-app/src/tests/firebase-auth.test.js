/* eslint-env jest */
import {
  getAuth,
  connectAuthEmulator,
} from "firebase/auth";
import firebaseApp from "../api/firebaseconfig.js";

// Connect to the Auth emulator using the same app instance that firebase-auth.js uses
const auth = getAuth(firebaseApp);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });

// Now import the actual functions from firebase-auth.js
// They will use the same auth instance we just connected to the emulator
import { createUser, signIn } from "../api/firebase-auth.js";

// Optional: silence console noise during tests (disabled for ES modules)
// With ES modules, you'd need to import jest functions explicitly
// For now, we'll let console output through

function uniqEmail(prefix = "user") {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;
}

describe("Auth wrappers (emulator)", () => {
  test("createUser returns the Firebase user on success", async () => {
    const email = uniqEmail("create");
    const user = await createUser(email, "secret123");
    expect(user).toBeDefined();
    expect(user.email).toBe(email);
  });

  test("createUser throws when email already exists", async () => {
    const email = uniqEmail("dupe");
    await createUser(email, "secret123");
    await expect(createUser(email, "secret123")).rejects.toMatchObject({
      code: "auth/email-already-in-use",
    });
  });

  test("signIn works after createUser", async () => {
    const email = uniqEmail("login");
    await createUser(email, "secret123");
    const user = await signIn(email, "secret123");
    expect(user.email).toBe(email);
  });

  test("signIn throws on wrong password (rethrows from wrapper)", async () => {
    const email = uniqEmail("wrongpass");
    await createUser(email, "secret123");
    await expect(signIn(email, "not-the-password")).rejects.toMatchObject({
      code: expect.stringMatching(/^auth\/(invalid-credential|wrong-password)$/),
    });
  });
});
