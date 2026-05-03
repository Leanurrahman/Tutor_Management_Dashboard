# Bright Student Pro - Tutor Management Dashboard

Bright Student Pro is a clean, modern dashboard built for tutors to manage students, track class attendance, and handle payment records with ease.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4
- **UI Components**: Shadcn UI, Lucide React, Motion
- **Backend**: Firebase (Authentication & Firestore)

## Local Setup Instructions

1. **Unzip the folder** to your preferred directory.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Firebase**:
   - Open `src/lib/firebase.ts`.
   - Replace the `firebaseConfig` object placeholders with your actual keys from the [Firebase Console](https://console.firebase.google.com/).
4. **Enable Firebase Services**:
   - **Authentication**: Enable `Email/Password` and `Google` providers.
   - **Firestore Database**: Create a database in `Production` or `Test` mode.
   - **Security Rules**: Copy the content of `firestore.rules` from this project into the 'Rules' tab of your Firebase Firestore console and publish.
5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Key Features
- **Authentication**: Secure login with Email/Password or Google.
- **Student Management**: Add, edit, and track student status and fees.
- **Attendance Tracking**: Log class sessions and topics.
- **Payment Processing**: Record payments with automatic updates to student outstanding dues using Firestore Transactions.
- **Responsive Design**: Fully functional on mobile and desktop devices.
