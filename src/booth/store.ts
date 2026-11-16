import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// 포토부스 사진 · 방명록 저장소
// - .env.local 에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 있으면 Supabase(인터넷)에 저장 → 관람객 폰에서 QR로 열림
// - 없으면 "테스트 모드": 이 브라우저(IndexedDB)에만 저장 → 같은 컴퓨터의 다른 탭에서만 열림

export type GuestEntry = {
  id: string
  authorId: string
  name: string
  message: string
  imageUrl: string | null
  createdAt: string
}

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const BUCKET = 'booth'

export const isOnline = Boolean(SUPA_URL && SUPA_KEY)
const supa: SupabaseClient | null = isOnline ? createClient(SUPA_URL!, SUPA_KEY!) : null

// 사진 주소용 아이디 — 추측하기 어렵게 12자리
export function newId(len = 12) {
  const abc = 'abcdefghijkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(len))
  return Array.from(bytes, (b) => abc[b % abc.length]).join('')
}

// QR에 넣을 주소. 배포 주소가 따로 있으면 VITE_PUBLIC_URL 로 지정 (예: https://junghip.github.io/AIRA-app)
export function photoPageUrl(id: string) {
  const fixed = (import.meta.env.VITE_PUBLIC_URL as string | undefined)?.replace(/\/$/, '')
  const base = fixed ?? window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/photo/${id}`
}

/* ───────── 테스트 모드용 IndexedDB ───────── */

type LocalEntry = Omit<GuestEntry, 'imageUrl'> & { image: Blob | null }

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('aira-booth', 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore('photos')
      req.result.createObjectStore('entries', { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(store: string, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await idb()
  return new Promise((resolve, reject) => {
    const req = run(db.transaction(store, mode).objectStore(store))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// 테스트 모드 blob 주소는 한 번만 만들어 재사용
const objectUrls = new Map<string, string>()
function localUrl(key: string, blob: Blob) {
  if (!objectUrls.has(key)) objectUrls.set(key, URL.createObjectURL(blob))
  return objectUrls.get(key)!
}

/* ───────── 사진 ───────── */

export async function savePhoto(id: string, photo: Blob) {
  if (supa) {
    const { error } = await supa.storage.from(BUCKET).upload(`photos/${id}.jpg`, photo, { contentType: 'image/jpeg', upsert: false })
    if (error) throw error
    return
  }
  await tx('photos', 'readwrite', (s) => s.put(photo, id))
}

// 사진 주소 (아직 업로드 전이면 null)
export async function getPhotoUrl(id: string): Promise<string | null> {
  if (supa) {
    const url = supa.storage.from(BUCKET).getPublicUrl(`photos/${id}.jpg`).data.publicUrl
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' })
    return res.ok ? url : null
  }
  const blob = await tx<Blob | undefined>('photos', 'readonly', (s) => s.get(id))
  return blob ? localUrl(`photo-${id}`, blob) : null
}

/* ───────── 방명록 ───────── */

type Row = { id: string; author_id: string; name: string; message: string; image_path: string | null; created_at: string }

const fromRow = (r: Row): GuestEntry => ({
  id: r.id,
  authorId: r.author_id,
  name: r.name,
  message: r.message,
  imageUrl: r.image_path && supa ? supa.storage.from(BUCKET).getPublicUrl(r.image_path).data.publicUrl : null,
  createdAt: r.created_at,
})

export async function listEntries(): Promise<GuestEntry[]> {
  if (supa) {
    const { data, error } = await supa.from('guestbook').select('*').order('created_at', { ascending: false }).limit(200)
    if (error) throw error
    return (data as Row[]).map(fromRow)
  }
  const all = await tx<LocalEntry[]>('entries', 'readonly', (s) => s.getAll())
  return all
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ image, ...e }) => ({ ...e, imageUrl: image ? localUrl(`entry-${e.id}`, image) : null }))
}

export async function addEntry(input: { authorId: string; name: string; message: string; image: Blob | null }) {
  const id = crypto.randomUUID()
  if (supa) {
    let image_path: string | null = null
    if (input.image) {
      image_path = `guestbook/${id}.jpg`
      const up = await supa.storage.from(BUCKET).upload(image_path, input.image, { contentType: 'image/jpeg' })
      if (up.error) throw up.error
    }
    const { error } = await supa.from('guestbook').insert({ id, author_id: input.authorId, name: input.name, message: input.message, image_path })
    if (error) throw error
    return
  }
  const entry: LocalEntry = { id, ...input, createdAt: new Date().toISOString() }
  await tx('entries', 'readwrite', (s) => s.put(entry))
}

export async function deleteEntry(id: string, authorId: string) {
  if (supa) {
    const { error } = await supa.from('guestbook').delete().eq('id', id).eq('author_id', authorId)
    if (error) throw error
    return
  }
  await tx('entries', 'readwrite', (s) => s.delete(id))
}

// 이름을 바꾸면 내가 남긴 글의 이름도 같이 바뀜
export async function renameAuthor(authorId: string, name: string) {
  if (supa) {
    const { error } = await supa.from('guestbook').update({ name }).eq('author_id', authorId)
    if (error) throw error
    return
  }
  const all = await tx<LocalEntry[]>('entries', 'readonly', (s) => s.getAll())
  for (const e of all.filter((e) => e.authorId === authorId)) {
    await tx('entries', 'readwrite', (s) => s.put({ ...e, name }))
  }
}

/* ───────── 이 폰의 방문객 정보 ───────── */

export function getVisitor() {
  let authorId = safeGet('aira-booth-author')
  if (!authorId) {
    authorId = newId(16)
    safeSet('aira-booth-author', authorId)
  }
  let name = safeGet('aira-booth-name')
  if (!name) {
    name = `여행자 ${Math.floor(1000 + Math.random() * 9000)}`
    safeSet('aira-booth-name', name)
  }
  return { authorId, name }
}

export function saveVisitorName(name: string) {
  safeSet('aira-booth-name', name)
}

function safeGet(k: string) {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v)
  } catch {
    /* 사생활 보호 모드 등 — 이번 방문 동안만 유지 */
  }
}

// 사진을 올리기 전에 긴 변 기준으로 줄여 JPEG로
export async function shrinkImage(file: Blob, maxSide = 1440, quality = 0.85): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * scale)
  c.height = Math.round(bmp.height * scale)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  bmp.close()
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('변환 실패'))), 'image/jpeg', quality))
}
