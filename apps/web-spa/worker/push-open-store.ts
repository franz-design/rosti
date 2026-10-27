import {
  NOTIFICATION_TARGET_MAX_AGE_MS,
  PENDING_OPEN_MAX_AGE_MS,
  readFreshOpenPath,
  readStoredOpen,
  type PendingOpenRecord,
} from './push-open'
import { readAppPath } from './read-app-notification'

const DATABASE_NAME = 'rosti-push-open'
const DATABASE_VERSION = 1
const TARGET_STORE = 'targets'
const PENDING_STORE = 'pending'
const PENDING_KEY = 'next'

export async function saveNotificationTarget(
  tag: string,
  path: string,
  now = Date.now(),
): Promise<void> {
  if (!tag || !readAppPath(path)) return
  await putValue(TARGET_STORE, tag, { path, savedAt: now })
}

export async function readNotificationTarget(
  tag: string,
  now = Date.now(),
): Promise<string | null> {
  if (!tag) return null
  const value = await getValue(TARGET_STORE, tag)
  if (value === undefined) return null
  const path = readFreshOpenPath(readStoredOpen(value), now, NOTIFICATION_TARGET_MAX_AGE_MS)
  if (path) return path
  await deleteValue(TARGET_STORE, tag)
  return null
}

export async function forgetNotificationTarget(tag: string): Promise<void> {
  await deleteValue(TARGET_STORE, tag)
}

export async function savePendingOpen(path: string, now = Date.now()): Promise<void> {
  if (!readAppPath(path)) return
  await putValue(PENDING_STORE, PENDING_KEY, { path, savedAt: now })
}

export async function readPendingOpen(now: number): Promise<PendingOpenRecord | null> {
  const value = await getValue(PENDING_STORE, PENDING_KEY)
  if (value === undefined) return null
  const record = readStoredOpen(value)
  const path = readFreshOpenPath(record, now, PENDING_OPEN_MAX_AGE_MS)
  if (!path || !record) {
    await clearPendingOpen()
    return null
  }
  return { path, savedAt: record.savedAt }
}

export async function clearPendingOpen(): Promise<void> {
  await deleteValue(PENDING_STORE, PENDING_KEY)
}

export async function clearPendingOpenSavedAt(savedAt: number): Promise<void> {
  const database = await openDatabase()
  try {
    const transaction = database.transaction(PENDING_STORE, 'readwrite')
    const store = transaction.objectStore(PENDING_STORE)
    const request = store.get(PENDING_KEY)
    request.onsuccess = () => {
      const record = readStoredOpen(request.result)
      if (record?.savedAt === savedAt) store.delete(PENDING_KEY)
    }
    await finishTransaction(transaction, request)
  } finally {
    database.close()
  }
}

function openDatabase(): Promise<IDBDatabase> {
  const factory = globalThis.indexedDB
  if (!factory) return Promise.reject(new Error('IndexedDB is not available'))

  return new Promise((resolve, reject) => {
    const request = factory.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(TARGET_STORE)) {
        database.createObjectStore(TARGET_STORE)
      }
      if (!database.objectStoreNames.contains(PENDING_STORE)) {
        database.createObjectStore(PENDING_STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Could not open the push database'))
  })
}

async function putValue(storeName: string, key: string, value: PendingOpenRecord): Promise<void> {
  const database = await openDatabase()
  try {
    const transaction = database.transaction(storeName, 'readwrite')
    const request = transaction.objectStore(storeName).put(value, key)
    await finishTransaction(transaction, request)
  } finally {
    database.close()
  }
}

async function getValue(storeName: string, key: string): Promise<unknown> {
  const database = await openDatabase()
  try {
    const transaction = database.transaction(storeName, 'readonly')
    const request = transaction.objectStore(storeName).get(key)
    return await finishTransaction(transaction, request)
  } finally {
    database.close()
  }
}

async function deleteValue(storeName: string, key: string): Promise<void> {
  if (!key) return
  const database = await openDatabase()
  try {
    const transaction = database.transaction(storeName, 'readwrite')
    const request = transaction.objectStore(storeName).delete(key)
    await finishTransaction(transaction, request)
  } finally {
    database.close()
  }
}

function finishTransaction<T>(transaction: IDBTransaction, request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    let isSettled = false
    const fail = () => {
      if (isSettled) return
      isSettled = true
      reject(transaction.error ?? request.error ?? new Error('Push database transaction aborted'))
    }
    transaction.oncomplete = () => {
      if (isSettled) return
      isSettled = true
      resolve(request.result)
    }
    transaction.onabort = fail
    transaction.onerror = (event) => {
      event.preventDefault()
      fail()
    }
  })
}
