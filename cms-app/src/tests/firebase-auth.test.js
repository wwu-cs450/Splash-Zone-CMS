/* eslint-env jest */
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import app from "./firebase-test-config.js";

// Connect to the Auth emulator
const auth = getAuth(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });

// Test versions of the auth functions that use the test auth instance
function createUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return user;
    })
    .catch((error) => {
      throw error;
    });
}

function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return user;
    })
    .catch((error) => {
      throw error;
    });
}

// Optional: silence console noise during tests (commented out for debugging)
// const origLog = console.log;
// const origErr = console.error;
// beforeAll(() => {
//   console.log = jest.fn();
//   console.error = jest.fn();
// });
// afterAll(() => {
//   console.log = origLog;
//   console.error = origErr;
// });

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
