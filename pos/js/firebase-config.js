// Firebase Configuration
// This file will store Firebase configuration
// Replace these values with your actual Firebase project credentials

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// For now, we'll use localStorage as a temporary solution
// Once you create a Firebase project, we'll replace this

export const useFirebase = false; // Set to true when Firebase is configured

export default firebaseConfig;
