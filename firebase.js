/* ============================================================
   FIREBASE CONFIG
   ============================================================ */

const firebaseConfig = {
    apiKey: "СІЗДІҢ_API_KEY",
    authDomain: "ai-feedback-system.firebaseapp.com",
    projectId: "ai-feedback-system",
    storageBucket: "ai-feedback-system.appspot.com",
    messagingSenderId: "СІЗДІҢ_SENDER_ID",
    appId: "СІЗДІҢ_APP_ID"
};

// Firebase инициализация
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();