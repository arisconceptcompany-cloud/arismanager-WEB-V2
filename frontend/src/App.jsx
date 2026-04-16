import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI } from './services/api';
import { UserProvider, useUser } from './context/UserContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Pointages from './pages/Pointages';
import Conges from './pages/Conges';
import Projets from './pages/Projets';
import Salaires from './pages/Salaires';
import Rapports from './pages/Rapports';
import Chat from './pages/Chat';
import Layout from './components/Layout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmployes from './pages/admin/AdminEmployes';
import AdminPresences from './pages/admin/AdminPresences';
import AdminSalaires from './pages/admin/AdminSalaires';
import AdminConges from './pages/admin/AdminConges';
import AdminRapports from './pages/admin/AdminRapports';
import AdminBadges from './pages/admin/AdminBadges';
import AdminLayout from './components/AdminLayout';
import AdminChat from './pages/admin/AdminChat';
import './App.css';

function AppContent() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, [setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <p className="text-slate-400 text-lg">Chargement...</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to={isAdmin ? "/admin" : "/"} /> : <Login setUser={setUser} />} 
      />
      
      {isAdmin ? (
        <>
          <Route path="/admin" element={<AdminLayout user={user}><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/profile" element={<AdminLayout user={user}><Profile /></AdminLayout>} />
          <Route path="/admin/employes" element={<AdminLayout user={user}><AdminEmployes /></AdminLayout>} />
          <Route path="/admin/presences" element={<AdminLayout user={user}><AdminPresences /></AdminLayout>} />
          <Route path="/admin/salaires" element={<AdminLayout user={user}><AdminSalaires /></AdminLayout>} />
          <Route path="/admin/conges" element={<AdminLayout user={user}><AdminConges /></AdminLayout>} />
          <Route path="/admin/rapports" element={<AdminLayout user={user}><AdminRapports /></AdminLayout>} />
          <Route path="/admin/badges" element={<AdminLayout user={user}><AdminBadges /></AdminLayout>} />
          <Route path="/admin/chat" element={<AdminLayout user={user}><AdminChat /></AdminLayout>} />
        </>
      ) : (
        <>
          <Route path="/" element={<Layout user={user}><Dashboard /></Layout>} />
          <Route path="/profile" element={<Layout user={user}><Profile /></Layout>} />
          <Route path="/pointages" element={<Layout user={user}><Pointages /></Layout>} />
          <Route path="/conges" element={<Layout user={user}><Conges /></Layout>} />
          <Route path="/projets" element={<Layout user={user}><Projets /></Layout>} />
          <Route path="/salaires" element={<Layout user={user}><Salaires /></Layout>} />
          <Route path="/rapports" element={<Layout user={user}><Rapports /></Layout>} />
          <Route path="/chat" element={<Layout user={user}><Chat /></Layout>} />
        </>
      )}
      
      <Route 
        path="*" 
        element={user ? <Navigate to={isAdmin ? "/admin" : "/"} /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
}

function App() {
  const [initialUser, setInitialUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.checkAuth();
        setInitialUser(response.data.user);
      } catch (error) {
        setInitialUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <p className="text-slate-400 text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <UserProvider initialUser={initialUser}>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
