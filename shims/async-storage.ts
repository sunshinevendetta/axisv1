type StorageValue = string | null;

const memoryStore = new Map<string, string>();

const getLocalStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const asyncStorage = {
  async getItem(key: string): Promise<StorageValue> {
    const storage = getLocalStorage();
    return storage ? storage.getItem(key) : (memoryStore.get(key) ?? null);
  },

  async setItem(key: string, value: string): Promise<void> {
    const storage = getLocalStorage();
    if (storage) {
      storage.setItem(key, value);
      return;
    }

    memoryStore.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    const storage = getLocalStorage();
    if (storage) {
      storage.removeItem(key);
      return;
    }

    memoryStore.delete(key);
  },

  async clear(): Promise<void> {
    const storage = getLocalStorage();
    if (storage) {
      storage.clear();
      return;
    }

    memoryStore.clear();
  },

  async multiGet(keys: string[]): Promise<Array<[string, StorageValue]>> {
    return Promise.all(keys.map(async (key) => [key, await asyncStorage.getItem(key)]));
  },

  async multiSet(entries: Array<[string, string]>): Promise<void> {
    await Promise.all(entries.map(([key, value]) => asyncStorage.setItem(key, value)));
  },

  async multiRemove(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => asyncStorage.removeItem(key)));
  },
};

export const getItem = asyncStorage.getItem;
export const setItem = asyncStorage.setItem;
export const removeItem = asyncStorage.removeItem;
export const clear = asyncStorage.clear;
export const multiGet = asyncStorage.multiGet;
export const multiSet = asyncStorage.multiSet;
export const multiRemove = asyncStorage.multiRemove;

export default asyncStorage;
