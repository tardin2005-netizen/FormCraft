import { useState, useEffect } from 'react'
import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Inbox from './pages/Inbox'
import Collections from './pages/Collections'
import AreaView from './pages/AreaView'
import Settings from './pages/Settings'
import SearchPalette from './components/SearchPalette'

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <BrowserRouter>
      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
      <Routes>
        <Route path="/" element={<Dashboard onOpenSearch={() => setSearchOpen(true)} />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/colecoes" element={<Collections />} />
        <Route path="/area/:id" element={<AreaView />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}
