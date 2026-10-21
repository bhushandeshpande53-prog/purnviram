// firebase-messaging-sw.js  (आवृत्ती v2)
// Firebase चा तयार कोड न वापरता, सूचना दाखवणे आणि दाबल्यावर लेख उघडणे हे आपणच हाताळतो.

// नवीन आवृत्ती आली की लगेच चालू व्हावी
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
    d.url || (p.fcmOptions && p.fcmOptions.link) || n.click_action || "";
  event.waitUntil(
    self.registration.showNotification(title, { body: body, data: { url: url } })
  );
});

// सूचनेवर दाबल्यावर लेख उघडा
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "";
  if (!url) return;
  event.waitUntil(self.clients.openWindow(url.replace(/^http:/, "https:")));
});
