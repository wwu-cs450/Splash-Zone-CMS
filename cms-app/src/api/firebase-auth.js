import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import app from "./firebaseconfig";

const auth = getAuth(app);

function createUser(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // console.log("✅ User created successfully:", user.email);
            return user;
        })
        .catch((error) => {
            // const errorCode = error.code;
            // const errorMessage = error.message;
            // console.error("❌ Signup error:", errorCode, errorMessage);
            throw error; // Re-throw the error so it can be caught in the form
        });
}

function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // console.log("✅ User signed in:", user.email);
            return user;
        })
        .catch((error) => {
            // const errorCode = error.code;
            // const errorMessage = error.message;
            // console.error("❌ Sign-in error:", errorCode, errorMessage);
            throw error;
        });
}

export { createUser, signIn };
