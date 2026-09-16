import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAreasStore } from '../store/areasStore'
import { useAreaItemsStore } from '../store/areaItemsStore'
import { useChatMessagesStore } from '../store/chatMessagesStore'
import { useAuth } from '../contexts/AuthContext'
import s from './ChatView.module.css'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Hoje'
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function getInitials(name: string | null | undefined) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function useDeleteConfirm(onDelete: () => void) {
  const [confirming, setConfirming] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function request(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirming) {
      if (timer.current) clearTimeout(timer.current)
      setConfirming(false)
      onDelete()
    } else {
      setConfirming(true)
      timer.current = setTimeout(() => setConfirming(false), 3000)
    }
  }

  function cancel(e: React.MouseEvent) {
    e.stopPropagation()
    if (timer.current) clearTimeout(timer.current)
    setConfirming(false)
  }

  return { confirming, request, cancel }
}

function DeleteMsgBtn({ onDelete }: { onDelete: () => void }) {
  const { confirming, request, cancel } = useDeleteConfirm(onDelete)
  return confirming ? (
    <span className={s.deleteConfirm}>
      <span className={s.deleteConfirmLabel}>Apagar?</span>
      <button className={s.deleteConfirmYes} onClick={request} title="Confirmar">✓</button>
      <button className={s.deleteConfirmNo}  onClick={cancel}  title="Cancelar">✕</button>
    </span>
  ) : (
    <button className={s.msgDelete} onClick={request} title="Apagar mensagem">✕</button>
  )
}

export default function ChatView() {
  const { id: areaId, chatId } = useParams<{ id: string; chatId: string }>()
  const { areas } = useAreasStore()
  const { items } = useAreaItemsStore()
  const { messages, addMessage, deleteMessage } = useChatMessagesStore()
  const { user } = useAuth()

  const area = areas.find(a => a.id === areaId)
  const chat = items.find(i => i.id === chatId)
  const chatMessages = chatId ? messages.filter(m => m.chatId === chatId) : []

  const [text, setText] = useState('')
  const [file, setFile] = useState<{ data: string; name: string; type: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Limite: 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => {
      setFile({ data: ev.target!.result as string, name: f.name, type: f.type })
    }
    reader.readAsDataURL(f)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { alert('Arquivo muito grande. Limite: 5MB.'); return }
    const reader = new FileReader()
    reader.onload = ev => {
      setFile({ data: ev.target!.result as string, name: f.name, type: f.type })
    }
    reader.readAsDataURL(f)
  }

  function send() {
    if (!chatId) return
    const trimmed = text.trim()
    if (!trimmed && !file) return
    addMessage({
      chatId,
      text: trimmed,
      fileData: file?.data,
      fileName: file?.name,
      fileType: file?.type,
    })
    setText('')
    setFile(null)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  if (!area || !chat) return null

  type Group = { date: string; msgs: typeof chatMessages }
  const groups = chatMessages.reduce<Group[]>((acc, msg) => {
    const date = formatDate(msg.timestamp)
    const last = acc[acc.length - 1]
    if (last?.date === date) last.msgs.push(msg)
    else acc.push({ date, msgs: [msg] })
    return acc
  }, [])

  const initials = getInitials(user?.displayName)

  return (
    <div
      className={s.page}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className={s.chatHeader}>
        <span className={s.chatHashIcon}>#</span>
        <div className={s.chatInfo}>
          <span className={s.chatName}>{chat.title}</span>
          {chat.content && <span className={s.chatDesc}>{chat.content}</span>}
        </div>
        <span className={s.msgCount}>{chatMessages.length} {chatMessages.length === 1 ? 'mensagem' : 'mensagens'}</span>
      </div>

      <div className={s.messages}>
        {chatMessages.length === 0 && (
          <div className={s.emptyChat}>
            <div className={s.emptyChatIcon}>#</div>
            <div className={s.emptyChatTitle}>Início de #{chat.title}</div>
            <div className={s.emptyChatDesc}>
              Este é o começo do canal. Envie uma mensagem ou arraste um arquivo para começar.
            </div>
          </div>
        )}

        {groups.map(group => (
          <div key={group.date}>
            <div className={s.dateDivider}>
              <span className={s.dateLine} />
              <span className={s.dateText}>{group.date}</span>
              <span className={s.dateLine} />
            </div>
            {group.msgs.map((msg, idx) => {
              const prevMsg = group.msgs[idx - 1]
              const isGrouped = prevMsg && (
                new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 5 * 60 * 1000
              )
              return (
                <div key={msg.id} className={`${s.message} ${isGrouped ? s.messageGrouped : ''}`}>
                  {!isGrouped && (
                    <div className={s.msgAvatar} style={area.color ? { background: area.color } : {}}>
                      {user?.photoURL
                        ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                        : initials
                      }
                    </div>
                  )}
                  {isGrouped && <div className={s.msgAvatarSpace} />}
                  <div className={s.msgBody}>
                    {!isGrouped && (
                      <div className={s.msgMeta}>
                        <span className={s.msgSender}>{user?.displayName ?? 'Você'}</span>
                        <span className={s.msgTime}>{formatTime(msg.timestamp)}</span>
                      </div>
                    )}
                    {msg.text && <div className={s.msgText}>{msg.text}</div>}
                    {msg.fileData && msg.fileType?.startsWith('image/') && (
                      <div className={s.msgImgWrap}>
                        <img className={s.msgImg} src={msg.fileData} alt={msg.fileName} />
                      </div>
                    )}
                    {msg.fileData && !msg.fileType?.startsWith('image/') && (
                      <a className={s.msgFile} href={msg.fileData} download={msg.fileName}>
                        <span className={s.msgFileIcon}>📎</span>
                        <span className={s.msgFileName}>{msg.fileName}</span>
                        <span className={s.msgFileDown}>↓</span>
                      </a>
                    )}
                  </div>
                  <DeleteMsgBtn onDelete={() => deleteMessage(msg.id)} />
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={s.inputArea}>
        {file && (
          <div className={s.filePreview}>
            {file.type.startsWith('image/') && (
              <img className={s.fileThumb} src={file.data} alt={file.name} />
            )}
            {!file.type.startsWith('image/') && <span className={s.fileIcon}>📎</span>}
            <span className={s.fileName}>{file.name}</span>
            <button className={s.fileRemove} onClick={() => setFile(null)} title="Remover">✕</button>
          </div>
        )}
        <div className={s.inputBox}>
          <button
            className={s.attachBtn}
            onClick={() => fileInputRef.current?.click()}
            title="Anexar arquivo"
          >+</button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.csv,.xlsx,.pptx"
          />
          <textarea
            ref={textareaRef}
            className={s.textInput}
            placeholder={`Mensagem em #${chat.title}`}
            value={text}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className={s.sendBtn}
            onClick={send}
            disabled={!text.trim() && !file}
            title="Enviar (Enter)"
          >↑</button>
        </div>
        <div className={s.inputHint}>Enter para enviar · Shift+Enter para nova linha · Arraste arquivos para anexar</div>
      </div>
    </div>
  )
}
