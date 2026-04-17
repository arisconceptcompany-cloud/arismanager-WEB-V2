import { useState, useEffect } from 'react';
import { FolderKanban, Calendar, Users, Plus } from 'lucide-react';
import { projetAPI } from '../services/api';

function Projets() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjet, setNewProjet] = useState({ titre: '', description: '', date_debut: '', date_fin_prevue: '' });

  useEffect(() => { fetchProjets(); }, []);

  const fetchProjets = async () => {
    try {
      const response = await projetAPI.getProjets();
      setProjets(response.data);
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjetClick = async (projetId) => {
    try {
      const response = await projetAPI.getProjetById(projetId);
      setSelectedProjet(response.data);
    } catch (error) {
      console.error('Erreur chargement détail projet:', error);
    }
  };

  const handleAddProjet = async (e) => {
    e.preventDefault();
    try {
      await projetAPI.createProjet(newProjet);
      setShowAddModal(false);
      setNewProjet({ titre: '', description: '', date_debut: '', date_fin_prevue: '' });
      fetchProjets();
    } catch (error) {
      console.error('Erreur ajout projet:', error);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = { en_cours: 'bg-amber-500/20 text-amber-400', termine: 'bg-green-500/20 text-green-400', en_attente: 'bg-blue-500/20 text-blue-400', annule: 'bg-red-500/20 text-red-400' };
    return badges[statut] || 'bg-blue-500/20 text-blue-400';
  };

  const getStatutLabel = (statut) => {
    const labels = { en_cours: 'En cours', termine: 'Terminé', en_attente: 'En attente', annule: 'Annulé' };
    return labels[statut] || statut;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><p className="text-white bg-black/50 px-4 py-2 rounded-lg">Chargement...</p></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projets</h1>
          <p className="text-white/70">Consulter et suivre vos projets</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors backdrop-blur-sm">
          <Plus size={18} />
          Nouveau projet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center"><FolderKanban className="text-blue-400" size={20} /></div>
            <div>
              <h3 className="text-sm text-white/70">Projets actifs</h3>
              <div className="text-2xl font-bold text-white">{projets.filter(p => p.statut === 'en_cours').length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center"><Calendar className="text-amber-400" size={20} /></div>
            <div>
              <h3 className="text-sm text-white/70">Projets en attente</h3>
              <div className="text-2xl font-bold text-white">{projets.filter(p => p.statut === 'en_attente').length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2"><FolderKanban size={24} /> Mes projets</h2>

        {projets.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban size={64} className="mx-auto text-white/30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucun projet</h3>
            <p className="text-white/60">Vous n'êtes actuellement assigné à aucun projet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projets.map((projet) => (
              <div key={projet.id} onClick={() => handleProjetClick(projet.id)} className="bg-white/10 p-5 rounded-xl border border-white/20 cursor-pointer hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-white">{projet.titre}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadge(projet.statut)}`}>{getStatutLabel(projet.statut)}</span>
                </div>
                <p className="text-sm text-white/60 mb-4 line-clamp-2">{projet.description}</p>
                <div className="flex justify-between items-center text-xs text-white/50">
                  <span className="flex items-center gap-1.5"><Users size={14} />{projet.role_projet || 'Membre'}</span>
                  {projet.date_fin_prevue && <span className="flex items-center gap-1.5"><Calendar size={14} />{new Date(projet.date_fin_prevue).toLocaleDateString('fr-FR')}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProjet && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedProjet(null)}>
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">{selectedProjet.titre}</h3>
              <button onClick={() => setSelectedProjet(null)} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${getStatutBadge(selectedProjet.statut)}`}>{getStatutLabel(selectedProjet.statut)}</span>
            <p className="text-white/80 mb-5 leading-relaxed">{selectedProjet.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-white/10 p-4 rounded-lg">
                <label className="text-xs text-white/50 block mb-1">Date de début</label>
                <span className="text-white font-medium">{selectedProjet.date_debut ? new Date(selectedProjet.date_debut).toLocaleDateString('fr-FR') : '-'}</span>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <label className="text-xs text-white/50 block mb-1">Date de fin prévue</label>
                <span className="text-white font-medium">{selectedProjet.date_fin_prevue ? new Date(selectedProjet.date_fin_prevue).toLocaleDateString('fr-FR') : '-'}</span>
              </div>
            </div>
            {selectedProjet.employes?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white/70 mb-3">Équipe du projet</h4>
                <div className="space-y-2">
                  {selectedProjet.employes.map((emp) => (
                    <div key={emp.id} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                      <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">{emp.prenom?.[0]}{emp.nom?.[0]}</div>
                      <div>
                        <div className="font-medium text-white">{emp.prenom} {emp.nom}</div>
                        <div className="text-xs text-white/50">{emp.role_projet} - {emp.poste}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Nouveau projet</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAddProjet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Titre du projet</label>
                <input type="text" value={newProjet.titre} onChange={(e) => setNewProjet({ ...newProjet, titre: e.target.value })} required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500" placeholder="Nom du projet" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Description</label>
                <textarea value={newProjet.description} onChange={(e) => setNewProjet({ ...newProjet, description: e.target.value })} required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 min-h-24" placeholder="Description du projet" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Date de début</label>
                  <input type="date" value={newProjet.date_debut} onChange={(e) => setNewProjet({ ...newProjet, date_debut: e.target.value })} required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Date de fin prévue</label>
                  <input type="date" value={newProjet.date_fin_prevue} onChange={(e) => setNewProjet({ ...newProjet, date_fin_prevue: e.target.value })} required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium">Annuler</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projets;
