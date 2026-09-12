import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inbox from './pages/Inbox'
import Collections from './pages/Collections'
import AreaView from './pages/AreaView'
import Settings from './pages/Settings'

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#08080f', color: 'rgba(255,255,255,0.4)', fontSize: 14,
    }}>
      ⬡ FormCraft
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route element={user ? <Layout /> : <Navigate to="/login" replace />}>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/inbox"    element={<Inbox />} />
        <Route path="/colecoes" element={<Collections />} />
        <Route path="/area/:id" element={<AreaView />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  )
}
