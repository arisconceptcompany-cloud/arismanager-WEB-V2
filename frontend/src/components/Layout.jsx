import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, User, Clock, Calendar, FolderKanban, 
  Wallet, FileText, LogOut, MessageCircle, Bell, X, Check, CheckCheck, Menu, X as CloseIcon, Lock, Eye, EyeOff
} from 'lucide-react';
import { authAPI, chatAPI, notificationAPI, DEFAULT_AVATAR } from '../services/api';
import { useUser } from '../context/UserContext';

function Layout({ user, children }) {
  const navigate = useNavigate();
  const { profilePhoto, getAvatarUrl, handlePhotoError, photoError } = useUser();

  const getSidebarPhoto = () => {
    if (profilePhoto && profilePhoto.startsWith('data:')) {
      return profilePhoto;
    }
    return getAvatarUrl();
  };
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await chatAPI.getUnreadCount();
        setUnreadCount(res.data.unread || 0);
      } catch (error) {
        console.error('Erreur unread:', error);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNotifCount = async () => {
      try {
        const res = await notificationAPI.getUnreadCount();
        setNotifCount(res.data.unread || 0);
      } catch (error) {
        console.error('Erreur notif count:', error);
      }
    };
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showNotifs) {
      fetchNotifications();
    }
  }, [showNotifs]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [sidebarOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Erreur notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Erreur logout:', error);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    navigate('/login', { replace: true });
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, est_lu: true })));
      setNotifCount(0);
    } catch (error) {
      console.error('Erreur mark all read:', error);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, est_lu: true } : n));
      setNotifCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur mark read:', error);
    }
  };

  const getNotifIcon = (type) => {
    const icons = {
      conge_approuve: <Check className="w-4 h-4 text-green-400" />,
      conge_rejete: <X className="w-4 h-4 text-red-400" />,
      conge_demande: <Bell className="w-4 h-4 text-blue-400" />
    };
    return icons[type] || <Bell className="w-4 h-4 text-gray-400" />;
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/profile', icon: User, label: 'Mon profile' },
    { path: '/pointages', icon: Clock, label: 'Mes pointages' },
    { path: '/conges', icon: Calendar, label: 'Mes congés', badge: notifCount },
    { path: '/projets', icon: FolderKanban, label: 'Projets' },
    { path: '/salaires', icon: Wallet, label: 'Mon salaire' },
    { path: '/rapports', icon: FileText, label: 'Mon rapport' },
  ];

  const getInitials = (nom, prenom) => {
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  };

  const closeSidebar = () => setSidebarOpen(false);

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    setPasswordLoading(true);
    try {
      await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', 'Mot de passe changé avec succès !');
    } catch (error) {
      setPasswordError(error.response?.data?.error || 'Erreur lors du changement de mot de passe');
      showToast('error', 'Échec du changement de mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside className={`${isMobile ? 'fixed' : 'sticky'} top-0 h-screen left-0 z-50 w-64 bg-black/95 lg:bg-black/40 backdrop-blur-md border-r border-white/20 flex flex-col ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''} transition-transform duration-300`}>
        <div className="p-4 lg:p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img 
                src={getSidebarPhoto()} 
                alt="Profil" 
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-blue-400"
                onError={handlePhotoError}
              />
              <div className="lg:block">
                <h2 className="text-white font-semibold text-sm lg:text-base">{user?.prenom} {user?.nom}</h2>
                <p className="text-xs text-blue-400 font-medium">{user?.matricule}</p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
            >
              <CloseIcon size={20} className="text-white" />
            </button>
          </div>
          <div className="text-center hidden lg:block">
            <span className="text-xs text-white/50">ARIS MANAGER</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          ))}
          <NavLink
            to="/chat"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <MessageCircle size={20} />
              <span className="text-sm font-medium">Messages</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>

          <div className="border-t border-white/20 my-4 pt-4">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className={`flex items-center justify-between w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all duration-200 ${showNotifs ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-3">
                <Bell size={20} />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              {notifCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="mt-2 max-h-64 lg:max-h-80 overflow-y-auto bg-slate-800/50 rounded-lg border border-white/10">
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 sticky top-0 bg-slate-800">
                  <span className="text-xs text-white/50">Notifications</span>
                  {notifCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300"
                    >
                      <CheckCheck size={12} /> Tout lire
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-white/40 text-xs">
                    Aucune notification
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => { if (!notif.est_lu) handleMarkRead(notif.id); if (notif.lien) navigate(notif.lien); setShowNotifs(false); closeSidebar(); }}
                      className={`px-3 py-2 border-b border-white/5 hover:bg-white/5 cursor-pointer ${notif.est_lu ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white font-medium truncate">{notif.titre}</p>
                          <p className="text-[10px] text-white/60 truncate">{notif.message}</p>
                        </div>
                        {!notif.est_lu && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-white/20">
          <div className="bg-white/10 rounded-lg p-3 mb-3">
            <div className="text-xs text-white/50 mb-1">Département</div>
            <div className="text-sm text-white font-medium">{user?.departement || 'Non assigné'}</div>
            <div className="text-xs text-white/50 mt-1">{user?.poste}</div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all mb-2"
          >
            <Lock size={18} />
            <span className="hidden sm:inline">Changer mot de passe</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className={`flex-1 min-h-screen transition-all duration-300`}>
        <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white/10 rounded-lg"
          >
            <Menu size={24} className="text-white" />
          </button>
          <h1 className="text-white font-semibold">ARIS MANAGER</h1>
          <div className="w-10"></div>
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {notification && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-slide-in min-w-[280px] ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
          </div>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-slate-800 rounded-xl w-full max-w-md border border-white/20" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/20 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Lock size={22} /> Changer le mot de passe
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-white/50 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 pr-12"
                    placeholder="Entrez le mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 pr-12"
                    placeholder="Minimum 6 caractères"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 pr-12"
                    placeholder="Confirmez le nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {passwordError && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      En cours...
                    </>
                  ) : (
                    'Confirmer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
