import { useState } from 'react'
import { Link } from 'react-router-dom'
import s from './Collections.module.css'

const COLLECTIONS = [
  {
    id: '1',
    title: 'Referências de UI',
    count: 24,
    thumb: ['#7c6ef7', '#4f8ef7', '#3ecf8e', '#f78c4f'],
  },
  {
    id: '2',
    title: 'Leituras de UX',
    count: 18,
    thumb: ['#e46ef7', '#7c6ef7', '#4f8ef7', '#3ecf8e'],
  },
  {
    id: '3',
    title: 'Dev Tools',
    count: 31,
    thumb: ['#3ecf8e', '#4f8ef7', '#f78c4f', '#e46ef7'],
  },
  {
    id: '4',
    title: 'Inspirações de motion',
    count: 12,
    thumb: ['#f78c4f', '#e46ef7', '#7c6ef7', '#3ecf8e'],
  },
  {
    id: '5',
    title: 'Artigos para TCC',
    count: 9,
    thumb: ['#4f8ef7', '#3ecf8e', '#7c6ef7', '#e46ef7'],
  },
]

export default function Collections() {
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.headerLeft}>
          <span className={s.logo}>⬡ FormCraft</span>
          <nav className={s.nav}>
            <Link to="/" className={s.navItem}>Dashboard</Link>
            <Link to="/inbox" className={s.navItem}>Inbox</Link>
            <Link to="/colecoes" className={`${s.navItem} ${s.navActive}`}>Coleções</Link>
          </nav>
        </div>
        <button className={s.addBtn} onClick={() => setModalOpen(true)}>+ Nova coleção</button>
      </header>

      <div className={s.content}>
        <h1 className={s.pageTitle}>Coleções</h1>

        <div className={s.grid}>
          {COLLECTIONS.map((c) => (
            <div key={c.id} className={s.card}>
              <div className={s.thumbRow}>
                <div className={s.thumbBig} style={{ background: c.thumb[0] }} />
                <div className={s.thumbStack}>
                  <div style={{ background: c.thumb[1] }} />
                  <div style={{ background: c.thumb[2] }} />
                </div>
              </div>
              <div className={s.cardInfo}>
                <div className={s.cardTitle}>{c.title}</div>
                <div className={s.cardCount}>{c.count} itens</div>
              </div>
            </div>
          ))}

          {/* Add card */}
          <button className={s.addCard} onClick={() => setModalOpen(true)}>
            <span className={s.addIcon}>+</span>
            <span>Nova coleção</span>
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className={s.backdrop} onClick={() => setModalOpen(false)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Nova coleção</h3>
            <input
              className={s.modalInput}
              placeholder="Nome da coleção..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <div className={s.modalBtns}>
              <button className={s.modalCancel} onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className={s.modalSave} onClick={() => setModalOpen(false)}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
