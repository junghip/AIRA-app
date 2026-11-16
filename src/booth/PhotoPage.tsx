import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import airaLogo from '../assets/common/aira-logo.svg'
import closeIcon from '../assets/icons/close-line.svg'
import imageIcon from '../assets/icons/image-fill.svg'
import AmbientGradient from '../components/AmbientGradient'
import Icon from '../components/Icon'
import { riseIn, softSpring, spring, stagger } from '../motion/transitions'
import { addEntry, deleteEntry, getPhotoUrl, getVisitor, listEntries, renameAuthor, saveVisitorName, shrinkImage, type GuestEntry } from './store'
import './PhotoPage.css'

// QR로 들어오는 모바일 화면: 내 네 컷 저장 + 방명록
export default function PhotoPage() {
  const { id = '' } = useParams()
  const [photo, setPhoto] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)
  const [visitor, setVisitor] = useState(getVisitor)
  const [editing, setEditing] = useState(false)
  const [entries, setEntries] = useState<GuestEntry[]>([])
  const [toast, setToast] = useState<string | null>(null)

  // 업로드가 끝나기 전에 QR을 찍을 수 있어서 잠시 다시 확인
  useEffect(() => {
    let alive = true
    let tries = 0
    const check = async () => {
      const url = await getPhotoUrl(id).catch(() => null)
      if (!alive) return
      if (url) return setPhoto(url)
      if (++tries < 15) setTimeout(check, 2000)
      else setMissing(true)
    }
    check()
    return () => {
      alive = false
    }
  }, [id])

  const refresh = () => listEntries().then(setEntries).catch((e) => console.error(e))
  useEffect(() => {
    refresh()
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const say = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const savePhoto = async () => {
    if (!photo) return
    try {
      const blob = await (await fetch(photo)).blob()
      const file = new File([blob], `AIRA-포토부스-${id}.jpg`, { type: 'image/jpeg' })
      // 아이폰: 공유 시트 → "이미지 저장"
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
        return
      }
      const a = document.createElement('a')
      a.href = URL.createObjectURL(file)
      a.download = file.name
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 4000)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') say('사진을 길게 눌러서 저장해 주세요')
    }
  }

  const rename = async (name: string) => {
    const clean = name.trim().slice(0, 16)
    setEditing(false)
    if (!clean || clean === visitor.name) return
    saveVisitorName(clean)
    setVisitor((v) => ({ ...v, name: clean }))
    setEntries((list) => list.map((e) => (e.authorId === visitor.authorId ? { ...e, name: clean } : e)))
    try {
      await renameAuthor(visitor.authorId, clean)
      say('이름을 바꿨어요')
    } catch {
      say('이름을 저장하지 못했어요')
    }
  }

  return (
    <div className="pp">
      <AmbientGradient />
      <motion.div className="pp__inner" variants={stagger(0.08, 0.1)} initial="hidden" animate="show">
        <motion.header className="pp__top" variants={riseIn}>
          <img src={airaLogo} width={96} height={17.6} alt="AIRA" />
          <span className="pp__chip">포토부스</span>
        </motion.header>

        <motion.div className="pp__hello" variants={riseIn}>
          <NameTag name={visitor.name} editing={editing} onEdit={() => setEditing(true)} onSave={rename} />
          <h1 className="pp__title">
            오늘의 네 컷이
            <br />
            도착했어요
          </h1>
        </motion.div>

        <motion.div className="pp__photo-wrap" variants={riseIn}>
          {photo ? (
            <motion.img
              className="pp__photo"
              src={photo}
              alt="AIRA 포토부스 네 컷 사진"
              initial={{ opacity: 0, rotate: -3, y: 30 }}
              animate={{ opacity: 1, rotate: -1, y: 0 }}
              transition={softSpring}
            />
          ) : (
            <div className="pp__photo pp__photo--empty">
              {missing ? '사진을 찾을 수 없어요.\nQR을 다시 찍어 주세요.' : '사진을 불러오는 중…'}
            </div>
          )}
        </motion.div>

        <motion.div className="pp__save" variants={riseIn}>
          <motion.button className="cta cta--solid" whileTap={{ scale: 0.95 }} transition={spring} disabled={!photo} onClick={savePhoto}>
            사진 저장하기
          </motion.button>
          <p className="pp__hint">저장이 안 되면 사진을 길게 눌러 주세요</p>
        </motion.div>

        <motion.section className="pp__book" variants={riseIn}>
          <div className="pp__book-head">
            <h2>방명록</h2>
            <span>{entries.length}개의 이야기</span>
          </div>
          <Composer visitor={visitor} onEditName={() => setEditing(true)} onDone={refresh} say={say} />
          <ul className="pp__list">
            <AnimatePresence initial={false}>
              {entries.map((e) => (
                <motion.li
                  key={e.id}
                  className="entry"
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={softSpring}
                >
                  <div className="entry__head">
                    <span className="entry__avatar">{e.name.slice(0, 1)}</span>
                    <b>{e.name}</b>
                    {e.authorId === visitor.authorId && <span className="entry__me">나</span>}
                    <time>{timeAgo(e.createdAt)}</time>
                    {e.authorId === visitor.authorId && (
                      <button
                        className="entry__del"
                        onClick={async () => {
                          if (!confirm('이 글을 지울까요?')) return
                          await deleteEntry(e.id, visitor.authorId).catch(() => say('지우지 못했어요'))
                          refresh()
                        }}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  {e.message && <p className="entry__msg">{e.message}</p>}
                  {e.imageUrl && <img className="entry__img" src={e.imageUrl} alt="" loading="lazy" />}
                </motion.li>
              ))}
            </AnimatePresence>
            {entries.length === 0 && <li className="pp__empty">첫 번째 방명록을 남겨 주세요 ✈︎</li>}
          </ul>
        </motion.section>
      </motion.div>

      <AnimatePresence>
        {toast && (
          <motion.div className="pp__toast" initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NameTag({ name, editing, onEdit, onSave }: { name: string; editing: boolean; onEdit: () => void; onSave: (n: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  if (editing) {
    return (
      <form
        className="pp__name-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSave(inputRef.current?.value ?? '')
        }}
      >
        <input ref={inputRef} defaultValue={name} maxLength={16} aria-label="이름" enterKeyHint="done" onBlur={(e) => onSave(e.currentTarget.value)} />
        <button type="submit">저장</button>
      </form>
    )
  }
  return (
    <button className="pp__name" onClick={onEdit}>
      안녕하세요, <b>{name}</b>님
      <span className="pp__name-edit">이름 바꾸기</span>
    </button>
  )
}

function Composer({
  visitor,
  onEditName,
  onDone,
  say,
}: {
  visitor: { authorId: string; name: string }
  onEditName: () => void
  onDone: () => void
  say: (m: string) => void
}) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<Blob | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const pick = async (f: File | undefined) => {
    if (!f) return
    try {
      const small = await shrinkImage(f)
      setFile(small)
      setPreview(URL.createObjectURL(small))
    } catch {
      say('이 사진은 올릴 수 없어요')
    }
  }

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy || (!text.trim() && !file)) return
    setBusy(true)
    try {
      await addEntry({ authorId: visitor.authorId, name: visitor.name, message: text.trim(), image: file })
      setText('')
      clearFile()
      say('방명록을 남겼어요')
      onDone()
    } catch (err) {
      console.error(err)
      say('남기지 못했어요. 다시 시도해 주세요')
    } finally {
      setBusy(false)
    }
  }

  const ready = Boolean(text.trim() || file)

  return (
    <form className="composer" onSubmit={submit}>
      <div className="composer__who">
        <b>{visitor.name}</b>(으)로 남겨요
        <button type="button" onClick={onEditName}>
          이름 바꾸기
        </button>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={300} rows={3} placeholder="AIRA와 함께한 오늘, 한마디 남겨 주세요" />
      {preview && (
        <div className="composer__preview">
          <img src={preview} alt="첨부한 사진" />
          <button type="button" aria-label="사진 빼기" onClick={clearFile}>
            <Icon src={closeIcon} width={18} color="#fff" />
          </button>
        </div>
      )}
      <div className="composer__bar">
        <button type="button" className="composer__attach" onClick={() => fileRef.current?.click()}>
          <Icon src={imageIcon} width={20} color="var(--color-sub)" />
          사진 첨부
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
        <span className="composer__count">{text.length}/300</span>
        <motion.button type="submit" className="composer__send" disabled={!ready || busy} whileTap={{ scale: 0.94 }} transition={spring}>
          {busy ? '남기는 중…' : '남기기'}
        </motion.button>
      </div>
    </form>
  )
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return '방금'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}
