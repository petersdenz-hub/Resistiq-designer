import type { AssetStore } from './types'

const DB_NAME = 'resistq-designer'
const DB_VERSION = 1
const STORE = 'assets'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'))
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const request = run(tx.objectStore(STORE))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

export const localAssetStore: AssetStore = {
  async get(id) {
    try {
      return (await withStore('readonly', (store) => store.get(id))) ?? null
    } catch {
      return null
    }
  },

  async put(asset) {
    await withStore('readwrite', (store) => store.put(asset))
  },

  async list() {
    try {
      return (await withStore('readonly', (store) => store.getAll())) ?? []
    } catch {
      return []
    }
  },
}
