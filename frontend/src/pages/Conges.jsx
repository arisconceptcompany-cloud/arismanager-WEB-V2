import { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { congeAPI } from '../services/api';

function Conges() {
  const [conges, setConges] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [newConge, setNewConge] = useState({
    type_conge: 'annuel',
    date_debut: '',
    date_fin: '',
    jours_demandes: 0,
    motif: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [congesRes, statsRes] = await Promise.all([
        congeAPI.getConges(),
        congeAPI.getStats()
      ]);
      setConges(congesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur chargement congés:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateJours = () => {
    if (newConge.date_debut && newConge.date_fin) {
      const debut = new Date(newConge.date_debut);
      const fin = new Date(newConge.date_fin);
      if (fin >= debut) {
        const diffTime = fin - debut;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setNewConge(prev => ({ ...prev, jours_demandes: diffDays }));
      }
    }
  };

  const handleDateChange = (field, value) => {
    setNewConge(prev => ({ ...prev, [field]: value }));
    setError('');
    setTimeout(() => {
      if (field === 'date_debut') {
        setNewConge(prev => {
          if (prev.date_fin) {
            const debut = new Date(value);
            const fin = new Date(prev.date_fin);
            if (fin >= debut) {
              const diffDays = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
              return { ...prev, jours_demandes: diffDays };
            }
          }
          return prev;
        });
      } else if (field === 'date_fin') {
        setNewConge(prev => {
          if (prev.date_debut) {
            const debut = new Date(prev.date_debut);
            const fin = new Date(value);
            if (fin >= debut) {
              const diffDays = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
              return { ...prev, jours_demandes: diffDays };
            }
          }
          return prev;
        });
      }
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newConge.jours_demandes <= 0) {
      setError('Veuillez sélectionner des dates valides');
      return;
    }

    try {
      await congeAPI.addConge(newConge);
      setShowModal(false);
      setNewConge({ type_conge: 'annuel', date_debut: '', date_fin: '', jours_demandes: 0, motif: '' });
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.error || 'Erreur lors de la soumission';
      setError(msg);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      approuve: 'bg-green-500/20 text-green-400',
      en_attente: 'bg-amber-500/20 text-amber-400',
      rejete: 'bg-red-500/20 text-red-400'
    };
    return badges[statut] || 'bg-blue-500/20 text-blue-400';
  };

  const getStatutIcon = (statut) => {
    const icons = {
      approuve: <CheckCircle size={16} className="text-green-400" />,
      en_attente: <Clock size={16} className="text-amber-400" />,
      rejete: <XCircle size={16} className="text-red-400" />
    };
    return icons[statut];
  };

  const getTypeLabel = (type) => {
    const types = { annuel: 'Congé annuel', maladie: 'Congé maladie', maternite: 'Congé maternité', paternite: 'Congé paternité', sans_solde: 'Sans solde' };
    return types[type] || type;
  };

  const joursApprouves = stats.reduce((acc, s) => acc + (s.jours_approuves || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><p className="text-white bg-black/50 px-4 py-2 rounded-lg">Chargement...</p></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Mes Congés</h1>
          <p className="text-white/70 text-sm sm:text-base">Gérez vos demandes de congés</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all w-full sm:w-auto justify-center">
          <Plus size={18} /> <span className="sm:hidden">Nouvelle</span><span className="hidden sm:inline">Nouvelle demande</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 md:mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-full flex items-center justify-center"><CheckCircle className="text-green-400" size={18} /></div>
            <div>
              <h3 className="text-xs sm:text-sm text-white/70">Jours approuvés</h3>
              <div className="text-xl sm:text-2xl font-bold text-white">{joursApprouves}</div>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-full flex items-center justify-center"><Calendar className="text-blue-400" size={18} /></div>
            <div>
              <h3 className="text-xs sm:text-sm text-white/70">Demandes totales</h3>
              <div className="text-xl sm:text-2xl font-bold text-white">{conges.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-white/20">
          <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2"><Calendar size={20} /> Historique des congés</h2>
        </div>

        {conges.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Calendar size={48} className="mx-auto text-white/30 mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Aucune demande de congé</h3>
            <p className="text-white/60 text-sm">Soumettez votre première demande de congé</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white/70 uppercase">Type</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white/70 uppercase">Date début</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white/70 uppercase">Date fin</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white/70 uppercase">Jours</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white/70 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {conges.map((conge) => (
                    <tr key={conge.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-white">{getTypeLabel(conge.type_conge)}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-white">{new Date(conge.date_debut).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-white">{new Date(conge.date_fin).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-white">{conge.jours_demandes}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatutBadge(conge.statut)}`}>
                          {getStatutIcon(conge.statut)} {conge.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden p-4 space-y-3">
              {conges.map((conge) => (
                <div key={conge.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-medium">{getTypeLabel(conge.type_conge)}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatutBadge(conge.statut)}`}>
                      {getStatutIcon(conge.statut)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-white/70">
                    <div>
                      <span className="block text-white/50">Début</span>
                      <span className="text-white">{new Date(conge.date_debut).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div>
                      <span className="block text-white/50">Fin</span>
                      <span className="text-white">{new Date(conge.date_fin).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div>
                      <span className="block text-white/50">Jours</span>
                      <span className="text-white">{conge.jours_demandes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-800 rounded-xl p-4 sm:p-6 w-full max-w-md backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Nouvelle demande de congé</h3>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Type de congé</label>
                <select value={newConge.type_conge} onChange={(e) => setNewConge({ ...newConge, type_conge: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="annuel">Congé annuel</option>
                  <option value="maladie">Congé maladie</option>
                  <option value="maternite">Congé maternité</option>
                  <option value="paternite">Congé paternité</option>
                  <option value="sans_solde">Sans solde</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Date début</label>
                  <input type="date" value={newConge.date_debut} onChange={(e) => handleDateChange('date_debut', e.target.value)} required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Date fin</label>
                  <input type="date" value={newConge.date_fin} onChange={(e) => handleDateChange('date_fin', e.target.value)} required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Nombre de jours</label>
                <div className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 font-semibold text-center">
                  {newConge.jours_demandes > 0 ? `${newConge.jours_demandes} jour${newConge.jours_demandes > 1 ? 's' : ''}` : '-'}
                </div>
              </div>
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2 text-red-300 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Motif (optionnel)</label>
                <textarea value={newConge.motif} onChange={(e) => setNewConge({ ...newConge, motif: e.target.value })} placeholder="Décrivez le motif..." className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 min-h-20" />
              </div>
              <div className="flex gap-3 pt-2 sm:pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium">Annuler</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Soumettre</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Conges;
