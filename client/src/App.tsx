import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import FirestoreSync from './components/FirestoreSync'
import { useMigrateFaculdadeHub } from './hooks/useMigrateFaculdadeHub'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inbox from './pages/Inbox'
import Collections from './pages/Collections'
import AreaView from './pages/AreaView'
import ChatView from './pages/ChatView'
import Settings from './pages/Settings'
import Hubs from './pages/Hubs'
import HubView from './pages/HubView'
import Tarefas from './pages/Tarefas'
import ToolLibrary from './pages/ToolLibrary'
import WorkspaceView from './pages/WorkspaceView'

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
  useMigrateFaculdadeHub()

  if (loading) return <LoadingScreen />

  return (
    <>
      {user && <FirestoreSync />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route element={user ? <Layout /> : <Navigate to="/login" replace />}>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/inbox"         element={<Inbox />} />
          <Route path="/colecoes"      element={<Collections />} />
          <Route path="/area/:id"                    element={<AreaView />} />
          <Route path="/area/:id/chat/:chatId"      element={<ChatView />} />
          <Route path="/hubs"          element={<Hubs />} />
          <Route path="/hub/:id"       element={<HubView />} />
          <Route path="/tarefas"       element={<Tarefas />} />
          <Route path="/ferramentas"        element={<ToolLibrary />} />
          <Route path="/settings"           element={<Settings />} />
          <Route path="/workspace/:id"      element={<WorkspaceView />} />
        </Route>
      </Routes>
    </>
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
