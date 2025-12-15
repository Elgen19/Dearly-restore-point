// audioCache.js - IndexedDB caching for audio files to reduce Firebase Storage requests
// This helps prevent exhausting Firebase Storage download limits

const DB_NAME = 'LetterAppAudioCache';
const DB_VERSION = 1;
const STORE_NAME = 'audioFiles';

let dbPromise = null;

// Initialize IndexedDB
const initDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });

  return dbPromise;
};

// Convert URL to blob and cache it
const cacheAudioBlob = async (url, blob) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const cacheEntry = {
      url: url,
      blob: blob,
      timestamp: Date.now(),
      size: blob.size,
    };

    await store.put(cacheEntry);
    console.log(`✅ Audio cached in IndexedDB: ${url.substring(0, 50)}...`);
    
    return true;
  } catch (error) {
    console.warn('⚠️ Failed to cache audio:', error);
    return false;
  }
};

// Get cached audio blob by URL
const getCachedAudio = async (url) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(url);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result) {
          console.log(`✅ Audio found in cache: ${url.substring(0, 50)}...`);
          resolve(request.result.blob);
        } else {
          console.log(`ℹ️ Audio not in cache: ${url.substring(0, 50)}...`);
          resolve(null);
        }
      };

      request.onerror = () => {
        console.warn('⚠️ Error reading from cache:', request.error);
        resolve(null); // Don't fail if cache read fails
      };
    });
  } catch (error) {
    console.warn('⚠️ Failed to read from cache:', error);
    return null;
  }
};

// Helper function to convert Firebase Storage URL to proxy URL
const getProxyUrl = (firebaseUrl) => {
  if (!firebaseUrl) return null;
  
  // Check if it's already a proxy URL (to avoid double proxying)
  if (firebaseUrl.includes('/api/audio-proxy/')) {
    return firebaseUrl;
  }
  
  // Check if it's a Firebase Storage URL
  // Formats:
  // - https://storage.googleapis.com/BUCKET_NAME/path/to/file
  // - https://storage.googleapis.com/project-love-cc343.firebasestorage.app/path/to/file
  // - https://firebasestorage.googleapis.com/v0/b/BUCKET_NAME/o/path%2Fto%2Ffile?alt=media&token=...
  const storageMatch = firebaseUrl.match(/storage\.googleapis\.com\/[^/]+\/(.+)$/);
  if (storageMatch) {
    const filePath = encodeURIComponent(storageMatch[1]);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}/api/audio-proxy/${storageMatch[1]}`; // Use decoded path for proxy
  }
  
  // Handle Firebase Storage API format: firebasestorage.googleapis.com/v0/b/BUCKET/o/path?alt=media
  const firebaseApiMatch = firebaseUrl.match(/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/([^?]+)/);
  if (firebaseApiMatch) {
    // Decode the path (it's usually URL encoded)
    const encodedPath = firebaseApiMatch[1];
    const decodedPath = decodeURIComponent(encodedPath);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}/api/audio-proxy/${decodedPath}`;
  }
  
  // If it's a different format, return as is (might work without proxy)
  return firebaseUrl;
};

// Fetch audio with caching - checks cache first, then fetches if needed
export const getAudioWithCache = async (url) => {
  if (!url || url.trim() === '') {
    return null;
  }

  // Check cache first (using original URL as key)
  const cachedBlob = await getCachedAudio(url);
  if (cachedBlob) {
    // Return cached blob as object URL
    return URL.createObjectURL(cachedBlob);
  }

  // Not in cache, fetch through proxy to avoid CORS issues
  try {
    // Convert Firebase Storage URL to proxy URL if needed
    const proxyUrl = getProxyUrl(url);
    const fetchUrl = proxyUrl || url;
    
    console.log(`📥 Fetching audio via proxy: ${fetchUrl.substring(0, 50)}...`);
    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    
    // Cache the blob for future use (using original URL as key)
    await cacheAudioBlob(url, blob);
    
    // Return as object URL
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('❌ Failed to fetch audio:', error);
    throw error;
  }
};

// Clear old cache entries (older than 30 days)
export const clearOldCache = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const range = IDBKeyRange.upperBound(thirtyDaysAgo);
    
    const request = index.openCursor(range);
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`🗑️ Cleared ${deletedCount} old cache entries`);
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.warn('⚠️ Failed to clear old cache:', error);
  }
};

// Get cache size
export const getCacheSize = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const entries = request.result || [];
        const totalSize = entries.reduce((sum, entry) => sum + (entry.size || 0), 0);
        resolve({
          count: entries.length,
          size: totalSize,
          sizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        });
      };

      request.onerror = () => {
        resolve({ count: 0, size: 0, sizeMB: '0.00' });
      };
    });
  } catch (error) {
    return { count: 0, size: 0, sizeMB: '0.00' };
  }
};

// Clear all cache
export const clearAllCache = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.clear();
    console.log('🗑️ All cache cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear cache:', error);
    return false;
  }
};

// Initialize: Clear old cache entries on app load (runs once)
if (typeof window !== 'undefined') {
  clearOldCache().catch(() => {
    // Silently fail if clearing old cache fails
  });
}

