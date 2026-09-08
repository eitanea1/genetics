/* Service worker — מה שהופך את זה לאפליקציה שעובדת בלי רשת.
   הגרסה מוזרקת בבנייה, כך שכל build דוחף עדכון למכשירים. */

const VERSION = "fcb2ca254101";
const SHELL_CACHE = "shell-" + VERSION;
const FONT_CACHE = "fonts-v1";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
].concat(["./assets/p08-0.webp","./assets/p12-0.webp","./assets/p12-2.webp","./assets/p12-3.webp","./assets/p13-0.webp","./assets/p14-0.webp","./assets/p15-0.webp","./assets/p15-1.webp","./assets/p17-0.webp","./assets/p18-0.webp","./assets/p21-0.webp","./assets/p22-0.webp","./assets/p23-0.webp","./assets/p24-0.webp","./assets/p25-0.webp","./assets/p27-0.webp","./assets/p28-0.webp","./assets/p28-1.webp","./assets/p29-2.webp","./assets/p31-0.webp","./assets/p33-1.webp","./assets/p35-0.webp","./assets/p36-0.webp","./assets/p36-1.webp","./assets/p37-0.webp","./assets/p37-2.webp","./assets/p38-0.webp","./assets/p38-1.webp","./assets/p39-0.webp","./assets/p40-0.webp","./assets/p42-0.webp","./assets/p42-1.webp","./assets/p43-0.webp","./assets/p43-1.webp","./assets/p44-0.webp","./assets/p44-1.webp","./assets/p47-0.webp","./assets/p48-0.webp","./assets/p49-0.webp","./assets/p49-1.webp","./assets/p50-0.webp","./assets/p53-0.webp","./assets/p53-1.webp","./assets/p54-0.webp","./assets/p56-0.webp","./assets/p57-0.webp","./assets/p57-3.webp","./assets/p59-0.webp","./assets/p62-0.webp","./assets/p63-0.webp","./assets/p64-1.webp","./assets/p65-0.webp","./assets/p65-1.webp","./assets/p67-0.webp","./assets/p68-0.webp","./assets/p68-1.webp","./assets/p69-0.webp","./assets/p69-1.webp","./assets/p70-0.webp","./assets/p70-2.webp","./assets/p71-0.webp","./assets/p73-0.webp","./assets/p74-0.webp","./assets/p74-3.webp","./assets/p75-1.webp","./assets/p76-1.webp","./assets/p78-0.webp","./assets/p79-0.webp","./assets/p80-1.webp","./assets/p81-1.webp","./assets/p82-0.webp"]);

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== FONT_CACHE)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // הפונטים של גוגל: מהמטמון אם יש, אחרת מהרשת ושומרים.
  // כך הטיפוגרפיה שורדת גם בלי רשת אחרי הביקור הראשון.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(req).then((hit) =>
          hit || fetch(req).then((res) => {
            if (res.ok || res.type === "opaque") cache.put(req, res.clone());
            return res;
          }).catch(() => hit)
        )
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // ניווט: קודם רשת (כדי לקבל גרסה חדשה), ואם אין — הדף מהמטמון
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html").then((hit) => hit || caches.match("./")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) =>
      hit || fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
    )
  );
});
