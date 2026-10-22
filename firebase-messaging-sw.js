// firebase-messaging-sw.js  (version v6)
// Shows the notification. When tapped, opens the article inside the app's own reading view.

const BLOG_HOME = "https://bhushandeshpande53.blogspot.com";

// The app's address = one folder above this file's scope
const APP_URL = new URL("../", self.registration.scope).href;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// When a push message arrives, show it
self.addEventListener("push", (event) => {
  let p = {};
  try {
    p = event.data ? event.data.json() : {};
  } catch (e) {}
  const n = p.notification || {};
  const d = p.data || {};
  const title = d.title || n.title || "New article";
  const body = d.body || n.body || "";
  const url =
    d.link ||
    d.url ||
    (p.fcmOptions && p.fcmOptions.link) ||
    n.click_action ||
    BLOG_HOME;
  event.waitUntil(
    self.registration.showNotification(title, { body: body, data: { url: url } })
  );
});

// When the notification is tapped, open the app and show that article
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.url) || "";
  const target = link
    ? APP_URL + "#open=" + encodeURIComponent(link.replace(/^http:/, "https:"))
    : APP_URL;
  event.waitUntil(self.clients.openWindow(target));
});
