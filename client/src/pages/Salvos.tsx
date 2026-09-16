import { useChatMessagesStore } from '../store/chatMessagesStore'
import { useAreaItemsStore } from '../store/areaItemsStore'
import { useAreasStore } from '../store/areasStore'
import { NavLink } from 'react-router-dom'
import s from './Salvos.module.css'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Salvos() {
  const { messages, bookmarkMessage } = useChatMessagesStore()
  const { items } = useAreaItemsStore()
  const { areas } = useAreasStore()

  const bookmarked = messages.filter(m => m.bookmarked)

  type Group = { chatId: string; msgs: typeof bookmarked }
  const groups = bookmarked.reduce<Group[]>((acc, msg) => {
    const last = acc.find(g => g.chatId === msg.chatId)
    if (last) last.msgs.push(msg)
    else acc.push({ chatId: msg.chatId, msgs: [msg] })
    return acc
  }, [])

  return (
    <div className={s.page}>
      <div className={s.header}>
        <span className={s.icon}>🔖</span>
        <div>
          <h1 className={s.title}>Salvos</h1>
          <p className={s.sub}>Mensagens marcadas como importantes em todos os canais</p>
        </div>
      </div>

      {bookmarked.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>🔖</div>
          <div className={s.emptyTitle}>Nenhuma mensagem salva ainda</div>
          <div className={s.emptySub}>Passe o mouse sobre uma mensagem num canal e clique em 🔖 para salvar aqui.</div>
        </div>
      ) : (
        <div className={s.groups}>
          {groups.map(({ chatId, msgs }) => {
            const chat = items.find(i => i.id === chatId)
            const area = chat ? areas.find(a => a.id === chat.areaId) : null
            return (
              <div key={chatId} className={s.group}>
                <div className={s.groupHeader}>
                  {area && <span className={s.groupEmoji}>{area.emoji}</span>}
                  <span className={s.groupName}># {chat?.title ?? 'Canal removido'}</span>
                  {chat && (
                    <NavLink
                      to={`/area/${chat.areaId}/chat/${chatId}`}
                      className={s.groupLink}
                    >Abrir canal →</NavLink>
                  )}
                </div>
                <div className={s.msgList}>
                  {msgs.map(msg => (
                    <div key={msg.id} className={s.msgCard}>
                      <div className={s.msgCardText}>
                        {msg.text || (msg.fileName && <span className={s.msgFile}>📎 {msg.fileName}</span>)}
                      </div>
                      <div className={s.msgCardMeta}>
                        <span className={s.msgCardDate}>{formatDate(msg.timestamp)}</span>
                        <button
                          className={s.unsaveBtn}
                          onClick={() => bookmarkMessage(msg.id)}
                          title="Remover dos salvos"
                        >✕ remover</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
