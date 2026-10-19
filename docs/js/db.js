const DB_NAME = 'trilog';
const DB_VERSION = 1;
const STORES = ['workouts', 'routines', 'competitions', 'planDocument'];

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function requestAsPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const db = {
  async getAll(storeName) {
    const database = await openDB();
    const tx = database.transaction(storeName, 'readonly');
    const result = await requestAsPromise(tx.objectStore(storeName).getAll());
    return result;
  },

  async get(storeName, id) {
    const database = await openDB();
    const tx = database.transaction(storeName, 'readonly');
    return requestAsPromise(tx.objectStore(storeName).get(id));
  },

  async put(storeName, obj) {
    const database = await openDB();
    const tx = database.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(obj);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(obj);
      tx.onerror = () => reject(tx.error);
    });
  },

  async delete(storeName, id) {
    const database = await openDB();
    const tx = database.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async clear(storeName) {
    const database = await openDB();
    const tx = database.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async exportAll() {
    const data = {};
    for (const store of STORES) {
      data[store] = await db.getAll(store);
    }
    return data;
  },

  async importAll(data) {
    for (const store of STORES) {
      if (!Array.isArray(data[store])) continue;
      await db.clear(store);
      const database = await openDB();
      const tx = database.transaction(store, 'readwrite');
      for (const item of data[store]) {
        tx.objectStore(store).put(item);
      }
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  },
};

export { uuid };
