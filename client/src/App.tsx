import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Inbox from './pages/Inbox'
import Collections from './pages/Collections'
import AreaView from './pages/AreaView'
import Settings from './pages/Settings'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/inbox"    element={<Inbox />} />
          <Route path="/colecoes" element={<Collections />} />
          <Route path="/area/:id" element={<AreaView />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
