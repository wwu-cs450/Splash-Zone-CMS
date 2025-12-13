# Firebase API Documentation

This document provides an overview and details for the functions used to interact with Firebase Authentication and Firestore Database in the application.

---

## Authentication Functions (`firebase-auth.js`)

These functions handle user creation and sign-in using Firebase Authentication with email and password.

### `createUser(email, password)`

Creates a new user account with the specified email and password.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `email` | `string` | The user's email address. |
| `password` | `string` | The user's desired password. |

#### Returns
* `Promise<User>`: A promise that resolves with the Firebase `User` object upon successful creation.
* **Rejects** with a Firebase error object if creation fails (e.g., email already in use, weak password).

### `signIn(email, password)`

Signs a user into an existing account with the specified email and password.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `email` | `string` | The user's email address. |
| `password` | `string` | The user's password. |

#### Returns
* `Promise<User>`: A promise that resolves with the Firebase `User` object upon successful sign-in.
* **Rejects** with a Firebase error object if sign-in fails (e.g., wrong password, user not found).

---

## Firestore CRUD Functions (`firebase-crud.js`)

These functions handle Create, Read, Update, and Delete operations for the `users` collection in the Firestore Database.

### `createMember(id, name, car, isActive, validPayment, notes)`

Creates or overwrites a user document in the `users` collection using the provided `id` (typically the Firebase Auth UID) as the document ID.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | The user ID (document ID). |
| `name` | `string` | User's full name. |
| `car` | `string` | Car information. |
| `isActive` | `boolean` | Whether the user is an active member. |
| `validPayment` | `boolean` | Whether the user has a valid payment status. |
| `notes` | `string` | Additional notes about the user. |

#### Returns
* `Promise<string>`: A promise that resolves with the user's `id` upon successful creation.

### `getMember(id)`

Reads a single user document from the database.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | The user ID (document ID) to retrieve. |

#### Returns
* `Promise<Object|null>`: A promise that resolves with the user data object (including the `id`) if the document exists, or `null` if the document is not found.

### `getAllMembers()`

Reads all user documents from the `users` collection.

#### Returns
* `Promise<Array>`: A promise that resolves with an array of all user objects (each including their `id`).

### `getMembersByPaymentStatus(validPayment)`

Queries the `users` collection to retrieve documents based on their payment status.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `validPayment` | `boolean` | The payment status to filter by (`true` for valid, `false` for invalid). |

#### Returns
* `Promise<Array>`: A promise that resolves with an array of user objects matching the payment status criteria.

### `updateMember(id, updates)`

Updates specific fields of an existing user document. Only the fields present in the `updates` object will be modified.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | The user ID (document ID) to update. |
| `updates` | `Object` | An object containing the field(s) and new value(s) to update (e.g., `{ car: "New Model", isActive: false }`). |

#### Returns
* `Promise<string>`: A promise that resolves with the updated user's `id`.

### `deleteMember(id)`

Deletes a user document from the `users` collection.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | The user ID (document ID) to delete. |

#### Returns
* `Promise<string>`: A promise that resolves with the deleted user's `id`.

---

## React State Management (`MembersContext.jsx`)

This file implements the React Context pattern to provide an application-wide state (a local cache) for member data, reducing direct reads from Firestore.

### Hooks & Components

#### `useMembers()`
A custom React hook that provides access to the member state and CRUD functions.

* **Usage:** Must be called within a component wrapped by `MembersProvider`.
* **Returns:** An object containing the current member state and all member management functions.

#### `MembersProvider({ children, user })`
The context provider component that wraps the application (or a part of it) to manage member data state.

| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `Node` | The nested React elements to be rendered within the context. |
| `user` | `Object` | The currently authenticated Firebase user object, used to trigger initial data load. |

### Context Values (State and Functions)

The object returned by `useMembers` contains the following properties:

| Name | Type | Description | Strategy |
| :--- | :--- | :--- | :--- |
| `members` | `Array` | The local cache of all member data. | State |
| `isLoading` | `boolean` | Indicates if the initial data load or a refresh is in progress. | State |
| `error` | `string \| null` | Stores any error message from data fetching. | State |
| `getMember(id)` | `function` | Retrieves a single member. **Checks local cache first**; fetches from DB only if not found. | Cache-first |
| `createMember(...)` | `function` | Creates a member in the DB and immediately adds it to the local cache. | Write-through |
| `updateMember(id, updates)` | `function` | Updates a member in the DB and then updates the corresponding object in the local cache. | Write-through |
| `deleteMember(id)` | `function` | Deletes a member from the DB and removes it from the local cache. | Write-through |
| `refreshMembers()` | `function` | Forces a re-fetch of all members from the DB, overwriting the local cache. | Refresh |

---

## Configuration (`firebaseconfig.js`)

This file initializes the Firebase application and exports the necessary instances.

### Exports

| Exported Instance | Purpose |
| :--- | :--- |
| `app` | The initialized Firebase application instance. |
| `db` | The Firestore database instance. |
| `auth` | The Firebase Authentication instance. |

### Emulator Configuration
This configuration file also includes logic to automatically connect to local emulators for Firebase Auth (port 9099) and Firestore (port 8080) when running in a **development environment** (`env.DEV` is true).