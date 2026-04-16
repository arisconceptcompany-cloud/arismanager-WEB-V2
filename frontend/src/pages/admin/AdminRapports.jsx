import { useState, useEffect } from 'react';
import { FileText, Check, X, Clock, User } from 'lucide-react';
import api from '../../services/api';

function AdminRapports() {
  const [rapports, setRapports] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rapportRes, empRes] = await Promise.all([
        api.get('/admin/rapports'),
        api.get('/admin/employes')
      ]);
      setRapports(rapportRes.data || []);
      setEmployes(empRes.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/rapports/${id}/${action}`);
      fetchData();
    } catch (error) {
      console.error('Erreur action:', error);
      alert('Erreur lors de l\'action');
    }
  };

  const filteredRapports = rapports.filter(r => {
    if (filter === 'all') return true;
    return r.statut === filter;
  }).sort((a, b) => new Date(b.date_rapport) - new Date(a.date_rapport));

  const getStatusBadge = (statut) => {
    const badges = {
      brouillon: 'bg-gray-500',
      soumis: 'bg-yellow-500',
      approuve: 'bg-green-500',
      rejete: 'bg-red-500'
    };
    const labels = {
      brouillon: 'Brouillon',
      soumis: 'Soumis',
      approuve: 'Approuvé',
      rejete: 'Rejeté'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm text-white ${badges[statut]}`}>
        {labels[statut]}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const types = {
      quotidien: 'Quotidien',
      hebdomadaire: 'Hebdomadaire',
      mensuel: 'Mensuel'
    };
    return types[type] || type;
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
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Rapports</h1>
          <p className="text-white/70">Consultez et validez les rapports des employés</p>
        </div>
        <div className="flex gap-2">
          {['all', 'soumis', 'approuve', 'rejete'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-red-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'soumis' ? 'Soumis' : f === 'approuve' ? 'Approuvés' : 'Rejetés'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredRapports.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-white/30" />
            <p className="text-white/50">Aucun rapport</p>
          </div>
        ) : (
          filteredRapports.map(rapport => (
            <div key={rapport.id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {rapport.prenom?.[0]}{rapport.nom?.[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{rapport.prenom} {rapport.nom}</h3>
                    <p className="text-white/50 text-sm">{rapport.matricule}</p>
                  </div>
                </div>
                {getStatusBadge(rapport.statut)}
              </div>

              <div className="mt-4">
                <h4 className="text-white font-medium text-xl mb-2">{rapport.titre}</h4>
                <div className="flex items-center gap-4 text-white/50 text-sm mb-4">
                  <span className="flex items-center gap-1">
                    <FileText size={14} />
                    {getTypeLabel(rapport.type)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(rapport.date_rapport).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {rapport.contenu && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/80 whitespace-pre-wrap">{rapport.contenu}</p>
                  </div>
                )}
              </div>

              {rapport.statut === 'soumis' && (
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => handleAction(rapport.id, 'rejeter')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                  >
                    <X size={18} />
                    Rejeter
                  </button>
                  <button
                    onClick={() => handleAction(rapport.id, 'approuver')}
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

export default AdminRapports;
