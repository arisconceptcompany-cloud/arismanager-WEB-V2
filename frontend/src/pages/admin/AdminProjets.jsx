import { useState, useEffect } from 'react';
import { FolderKanban, Calendar, Users, Plus, Check, X, Clock, ChevronDown, ChevronUp, Eye, UserPlus } from 'lucide-react';
import { projetAPI } from '../../services/api';

function AdminProjets() {
  const [projets, setProjets] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [approbations, setApprobations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedProjets, setExpandedProjets] = useState({});
  const [newProjet, setNewProjet] = useState({
    titre: '',
    description: '',
    date_debut: '',
    date_fin_prevue: '',
    employe_ids: [],
    role_projet: 'Membre'
  });
  const [addingEmployes, setAddingEmployes] = useState({
    projet_id: null,
    employe_ids: [],
    role_projet: 'Membre'
  });

  useEffect(() => {
    fetchProjets();
    fetchEmployes();
  }, []);

  const fetchProjets = async () => {
    try {
      const response = await projetAPI.getAdminProjets();
      setProjets(response.data);
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployes = async () => {
    try {
      const response = await projetAPI.getEmployes();
      setEmployes(response.data);
    } catch (error) {
      console.error('Erreur chargement employes:', error);
    }
  };

  const fetchApprobations = async (projetId) => {
    try {
      const response = await projetAPI.getApprovations(projetId);
      setApprobations(response.data);
    } catch (error) {
      console.error('Erreur chargement approbations:', error);
    }
  };

  const handleAddProjet = async (e) => {
    e.preventDefault();
    try {
      await projetAPI.createProjet(newProjet);
      setShowAddModal(false);
      setNewProjet({
        titre: '',
        description: '',
        date_debut: '',
        date_fin_prevue: '',
        employe_ids: [],
        role_projet: 'Membre'
      });
      fetchProjets();
    } catch (error) {
      console.error('Erreur ajout projet:', error);
    }
  };

  const handleAddEmployes = async () => {
    if (!addingEmployes.projet_id || addingEmployes.employe_ids.length === 0) return;
    try {
      await projetAPI.assignEmployes(addingEmployes);
      setAddingEmployes({ projet_id: null, employe_ids: [], role_projet: 'Membre' });
      fetchProjets();
      if (selectedProjet) {
        fetchApprobations(selectedProjet.id);
      }
    } catch (error) {
      console.error('Erreur ajout employes:', error);
    }
  };

  const handleViewDetail = async (projet) => {
    setSelectedProjet(projet);
    await fetchApprobations(projet.id);
    setShowDetailModal(true);
  };

  const toggleExpand = (projetId) => {
    setExpandedProjets(prev => ({
      ...prev,
      [projetId]: !prev[projetId]
    }));
  };

  const getStatutBadge = (statut) => {
    const badges = {
      en_cours: 'bg-blue-500/20 text-blue-400',
      termine: 'bg-green-500/20 text-green-400',
      en_attente: 'bg-amber-500/20 text-amber-400',
      annule: 'bg-red-500/20 text-red-400'
    };
    return badges[statut] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatutLabel = (statut) => {
    const labels = {
      en_cours: 'En cours',
      termine: 'Terminé',
      en_attente: 'En attente',
      annule: 'Annulé'
    };
    return labels[statut] || statut;
  };

  const getApprobationBadge = (statut) => {
    const badges = {
      approuve: 'bg-green-500/20 text-green-400',
      rejete: 'bg-red-500/20 text-red-400',
      en_attente: 'bg-amber-500/20 text-amber-400'
    };
    return badges[statut] || 'bg-gray-500/20 text-gray-400';
  };

  const getApprobationLabel = (statut) => {
    const labels = {
      approuve: 'Approuvé',
      rejete: 'Rejeté',
      en_attente: 'En attente'
    };
    return labels[statut] || statut;
  };

  const toggleEmployeSelection = (empId) => {
    setNewProjet(prev => ({
      ...prev,
      employe_ids: prev.employe_ids.includes(empId)
        ? prev.employe_ids.filter(id => id !== empId)
        : [...prev.employe_ids, empId]
    }));
  };

  const toggleAddEmployeSelection = (empId) => {
    setAddingEmployes(prev => ({
      ...prev,
      employe_ids: prev.employe_ids.includes(empId)
        ? prev.employe_ids.filter(id => id !== empId)
        : [...prev.employe_ids, empId]
    }));
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Projets</h1>
          <p className="text-white/70">Creer et gerer les projets de l'entreprise</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Nouveau projet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <FolderKanban className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-white/70">Total</p>
              <p className="text-2xl font-bold text-white">{projets.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="text-green-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-white/70">Approuves</p>
              <p className="text-2xl font-bold text-white">{projets.reduce((sum, p) => sum + (p.nb_approuves || 0), 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <X className="text-red-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-white/70">Rejetes</p>
              <p className="text-2xl font-bold text-white">{projets.reduce((sum, p) => sum + (p.nb_rejetes || 0), 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Clock className="text-amber-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-white/70">En attente</p>
              <p className="text-2xl font-bold text-white">{projets.reduce((sum, p) => sum + (p.nb_en_attente || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <FolderKanban size={24} /> Tous les projets
        </h2>

        {projets.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban size={64} className="mx-auto text-white/30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucun projet</h3>
            <p className="text-white/60">Creez votre premier projet pour commencer</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projets.map((projet) => (
              <div key={projet.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => toggleExpand(projet.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{projet.titre}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadge(projet.statut)}`}>
                          {getStatutLabel(projet.statut)}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 mb-3">{projet.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-white/50">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {projet.date_debut ? new Date(projet.date_debut).toLocaleDateString('fr-FR') : '-'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={14} />
                          {projet.nb_employes || 0} employe(s)
                        </span>
                        <span className="flex items-center gap-1.5 text-green-400">
                          <Check size={14} />
                          {projet.nb_approuves || 0} approuve(s)
                        </span>
                        <span className="flex items-center gap-1.5 text-red-400">
                          <X size={14} />
                          {projet.nb_rejetes || 0} rejete(s)
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <Clock size={14} />
                          {projet.nb_en_attente || 0} en attente
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewDetail(projet); }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Voir details"
                      >
                        <Eye size={18} className="text-blue-400" />
                      </button>
                      {expandedProjets[projet.id] ? (
                        <ChevronUp size={20} className="text-white/50" />
                      ) : (
                        <ChevronDown size={20} className="text-white/50" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedProjets[projet.id] && (
                  <div className="border-t border-white/10 p-5 bg-black/20">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-white font-medium">Reponses des employes</h4>
                      <button
                        onClick={() => setAddingEmployes({ projet_id: projet.id, employe_ids: [], role_projet: 'Membre' })}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm transition-colors"
                      >
                        <UserPlus size={14} />
                        Ajouter employe
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {projets.find(p => p.id === projet.id)?.employes?.map(emp => (
                        <div key={emp.id} className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {emp.prenom?.[0]}{emp.nom?.[0]}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{emp.prenom} {emp.nom}</p>
                            <p className="text-xs text-white/50">{emp.poste}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprobationBadge(emp.approbation_statut || 'en_attente')}`}>
                            {getApprobationLabel(emp.approbation_statut || 'en_attente')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Nouveau projet</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAddProjet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Titre du projet *</label>
                <input
                  type="text"
                  value={newProjet.titre}
                  onChange={(e) => setNewProjet({ ...newProjet, titre: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Nom du projet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Description</label>
                <textarea
                  value={newProjet.description}
                  onChange={(e) => setNewProjet({ ...newProjet, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 min-h-24"
                  placeholder="Description du projet"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Date de debut *</label>
                  <input
                    type="date"
                    value={newProjet.date_debut}
                    onChange={(e) => setNewProjet({ ...newProjet, date_debut: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Date de fin prevue *</label>
                  <input
                    type="date"
                    value={newProjet.date_fin_prevue}
                    onChange={(e) => setNewProjet({ ...newProjet, date_fin_prevue: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Role dans le projet</label>
                <select
                  value={newProjet.role_projet}
                  onChange={(e) => setNewProjet({ ...newProjet, role_projet: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Membre">Membre</option>
                  <option value="Chef de projet">Chef de projet</option>
                  <option value="Developpeur">Developpeur</option>
                  <option value="Designer">Designer</option>
                  <option value="Testeur">Testeur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Attribuer a (employes) *</label>
                <div className="max-h-48 overflow-y-auto bg-white/5 rounded-lg p-3 space-y-2">
                  {employes.map(emp => (
                    <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProjet.employe_ids.includes(emp.id)}
                        onChange={() => toggleEmployeSelection(emp.id)}
                        className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">{emp.prenom} {emp.nom}</p>
                        <p className="text-white/50 text-xs">{emp.poste} - {emp.departement}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {newProjet.employe_ids.length > 0 && (
                  <p className="text-sm text-blue-400 mt-2">{newProjet.employe_ids.length} employe(s) selectionne(s)</p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={newProjet.employe_ids.length === 0}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Creer le projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedProjet && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">{selectedProjet.titre}</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadge(selectedProjet.statut)}`}>
                {getStatutLabel(selectedProjet.statut)}
              </span>
            </div>
            <p className="text-white/80 mb-4">{selectedProjet.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-xs text-white/50 mb-1">Date de debut</p>
                <p className="text-white font-medium">{selectedProjet.date_debut ? new Date(selectedProjet.date_debut).toLocaleDateString('fr-FR') : '-'}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-xs text-white/50 mb-1">Date de fin prevue</p>
                <p className="text-white font-medium">{selectedProjet.date_fin_prevue ? new Date(selectedProjet.date_fin_prevue).toLocaleDateString('fr-FR') : '-'}</p>
              </div>
            </div>

            <h4 className="text-white font-medium mb-4">Reponses des employes ({approbations.length})</h4>
            <div className="space-y-3">
              {approbations.map(emp => (
                <div key={emp.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {emp.prenom?.[0]}{emp.nom?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{emp.prenom} {emp.nom}</p>
                      <p className="text-white/50 text-xs">{emp.poste} - {emp.role_projet}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getApprobationBadge(emp.statut || 'en_attente')}`}>
                      {getApprobationLabel(emp.statut || 'en_attente')}
                    </span>
                  </div>
                  {emp.date_reponse && (
                    <p className="text-xs text-white/50 mb-1">
                      Repondu le: {new Date(emp.date_reponse).toLocaleDateString('fr-FR')} a {new Date(emp.date_reponse).toLocaleTimeString('fr-FR')}
                    </p>
                  )}
                  {emp.commentaire && (
                    <p className="text-sm text-white/70 italic mt-2 p-2 bg-white/5 rounded">{emp.commentaire}</p>
                  )}
                </div>
              ))}
              {approbations.length === 0 && (
                <p className="text-white/50 text-center py-4">Aucun employe assigne</p>
              )}
            </div>

            <div className="flex gap-3 pt-6">
              <button onClick={() => {
                setAddingEmployes({ projet_id: selectedProjet.id, employe_ids: [], role_projet: 'Membre' });
              }} className="flex-1 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg font-medium">
                <UserPlus size={16} className="inline mr-2" />
                Ajouter employe
              </button>
              <button onClick={() => setShowDetailModal(false)} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {addingEmployes.projet_id && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setAddingEmployes({ projet_id: null, employe_ids: [], role_projet: 'Membre' })}>
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Ajouter des employes</h3>
              <button onClick={() => setAddingEmployes({ projet_id: null, employe_ids: [], role_projet: 'Membre' })} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Role dans le projet</label>
                <select
                  value={addingEmployes.role_projet}
                  onChange={(e) => setAddingEmployes({ ...addingEmployes, role_projet: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Membre">Membre</option>
                  <option value="Chef de projet">Chef de projet</option>
                  <option value="Developpeur">Developpeur</option>
                  <option value="Designer">Designer</option>
                  <option value="Testeur">Testeur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Selectionner les employes</label>
                <div className="max-h-64 overflow-y-auto bg-white/5 rounded-lg p-3 space-y-2">
                  {employes.map(emp => (
                    <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addingEmployes.employe_ids.includes(emp.id)}
                        onChange={() => toggleAddEmployeSelection(emp.id)}
                        className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">{emp.prenom} {emp.nom}</p>
                        <p className="text-white/50 text-xs">{emp.poste}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setAddingEmployes({ projet_id: null, employe_ids: [], role_projet: 'Membre' })} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium">
                  Annuler
                </button>
                <button
                  onClick={handleAddEmployes}
                  disabled={addingEmployes.employe_ids.length === 0}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter ({addingEmployes.employe_ids.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProjets;
