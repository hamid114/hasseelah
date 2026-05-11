const CACHE = 'ghallah-v12';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

// Daily notification via periodicsync or alarm
self.addEventListener('periodicsync', e => {
  if(e.tag === 'daily-reminder') {
    e.waitUntil(sendDailyReminder());
  }
});

// Fallback: notification via message from app
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SCHEDULE_REMINDER') {
    const delay = e.data.delay || 0;
    setTimeout(() => sendDailyReminder(), delay);
  }
});

async function sendDailyReminder() {
  const messages = [
    {title: '🌾 غلة تسألك!', body: 'هل سجّلت مصاريف اليوم؟ ستشكر نفسك لاحقاً 😊'},
    {title: '💰 تذكير غلة', body: 'دقيقة واحدة لتسجيل مصاريفك تساوي راحة بال كاملة ✨'},
    {title: '📊 كيف كان إنفاقك اليوم؟', body: 'سجّله الآن في غلة قبل أن تنسى 📝'},
    {title: '🎯 هدفك المالي يحتاجك!', body: 'خطوة صغيرة كل يوم = نتائج كبيرة 💪'},
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  await self.registration.showNotification(msg.title, {
    body: msg.body,
    icon: '/icon-192.png',
    badge: '/icon-64.png',
    tag: 'daily-reminder',
    renotify: true,
    data: {url: 'https://ghallah.pro'}
  });
}

// Handle notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.openWindow('https://ghallah.pro')
  );
});
