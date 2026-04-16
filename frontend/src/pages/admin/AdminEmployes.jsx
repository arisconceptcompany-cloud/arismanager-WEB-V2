import { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, X, User, Mail, Phone, MapPin, Briefcase, Building, Calendar, Shield } from 'lucide-react';
import api, { DEFAULT_AVATAR } from '../../services/api';

function AdminEmployes() {
  const [employes, setEmployes] = useState([]);
  const [filteredEmployes, setFilteredEmployes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [editingEmploye, setEditingEmploye] = useState(null);
  const [photoCache, setPhotoCache] = useState({});
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    poste: '',
    departement: '',
    telephone: '',
    adresse: '',
    date_embauche: '',
    role: 'employe',
    num_cin: '',
    num_cnaps: ''
  });

  useEffect(() => {
    fetchEmployes();
  }, []);

  useEffect(() => {
    const filtered = employes.filter(e =>
      `${e.nom} ${e.prenom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.poste && e.poste.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredEmployes(filtered);
  }, [searchQuery, employes]);

  const fetchEmployes = async () => {
    try {
      const res = await api.get('/admin/employes');
      setEmployes(res.data);
      setFilteredEmployes(res.data);
      preloadPhotos(res.data);
    } catch (error) {
      console.error('Erreur chargement employés:', error);
    } finally {
      setLoading(false);
    }
  };

  const preloadPhotos = (employeeList) => {
    const newCache = {};
    employeeList.forEach(emp => {
      const storedPhoto = localStorage.getItem(`profilePhoto_${emp.id}`);
      if (storedPhoto && (storedPhoto.startsWith('data:') || storedPhoto.startsWith('http'))) {
        newCache[emp.id] = storedPhoto;
      } else if (emp.photo && emp.photo.startsWith('data:')) {
        newCache[emp.id] = emp.photo;
        localStorage.setItem(`profilePhoto_${emp.id}`, emp.photo);
      } else {
        newCache[emp.id] = null;
      }
    });
    setPhotoCache(newCache);
    
    const toFetch = employeeList.filter(emp => !newCache[emp.id] && !emp.photo?.startsWith('data:'));
    toFetch.forEach(emp => {
      api.get(`/photos/employe/${emp.id}`, { responseType: 'blob' })
        .then(response => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result;
            localStorage.setItem(`profilePhoto_${emp.id}`, base64);
            setPhotoCache(prev => ({ ...prev, [emp.id]: base64 }));
          };
          reader.readAsDataURL(response.data);
        })
        .catch(() => {
          setPhotoCache(prev => ({ ...prev, [emp.id]: 'default' }));
        });
    });
  };

  const openAddModal = () => {
    setEditingEmploye(null);
    setFormData({
      matricule: '',
      nom: '',
      prenom: '',
      email: '',
      mot_de_passe: '',
      poste: '',
      departement: '',
      telephone: '',
      adresse: '',
      date_embauche: '',
      role: 'employe',
      num_cin: '',
      num_cnaps: ''
    });
    setShowModal(true);
  };

  const openEditModal = (employe) => {
    setEditingEmploye(employe);
    setFormData({
      matricule: employe.matricule,
      nom: employe.nom,
      prenom: employe.prenom,
      email: employe.email,
      mot_de_passe: '',
      poste: employe.poste || '',
      departement: employe.departement || '',
      telephone: employe.telephone || '',
      adresse: employe.adresse || '',
      date_embauche: employe.date_embauche || '',
      role: employe.role || 'employe',
      num_cin: employe.num_cin || '',
      num_cnaps: employe.num_cnaps || ''
    });
    setShowModal(true);
  };

  const openViewModal = (employe) => {
    setSelectedEmploye(employe);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmploye) {
        await api.put(`/admin/employes/${editingEmploye.id}`, formData);
      } else {
        await api.post('/admin/employes', formData);
      }
      setShowModal(false);
      fetchEmployes();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé?')) return;
    try {
      await api.delete(`/admin/employes/${id}`);
      fetchEmployes();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getInitials = (nom, prenom) => {
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-500',
      rh: 'bg-purple-500',
      employe: 'bg-blue-500'
    };
    const labels = {
      admin: 'Admin',
      rh: 'RH',
      employe: 'Employé'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${colors[role] || colors.employe}`}>
        {labels[role] || role}
      </span>
    );
  };

  const getDefaultAvatar = (employe) => `${DEFAULT_AVATAR}&name=${employe.prenom || ''}+${employe.nom || ''}`;

  const getPhotoUrl = (employe) => {
    const cached = photoCache[employe.id];
    if (cached === 'default') {
      return getDefaultAvatar(employe);
    }
    if (cached) {
      return cached;
    }
    const storedPhoto = localStorage.getItem(`profilePhoto_${employe.id}`);
    if (storedPhoto && (storedPhoto.startsWith('data:') || storedPhoto.startsWith('http'))) {
      return storedPhoto;
    }
    if (employe.photo && employe.photo.startsWith('data:')) {
      return employe.photo;
    }
    return null;
  };

  const handlePhotoError = (e) => {
    const emp = { prenom: e.target.dataset.prenom, nom: e.target.dataset.nom };
    e.target.src = getDefaultAvatar(emp);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-white bg-black/50 px-4 py-2 rounded-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Employés</h1>
          <p className="text-white/70">Total: {employes.length} employé(s)</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
        >
          <Plus size={20} />
          Nouvel Employé
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-white/50 border-b border-white/20">
                <th className="pb-3 px-2">Employé</th>
                <th className="pb-3 px-2">Matricule</th>
                <th className="pb-3 px-2">Poste</th>
                <th className="pb-3 px-2">Département</th>
                <th className="pb-3 px-2">Rôle</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployes.map((emp) => {
                const photoUrl = getPhotoUrl(emp);
                return (
                <tr key={emp.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      {photoUrl ? (
                        <img 
                          src={photoUrl} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover" 
                          data-prenom={emp.prenom}
                          data-nom={emp.nom}
                          onError={handlePhotoError}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(emp.nom, emp.prenom)}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{emp.prenom} {emp.nom}</p>
                        <p className="text-white/50 text-sm">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-white">{emp.matricule}</td>
                  <td className="py-4 px-2 text-white">{emp.poste || '-'}</td>
                  <td className="py-4 px-2 text-white">{emp.departement || '-'}</td>
                  <td className="py-4 px-2">{getRoleBadge(emp.role)}</td>
                  <td className="py-4 px-2">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openViewModal(emp)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                        title="Voir"
                      >
                        <User size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(emp)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/20 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                {editingEmploye ? 'Modifier l\'employé' : 'Nouvel Employé'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-sm mb-1">Matricule</label>
                  <input
                    type="text"
                    required
                    value={formData.matricule}
                    onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="ARIS-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">Rôle</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="employe">Employé</option>
                    <option value="rh">RH</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-sm mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              {!editingEmploye && (
                <div>
                  <label className="block text-white/50 text-sm mb-1">Mot de passe</label>
                  <input
                    type="password"
                    required
                    value={formData.mot_de_passe}
                    onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="Mot de passe par défaut"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-sm mb-1">Poste</label>
                  <input
                    type="text"
                    value={formData.poste}
                    onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">Département</label>
                  <input
                    type="text"
                    value={formData.departement}
                    onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-sm mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">N° CIN</label>
                  <input
                    type="text"
                    value={formData.num_cin}
                    onChange={(e) => setFormData({ ...formData, num_cin: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="N° CIN"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-sm mb-1">Date d'embauche</label>
                  <input
                    type="date"
                    value={formData.date_embauche}
                    onChange={(e) => setFormData({ ...formData, date_embauche: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">N° CNAPS</label>
                  <input
                    type="text"
                    value={formData.num_cnaps}
                    onChange={(e) => setFormData({ ...formData, num_cnaps: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="N° CNAPS"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  {editingEmploye ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedEmploye && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-slate-800 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/20 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Détails de l'employé</h3>
              <button onClick={() => setShowViewModal(false)} className="text-white/50 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {getInitials(selectedEmploye.nom, selectedEmploye.prenom)}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">{selectedEmploye.prenom} {selectedEmploye.nom}</h4>
                  <p className="text-white/50">{selectedEmploye.matricule}</p>
                  {getRoleBadge(selectedEmploye.role)}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/70">
                  <Mail size={18} />
                  <span>{selectedEmploye.email}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Phone size={18} />
                  <span>{selectedEmploye.telephone || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Briefcase size={18} />
                  <span>{selectedEmploye.poste || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Building size={18} />
                  <span>{selectedEmploye.departement || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <MapPin size={18} />
                  <span>{selectedEmploye.adresse || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Calendar size={18} />
                  <span>{selectedEmploye.date_embauche ? new Date(selectedEmploye.date_embauche).toLocaleDateString('fr-FR') : '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <User size={18} />
                  <span>{selectedEmploye.num_cin || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Shield size={18} />
                  <span>{selectedEmploye.num_cnaps || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEmployes;
