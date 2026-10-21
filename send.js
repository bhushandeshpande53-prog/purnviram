// send.js - ब्लॉगवर नवीन लेख आला का ते तपासतो आणि सर्वांना सूचना पाठवतो
const admin = require("firebase-admin");

const FEED_URL =
  "https://bhushandeshpande53.blogspot.com/feeds/posts/default?alt=json&max-results=1";

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY)),
});
const db = admin.firestore();

async function main() {
  // 1. ब्लॉगचा सर्वात नवा लेख मिळवा
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error("ब्लॉग फीड मिळाली नाही: " + res.status);
  const data = await res.json();
  const entry = data.feed && data.feed.entry && data.feed.entry[0];
  if (!entry) {
    console.log("फीडमध्ये लेख नाहीत.");
    return;
  }
  const id = entry.id.$t;
  const title = entry.title.$t;
  const published = entry.published.$t;
  const alt = (entry.link || []).find((l) => l.rel === "alternate");
  const link = alt ? alt.href : "https://bhushandeshpande53.blogspot.com";

  // 2. शेवटी कोणता लेख पाहिला होता ते तपासा
  const metaRef = db.collection("meta").doc("lastPost");
  const meta = await metaRef.get();

  if (!meta.exists) {
    await metaRef.set({ id, published });
    console.log("पहिली फेरी: सध्याचा लेख नोंदवला, सूचना पाठवली नाही.");
    return;
  }

  const last = meta.data();
  if (new Date(published) <= new Date(last.published)) {
    console.log("नवीन लेख नाही.");
    return;
  }

  // 3. सर्व वाचकांचे token मिळवा
  const snap = await db.collection("tokens").get();
  const tokens = snap.docs.map((d) => d.id);
  console.log("नवीन लेख: " + title + " | वाचक: " + tokens.length);

  // 4. ५०० च्या गटाने सूचना पाठवा
  for (let i = 0; i < tokens.length; i += 500) {
    const batch = tokens.slice(i, i + 500);
    const result = await admin.messaging().sendEachForMulticast({
      tokens: batch,
      notification: { title: "नवीन लेख", body: title },
      webpush: { fcmOptions: { link } },
    });

    // जे फोन आता अस्तित्वात नाहीत त्यांच्या नोंदी पुसा
    const dead = [];
    result.responses.forEach((r, idx) => {
      const code = r.error && r.error.code;
      if (
        code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token"
      ) {
        dead.push(batch[idx]);
      }
    });
    await Promise.all(dead.map((t) => db.collection("tokens").doc(t).delete()));
    console.log(
      "यशस्वी: " + result.successCount + ", अयशस्वी: " + result.failureCount
    );
  }

  // 5. हा लेख 'पाहिला' म्हणून नोंदवा
  await metaRef.set({ id, published });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
