// firebase-messaging-sw.js  (आवृत्ती v4)
// सूचना दाखवणे आणि दाबल्यावर लेख उघडणे हे आपणच हाताळतो.

const BLOG_HOME = "https://bhushandeshpande53.blogspot.com";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// सूचना आली की ती दाखवा
self.addEventListener("push", (event) => {
  let p = {};
  try {
    p = event.data ? event.data.json() : {};
  } catch (e) {}
  const n = p.notification || {};
  const d = p.data || {};
  const title = d.title || n.title || "नवीन लेख";
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

// सूचनेवर दाबल्यावर लेख उघडा
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    (event.notification.data && event.notification.data.url) || BLOG_HOME;
  event.waitUntil(self.clients.openWindow(url.replace(/^http:/, "https:")));
});
