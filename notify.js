// notify.js - new post notifications: first-time bell button + on/off control used by the Settings page
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getMessaging, getToken, deleteToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";
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
const SW_URL = "./firebase-messaging-sw.js";
const SW_SCOPE = "./fcm-scope/";

const supported =
  "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;

function announce() {
  window.dispatchEvent(new Event("affnotify"));
}

if (!supported) {
  window.AFFNotify = { supported: false };
  announce();
} else {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const isOn = () =>
    !!localStorage.getItem("fcmToken") && Notification.permission === "granted";
  const en = () => document.documentElement.lang === "en";

  // Turn notifications ON. Returns "ok", "denied" or "error".
  async function enable() {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return "denied";
      const reg = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: reg
      });
      if (!token) throw new Error("no token");

      if (localStorage.getItem("fcmToken") !== token) {
        try {
          await setDoc(doc(db, "tokens", token), { createdAt: serverTimestamp() });
        } catch (e) {
          // The same phone turning it on again after turning it off: the entry may already exist.
          if (!(e && e.code === "permission-denied" && localStorage.getItem("fcmOptOut"))) throw e;
        }
        localStorage.setItem("fcmToken", token);
      }
      localStorage.removeItem("fcmOptOut");
      refreshButton();
      announce();
      return "ok";
    } catch (e) {
      console.error(e);
      return "error";
    }
  }

  // Turn notifications OFF. Returns "off".
  async function disable() {
    try {
      const reg = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
      const messaging = getMessaging(app);
      await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg }).catch(() => null);
      await deleteToken(messaging).catch(() => {});
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe().catch(() => {});
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("fcmToken");
    localStorage.setItem("fcmOptOut", "1");
    refreshButton();
    announce();
    return "off";
  }

  window.AFFNotify = { supported: true, isOn, enable, disable };

  // Keep the notification file up to date for people who already turned it on
  if (isOn()) {
    navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE }).catch(() => {});
  }

  // First-time bell button (hidden once notifications are on, or if the reader turned them off)
  let btn = null;
  function refreshButton() {
    const show = !isOn() && !localStorage.getItem("fcmOptOut");
    if (show && !btn) {
      btn = document.createElement("button");
      btn.textContent = en() ? "🔔 Get new post notifications" : "🔔 नवीन लेखांची सूचना मिळवा";
      btn.style.cssText =
        "position:fixed;right:12px;bottom:12px;z-index:9999;padding:10px 14px;" +
        "border:none;border-radius:24px;background:#1a73e8;color:#fff;" +
        "font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,.3);cursor:pointer;";
      btn.addEventListener("click", async () => {
        const r = await enable();
        if (r === "ok") {
          alert(en() ? "Thank you! You will now get a notification when a new post is published."
                     : "धन्यवाद! आता नवीन लेख आला की सूचना मिळेल.");
        } else if (r === "denied") {
          alert(en() ? "Notification permission was not granted."
                     : "सूचना चालू करण्यासाठी परवानगी द्यावी लागेल.");
        } else {
          alert(en() ? "Something went wrong. Please try again in a while."
                     : "काहीतरी चुकलं. थोड्या वेळाने पुन्हा प्रयत्न करा.");
        }
      });
      document.body.appendChild(btn);
    } else if (!show && btn) {
      btn.remove();
      btn = null;
    }
  }

  refreshButton();
  announce();
}
