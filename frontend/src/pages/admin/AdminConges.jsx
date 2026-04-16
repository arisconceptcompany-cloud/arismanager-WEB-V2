import { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock, User, FileText } from 'lucide-react';
import api from '../../services/api';

function AdminConges() {
  const [conges, setConges] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [congeRes, empRes] = await Promise.all([
        api.get('/admin/conges'),
        api.get('/admin/employes')
      ]);
      setConges(congeRes.data || []);
      setEmployes(empRes.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/admin/conges/${id}/${action}`);
      fetchData();
    } catch (error) {
      console.error('Erreur action:', error);
      alert('Erreur lors de l\'action');
    }
  };

  const filteredConges = conges.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'en_attente') return c.statut === 'en_attente';
    return c.statut === filter;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getEmployeName = (employeId) => {
    const emp = employes.find(e => e.id === employeId);
    return emp ? `${emp.prenom} ${emp.nom}` : '-';
  };

  const getTypeLabel = (type) => {
    const types = {
      annuel: 'Congé annuel',
      maladie: 'Maladie',
      maternite: 'Maternité',
      paternite: 'Paternité',
      sans_solde: 'Sans solde'
    };
    return types[type] || type;
  };

  const getStatusBadge = (statut) => {
    const badges = {
      en_attente: 'bg-yellow-500',
      approuve: 'bg-green-500',
      rejete: 'bg-red-500'
    };
    const labels = {
      en_attente: 'En attente',
      approuve: 'Approuvé',
      rejete: 'Rejeté'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm text-white ${badges[statut]}`}>
        {labels[statut]}
      </span>
    );
  };

  const pendingCount = conges.filter(c => c.statut === 'en_attente').length;

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
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Congés</h1>
          <p className="text-white/70">
            {pendingCount > 0 && (
              <span className="text-yellow-400 font-medium">{pendingCount} demande(s) en attente</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {['all', 'en_attente', 'approuve', 'rejete'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-red-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'en_attente' ? 'En attente' : f === 'approuve' ? 'Approuvés' : 'Rejetés'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredConges.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-white/30" />
            <p className="text-white/50">Aucune demande de congé</p>
          </div>
        ) : (
          filteredConges.map(conge => (
            <div key={conge.id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {conge.employe?.prenom?.[0]}{conge.employe?.nom?.[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{getEmployeName(conge.employe_id)}</h3>
                    <p className="text-white/50 text-sm">{conge.employe?.matricule} - {conge.employe?.poste}</p>
                  </div>
                </div>
                {getStatusBadge(conge.statut)}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/50 text-sm mb-1">Type de congé</p>
                  <p className="text-white font-medium">{getTypeLabel(conge.type_conge)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/50 text-sm mb-1">Période</p>
                  <p className="text-white font-medium">
                    {new Date(conge.date_debut).toLocaleDateString('fr-FR')} - {new Date(conge.date_fin).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/50 text-sm mb-1">Jours demandés</p>
                  <p className="text-white font-medium">{conge.jours_demandes} jour(s)</p>
                </div>
              </div>

              {conge.motif && (
                <div className="mt-4 bg-white/5 rounded-lg p-4">
                  <p className="text-white/50 text-sm mb-1">Motif</p>
                  <p className="text-white">{conge.motif}</p>
                </div>
              )}

              {conge.statut === 'en_attente' && (
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => handleAction(conge.id, 'rejeter')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                  >
                    <X size={18} />
                    Rejeter
                  </button>
                  <button
                    onClick={() => handleAction(conge.id, 'approuver')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Check size={18} />
                    Approuver
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminConges;
