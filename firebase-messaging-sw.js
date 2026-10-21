// firebase-messaging-sw.js - ॲप बंद असतानाही सूचना दाखवतो
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB996i84GFeaRgXbkwuTUSHvMY4VQI-X3c",
  authDomain: "after-the-full-stop.firebaseapp.com",
  projectId: "after-the-full-stop",
  storageBucket: "after-the-full-stop.firebasestorage.app",
  messagingSenderId: "259763624688",
  appId: "1:259763624688:web:6ce314024dbf1dcd698035"
});

// सूचना (title + body) आली की Firebase ती आपोआप दाखवतो.
firebase.messaging();
