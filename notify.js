// notify.js - "नवीन लेखांची सूचना" बटन
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB996i84GFeaRgXbkwuTUSHvMY4VQI-X3c",
  authDomain: "after-the-full-stop.firebaseapp.com",
  projectId: "after-the-full-stop",
  storageBucket: "after-the-full-stop.firebasestorage.app",
  messagingSenderId: "259763624688",
  appId: "1:259763624688:web:6ce314024dbf1dcd698035"
};

const VAPID_KEY = "BCSIU0HLNkU3GL-5XJWVEn8FRtrneFUN3ibdcIpYubC5XCReW9oB2-mAPTAxpd4ONehIna8v49A_-gGX5Zjzbuo";

const supported = "Notification" in window && "serviceWorker" in navigator;
const alreadyDone = localStorage.getItem("fcmToken") && Notification.permission === "granted";

if (supported && alreadyDone) {
  // आधीच चालू असेल तर फक्त सूचनेची फाईल अद्ययावत ठेवा
  navigator.serviceWorker
    .register("./firebase-messaging-sw.js", { scope: "./fcm-scope/" })
    .catch(() => {});
}

if (supported && !alreadyDone) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const btn = document.createElement("button");
  btn.textContent = "🔔 नवीन लेखांची सूचना मिळवा";
  btn.style.cssText =
    "position:fixed;right:12px;bottom:12px;z-index:9999;padding:10px 14px;" +
    "border:none;border-radius:24px;background:#1a73e8;color:#fff;" +
    "font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,.3);cursor:pointer;";
  document.body.appendChild(btn);

  btn.addEventListener("click", async () => {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        alert("सूचना चालू करण्यासाठी परवानगी द्यावी लागेल.");
        return;
      }
      const reg = await navigator.serviceWorker.register("./firebase-messaging-sw.js", {
        scope: "./fcm-scope/"
      });
      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: reg
      });
      if (!token) throw new Error("token मिळाला नाही");

      if (localStorage.getItem("fcmToken") !== token) {
        await setDoc(doc(db, "tokens", token), { createdAt: serverTimestamp() });
        localStorage.setItem("fcmToken", token);
      }
      btn.remove();
      alert("धन्यवाद! आता नवीन लेख आला की सूचना मिळेल.");
    } catch (e) {
      console.error(e);
      alert("काहीतरी चुकलं. थोड्या वेळाने पुन्हा प्रयत्न करा.");
    }
  });
}
