// firebase-messaging-sw.js - ॲप बंद असतानाही सूचना दाखवतो आणि दाबल्यावर लेख उघडतो

// सूचनेवर दाबल्यावर ब्लॉगचा लेख उघडण्यासाठी (हा भाग Firebase च्या कोडच्या आधी असणं आवश्यक आहे)
self.addEventListener("notificationclick", (event) => {
  const d = event.notification.data || {};
  const m = d.FCM_MSG || {};
  const url =
    (m.data && m.data.url) ||
    (m.fcmOptions && m.fcmOptions.link) ||
    d.url;
  if (!url) return;
  event.stopImmediatePropagation();
  event.notification.close();
  event.waitUntil(clients.openWindow(url.replace(/^http:/, "https:")));
});

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
