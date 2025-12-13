# Frontend UI Documentation

This document outlines the React components and pages that make up the user interface. These pages interact with the `MembersContext` and Firebase API to display and manage data.

---

## Customer List Page (`customer-list-page.jsx`)

The main dashboard for managing the member database. It provides a comprehensive view of all customers with CRUD (Create, Read, Update, Delete) capabilities.

### Key Features
* **Data Grid:** Displays a table of members with columns for ID, Name, Vehicle, Status, Payment, and Notes.
* **Advanced Filtering:**
    * **Search Bar:** Filters by Name or ID in real-time.
    * **Dropdown Filters:** Segment users by Subscription Level (Basic/Deluxe/Ultimate), Active Status, and Payment Status.
* **Excel Export:** Uses `exceljs` to generate a downloadable `.xlsx` file. It applies conditional formatting (gray for inactive, yellow for invalid payment) to the exported rows.
* **Modal Interfaces:**
    * **Add Member:** Validates ID format (B/D/U + 3 digits) before submission.
    * **Edit Member:** Pre-fills existing data for modification.
    * **Delete Confirmation:** A safety modal to prevent accidental data loss.

### State Management
* Uses `useMembers()` to access the global member list.
* Maintains local state for `filteredMembers` to handle search/sort logic without modifying the global context.

---

## 🔍 Customer Search Page (`customer-search-page.jsx`)

A specialized, mobile-friendly "Kiosk" view designed for quick member lookups.

### Key Features
* **Virtual Keypad:** On-screen buttons (0-9, B, D, U) allow input on touch devices without triggering the native keyboard.
* **Validation:** Restricts input to the specific format `[B/D/U] + 3-4 digits` before allowing submission.
* **Status Indicators:**
    * Displays large visual cards for "Active" and "Valid Payment" status.
    * Cards dynamically change color (Green for OK, Gray/Yellow for issues) based on member data.
* **Read-Only:** This view is strictly for retrieval; no editing is permitted here.

---

## Analytics Page (`analytics-page.jsx`)

A dashboard container for visualizing membership data.

### Key Features
* **Tabbed Interface:** Uses a `Stack` of buttons to toggle between three distinct views:
    1.  **Graphs:** Visual representation of data (Placeholder).
    2.  **Raw Data:** Tabular view of statistics (Placeholder).
    3.  **Export:** Options for data extraction (Placeholder).
* **View Switching:** Maintains an `activeView` state string ('graphs', 'data', 'export') to conditionally render components.

---

## Login Page (`login-page.jsx`)

The entry point for application authentication.

### Key Features
* **Form Validation:** Checks for the presence of email and password, and validates email format before attempting submission.
* **Error Handling:** Catches Firebase-specific error codes and translates them into user-friendly messages:
    * `auth/invalid-credential`: "Invalid email or password".
    * `auth/too-many-requests`: "Too many failed attempts".
* **Navigation:** Redirects the user to the home route (`/`) upon successful sign-in.

---

## Upload & Test Page (`upload-page.jsx`)

An administrative utility page for bulk data operations and testing.

### Key Features
* **Bulk Import:** Accepts `.xlsx` or `.xls` files to create multiple member records simultaneously using `uploadCustomerRecordsFromFile`.
* **Upload Feedback:** detailed results summary after processing:
    * Total rows processed.
    * Count of successful vs. failed uploads.
    * Specific error messages per row (e.g., duplicate IDs).
* **Single Test Creation:** A manual button to generate a standardized test user ("Zachary Kim") to verify database connectivity without a file.