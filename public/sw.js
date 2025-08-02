// Service Worker for CareCycle PWA
const CACHE_NAME = 'carecycle-v1';
const MAX_CACHE_SIZE = 50; // Maximum number of cached items
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const urlsToCache = [
  '/',
  '/patients',
  '/schedules',
  '/items',
  '/settings',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Cache management functions
async function getCacheTimestamp(cache, request) {
  const timestampCache = await caches.open(`${CACHE_NAME}-timestamps`);
  const timestampResponse = await timestampCache.match(request);
  if (timestampResponse) {
    return parseInt(await timestampResponse.text());
  }
  return null;
}

async function setCacheTimestamp(cache, request) {
  const timestampCache = await caches.open(`${CACHE_NAME}-timestamps`);
  const timestamp = new Response(Date.now().toString());
  await timestampCache.put(request, timestamp);
}

async function removeOldCacheEntries() {
  const cache = await caches.open(CACHE_NAME);
  const timestampCache = await caches.open(`${CACHE_NAME}-timestamps`);
  const requests = await cache.keys();
  const now = Date.now();
  
  for (const request of requests) {
    const timestamp = await getCacheTimestamp(cache, request);
    if (timestamp && (now - timestamp) > MAX_CACHE_AGE) {
      await cache.delete(request);
      await timestampCache.delete(request);
    }
  }
}

async function limitCacheSize() {
  const cache = await caches.open(CACHE_NAME);
  const timestampCache = await caches.open(`${CACHE_NAME}-timestamps`);
  const requests = await cache.keys();
  
  if (requests.length <= MAX_CACHE_SIZE) {
    return;
  }
  
  // Get all entries with timestamps
  const entriesWithTimestamps = await Promise.all(
    requests.map(async (request) => ({
      request,
      timestamp: await getCacheTimestamp(cache, request) || 0
    }))
  );
  
  // Sort by timestamp (oldest first)
  entriesWithTimestamps.sort((a, b) => a.timestamp - b.timestamp);
  
  // Remove oldest entries until we're under the limit
  const entriesToRemove = entriesWithTimestamps.slice(0, requests.length - MAX_CACHE_SIZE);
  
  for (const entry of entriesToRemove) {
    await cache.delete(entry.request);
    await timestampCache.delete(entry.request);
  }
}

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Don't call skipWaiting() automatically - wait for user consent
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Keep current cache and its timestamp cache
          if (cacheName !== CACHE_NAME && cacheName !== `${CACHE_NAME}-timestamps`) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Clean up old entries on activation
      return removeOldCacheEntries();
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(async (cache) => {
            await cache.put(event.request, responseToCache);
            await setCacheTimestamp(cache, event.request);
            
            // Enforce cache limits after adding new entry
            await limitCacheSize();
            
            // Periodically clean old entries (10% chance)
            if (Math.random() < 0.1) {
              removeOldCacheEntries().catch(console.error);
            }
          });

        return response;
      })
      .catch(() => {
        // If network fails, try to get from cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Return offline page if available
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Helper function to validate URLs
function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);
    // Only allow http, https, and relative URLs
    return parsedUrl.protocol === 'http:' || 
           parsedUrl.protocol === 'https:' || 
           url.startsWith('/');
  } catch (e) {
    // If it's not a valid URL, check if it's a relative path
    return url.startsWith('/') && !url.includes('<') && !url.includes('>');
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'CareCycle 알림',
    body: '새로운 알림이 있습니다',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'carecycle-notification',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      
      // Validate and sanitize the push data
      const sanitizedData = {};
      
      // Sanitize string fields to prevent XSS
      if (typeof data.title === 'string') {
        // Remove any HTML tags and dangerous characters
        sanitizedData.title = data.title
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/[<>'"]/g, '') // Remove dangerous characters
          .substring(0, 100); // Limit length
      }
      
      if (typeof data.body === 'string') {
        sanitizedData.body = data.body
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/[<>'"]/g, '') // Remove dangerous characters
          .substring(0, 500); // Limit length
      }
      
      // Validate URLs to prevent javascript: and data: URLs
      if (typeof data.icon === 'string' && isValidUrl(data.icon)) {
        sanitizedData.icon = data.icon;
      }
      
      if (typeof data.badge === 'string' && isValidUrl(data.badge)) {
        sanitizedData.badge = data.badge;
      }
      
      // Validate tag (alphanumeric and hyphens only)
      if (typeof data.tag === 'string' && /^[a-zA-Z0-9-]+$/.test(data.tag)) {
        sanitizedData.tag = data.tag.substring(0, 50);
      }
      
      // Validate data object
      if (data.data && typeof data.data === 'object') {
        sanitizedData.data = {};
        
        // Only allow safe URL in data.url
        if (typeof data.data.url === 'string' && isValidUrl(data.data.url)) {
          sanitizedData.data.url = data.data.url;
        }
        
        // Add other safe fields as needed
        if (typeof data.data.scheduleId === 'string' && /^[a-zA-Z0-9-]+$/.test(data.data.scheduleId)) {
          sanitizedData.data.scheduleId = data.data.scheduleId;
        }
      }
      
      // Merge sanitized data
      notificationData = {
        ...notificationData,
        ...sanitizedData
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      requireInteraction: true,
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  // Validate the URL before opening
  let urlToOpen = '/';
  const notificationUrl = event.notification.data?.url;
  
  if (notificationUrl && isValidUrl(notificationUrl)) {
    urlToOpen = notificationUrl;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab with the target URL
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-schedules') {
    event.waitUntil(syncSchedules());
  }
});

async function syncSchedules() {
  try {
    // Get pending actions from IndexedDB or cache
    const cache = await caches.open('pending-actions');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Sync failed for:', request.url);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Received skip waiting approval from client');
    self.skipWaiting();
  }
});