import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, User, Clock, Calendar, FolderKanban, 
  Wallet, FileText, LogOut, MessageCircle, Users, DollarSign, Shield, 
  ChevronDown, ChevronRight, Crown, UserMinus, QrCode, Search, X, Check, AlertCircle, Loader2, Bell, CheckCheck, Menu, Lock, Eye, EyeOff
} from 'lucide-react';
import { authAPI, chatAPI, notificationAPI, DEFAULT_AVATAR } from '../services/api';
import { useUser } from '../context/UserContext';
import api from '../services/api';

function AdminLayout({ user, children }) {
  const navigate = useNavigate();
  const { profilePhoto, getAvatarUrl, handlePhotoError } = useUser();

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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [employes, setEmployes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', onConfirm: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [notification, setNotification] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    if (showNotifs) {
      fetchNotifications();
    }
  }, [showNotifs]);

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

  useEffect(() => {
    if (showAdminPanel) {
      fetchEmployes();
    }
  }, [showAdminPanel]);

  const fetchEmployes = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/employes');
      setEmployes(res.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setIsLoading(false);
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

  const toggleAdminRole = async (employe) => {
    const newRole = employe.role === 'admin' ? 'employe' : 'admin';
    const action = newRole === 'admin' ? 'nommer' : 'retirer';
    
    setModalContent({
      title: `${action === 'nommer' ? 'Nommer Admin' : 'Retirer Admin'}`,
      message: `Voulez-vous ${action} ${employe.prenom} ${employe.nom} ${newRole === 'admin' ? 'en tant qu\'admin' : 'du rôle admin'} ?`,
      icon: action === 'nommer' ? <Crown className="w-12 h-12 text-yellow-400" /> : <AlertCircle className="w-12 h-12 text-red-400" />,
      onConfirm: async () => {
        try {
          await api.put(`/admin/employes/${employe.id}`, {
            nom: employe.nom,
            prenom: employe.prenom,
            email: employe.email,
            poste: employe.poste,
            departement: employe.departement,
            telephone: employe.telephone,
            adresse: employe.adresse,
            date_embauche: employe.date_embauche,
            role: newRole
          });
          setModalContent(prev => ({ ...prev, success: true, message: `${action === 'nommer' ? 'Admin nommé' : 'Rôle admin retiré'} avec succès !`, icon: <Check className="w-12 h-12 text-green-400" /> }));
          fetchEmployes();
          setTimeout(() => setShowModal(false), 1500);
        } catch (error) {
          setModalContent(prev => ({ ...prev, error: true, message: 'Erreur lors de la modification du rôle', icon: <AlertCircle className="w-12 h-12 text-red-400" /> }));
        }
      }
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalContent({ title: '', message: '', onConfirm: null, icon: null });
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
      conge_demande: <Bell className="w-4 h-4 text-yellow-400" />,
      conge_approuve: <Check className="w-4 h-4 text-green-400" />,
      conge_rejete: <X className="w-4 h-4 text-red-400" />
    };
    return icons[type] || <Bell className="w-4 h-4 text-gray-400" />;
  };

  const adminCount = employes.filter(e => e.role === 'admin').length;
  const employeCount = employes.filter(e => e.role === 'employe').length;
  const rhCount = employes.filter(e => e.role === 'rh').length;
  
  const filteredEmployes = employes.filter(emp => {
    const matchesSearch = `${emp.prenom} ${emp.nom} ${emp.matricule}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const [pendingConges, setPendingConges] = useState(0);

  useEffect(() => {
    const fetchPendingConges = async () => {
      try {
        const res = await api.get('/admin/conges?statut=en_attente');
        setPendingConges(res.data.conges?.length || 0);
      } catch (error) {
        console.error('Erreur pending conges:', error);
      }
    };
    fetchPendingConges();
    const interval = setInterval(fetchPendingConges, 60000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/admin/profile', icon: User, label: 'Mon profile' },
    { path: '/admin/employes', icon: Users, label: 'Employés' },
    { path: '/admin/presences', icon: Clock, label: 'Présences' },
    { path: '/admin/salaires', icon: DollarSign, label: 'Salaires' },
    { path: '/admin/conges', icon: Calendar, label: 'Congés', badge: pendingConges + notifCount },
    { path: '/admin/rapports', icon: FileText, label: 'Rapports' },
    { path: '/admin/badges', icon: Shield, label: 'Badges' },
  ];

  const getInitials = (nom, prenom) => {
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 xl:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside className={`fixed xl:static inset-y-0 left-0 z-50 w-64 bg-slate-900/95 xl:bg-gradient-to-b xl:from-slate-900 xl:to-slate-800 backdrop-blur-md border-r border-white/20 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'} xl:block fixed h-screen`}>
        <div className="p-4 xl:p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img 
                src={getSidebarPhoto()} 
                alt="Profil" 
                className="w-10 h-10 xl:w-12 xl:h-12 rounded-full object-cover border-2 border-red-400"
                onError={handlePhotoError}
              />
              <div className="hidden sm:block">
                <h2 className="text-white font-semibold text-sm xl:text-base">{user?.prenom} {user?.nom}</h2>
                <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                  <Shield size={10} /> Admin
                </p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="xl:hidden p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
          <div className="text-center hidden xl:block">
            <span className="text-xs text-white/50">ARIS MANAGER - ADMIN</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-auto bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          ))}
          <NavLink
            to="/admin/chat"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 xl:px-4 py-2.5 xl:py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-red-600 text-white'
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
              className={`flex items-center justify-between w-full px-3 xl:px-4 py-2.5 xl:py-3 rounded-lg transition-all duration-200 ${showNotifs ? 'bg-red-600 text-white' : 'text-white/70 hover:bg-white/10'}`}
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
              <div className="mt-2 max-h-64 xl:max-h-80 overflow-y-auto bg-slate-800/50 rounded-lg border border-white/10">
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500 pr-12"
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500 pr-12"
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500 pr-12"
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
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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

export default AdminLayout;
