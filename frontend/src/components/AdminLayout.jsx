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
  const { profilePhoto } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [employes, setEmployes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', onConfirm: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [notification, setNotification] = useState(null);

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
      message: `Voulez-vous ${action} ${employe.prenom} ${employe.nom} ${newRole === 'admin' ? "en tant qu'admin" : 'du rôle admin'} ?`,
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

  return (
    <div className="flex min-h-screen">
      <aside style={{ width: '260px', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.2)', position: 'fixed', left: 0, top: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt="Profil" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-400"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-red-400">
                  {getInitials(user?.nom, user?.prenom)}
                </div>
              )}
              <div>
                <h2 className="text-white font-semibold text-base">{user?.prenom} {user?.nom}</h2>
                <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                  <Shield size={10} /> Admin
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs text-white/50">ARIS MANAGER - ADMIN</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
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
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
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
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${showNotifs ? 'bg-red-600 text-white' : 'text-white/70 hover:bg-white/10'}`}
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
              <div className="mt-2 max-h-80 overflow-y-auto bg-slate-800/50 rounded-lg border border-white/10">
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
                      onClick={() => { if (!notif.est_lu) handleMarkRead(notif.id); if (notif.lien) navigate(notif.lien); setShowNotifs(false); }}
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

          <div className="border-t border-white/20 my-4 pt-4">
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 bg-white/5 hover:bg-white/10 text-white"
            >
              <div className="flex items-center gap-3">
                <Crown size={20} className="text-yellow-400" />
                <span className="text-sm font-medium">Gestion Admin</span>
              </div>
              {showAdminPanel ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {showAdminPanel && (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-red-500/20 rounded-lg p-2 text-center border border-red-500/30">
                    <div className="text-lg font-bold text-red-400">{adminCount}</div>
                    <div className="text-[10px] text-white/60">Admins</div>
                  </div>
                  <div className="bg-blue-500/20 rounded-lg p-2 text-center border border-blue-500/30">
                    <div className="text-lg font-bold text-blue-400">{employeCount}</div>
                    <div className="text-[10px] text-white/60">Employés</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-2 text-center border border-purple-500/30">
                    <div className="text-lg font-bold text-purple-400">{rhCount}</div>
                    <div className="text-[10px] text-white/60">RH</div>
                  </div>
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-red-500/50"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex gap-1 flex-wrap">
                  {['all', 'admin', 'employe', 'rh'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setFilterRole(role)}
                      className={`flex-1 px-2 py-1.5 text-[10px] rounded-lg transition-colors ${
                        filterRole === role
                          ? role === 'admin' ? 'bg-red-600 text-white'
                            : role === 'employe' ? 'bg-blue-600 text-white'
                            : role === 'rh' ? 'bg-purple-600 text-white'
                            : 'bg-white/20 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {role === 'all' ? 'Tous' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="max-h-48 xl:max-h-64 overflow-y-auto space-y-1 pr-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 size={24} className="animate-spin text-white/40" />
                    </div>
                  ) : filteredEmployes.length === 0 ? (
                    <div className="text-center py-4 text-white/40 text-xs">
                      Aucun résultat
                    </div>
                  ) : (
                    filteredEmployes.map((emp) => (
                      <div
                        key={emp.id}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                          emp.role === 'admin' 
                            ? 'bg-red-500/20 border border-red-500/30' 
                            : emp.role === 'rh'
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-white/5 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <img 
                            src={emp.photo || `${DEFAULT_AVATAR}&name=${emp.prenom || ''}+${emp.nom || ''}`} 
                            alt="" 
                            className="w-8 h-8 rounded-full object-cover"
                            data-prenom={emp.prenom}
                            data-nom={emp.nom}
                            onError={(e) => {
                              e.target.src = `${DEFAULT_AVATAR}&name=${emp.prenom || ''}+${emp.nom || ''}`;
                            }}
                          />
                          <div className="overflow-hidden min-w-0">
                            <p className="text-white text-xs truncate font-medium">{emp.prenom} {emp.nom}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-white/50">{emp.matricule}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                emp.role === 'admin' ? 'bg-red-500/30 text-red-300' 
                                  : emp.role === 'rh' ? 'bg-purple-500/30 text-purple-300'
                                  : 'bg-blue-500/30 text-blue-300'
                              }`}>
                                {emp.role === 'rh' ? 'RH' : emp.role}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {emp.role !== 'admin' ? (
                            <button
                              onClick={() => toggleAdminRole(emp)}
                              className="p-1.5 hover:bg-yellow-500/30 rounded text-yellow-400 hover:text-yellow-300 transition-colors"
                              title="Nommer admin"
                            >
                              <Crown size={14} />
                            </button>
                          ) : emp.id !== user.id && (
                            <button
                              onClick={() => toggleAdminRole(emp)}
                              className="p-1.5 hover:bg-red-500/30 rounded text-red-400 hover:text-red-300 transition-colors"
                              title="Retirer admin"
                            >
                              <UserMinus size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
            <span>Changer mot de passe</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: '260px', flex: 1, minHeight: '100vh' }}>
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-white/10 w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 flex items-center gap-3">
              {modalContent.icon && <div className="flex-shrink-0">{modalContent.icon}</div>}
              <h3 className="text-white font-semibold text-lg">{modalContent.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-white/90 mb-6">{modalContent.message}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Fermer
                </button>
                {!modalContent.success && !modalContent.error && (
                  <button
                    onClick={() => { modalContent.onConfirm?.(); }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Confirmer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
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