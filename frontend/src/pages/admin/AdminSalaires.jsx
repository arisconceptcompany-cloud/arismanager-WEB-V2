import { useState, useEffect } from 'react';
import { DollarSign, Search, Edit, X, Save, User, Calendar } from 'lucide-react';
import api from '../../services/api';

function AdminSalaires() {
  const [salaires, setSalaires] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [selectedSalaire, setSelectedSalaire] = useState(null);
  const [editingSalaire, setEditingSalaire] = useState(null);
  const [formData, setFormData] = useState({
    salaire_base: '',
    primes: '',
    deductions: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [filterEmploye, setFilterEmploye] = useState('all');
  const [filterMois, setFilterMois] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salaireRes, empRes] = await Promise.all([
        api.get('/admin/salaires'),
        api.get('/admin/employes')
      ]);
      setSalaires(salaireRes.data || []);
      setEmployes(empRes.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSalaires = salaires.filter(s => {
    if (filterEmploye !== 'all' && s.employe_id !== parseInt(filterEmploye)) return false;
    if (filterMois && !`${s.annee}-${String(s.mois).padStart(2, '0')}`.includes(filterMois)) return false;
    return true;
  });

  const openEditModal = (salaire) => {
    setEditingSalaire(salaire);
    setFormData({
      salaire_base: salaire.salaire_base,
      primes: salaire.primes || 0,
      deductions: salaire.deductions || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const salaire_net = parseFloat(formData.salaire_base) + parseFloat(formData.primes || 0) - parseFloat(formData.deductions || 0);
      await api.put(`/admin/salaires/${editingSalaire.id}`, {
        ...formData,
        salaire_net
      });
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const getEmployeName = (employeId) => {
    const emp = employes.find(e => e.id === employeId);
    return emp ? `${emp.prenom} ${emp.nom}` : '-';
  };

  const formatMonth = (mois, annee) => {
    const date = new Date(annee, mois - 1);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getStatusBadge = (statut) => {
    const badges = {
      paye: 'bg-green-500',
      en_attente: 'bg-yellow-500'
    };
    const labels = {
      paye: 'Payé',
      en_attente: 'En attente'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${badges[statut] || 'bg-gray-500'}`}>
        {labels[statut] || statut}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Salaires</h1>
          <p className="text-white/70">Gérez les salaires des employés</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterEmploye}
            onChange={(e) => setFilterEmploye(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">Tous les employés</option>
            {employes.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>
            ))}
          </select>
          <input
            type="month"
            value={filterMois}
            onChange={(e) => setFilterMois(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-white/50 border-b border-white/20 bg-white/5">
              <th className="p-4">Employé</th>
              <th className="p-4">Période</th>
              <th className="p-4">Salaire Base</th>
              <th className="p-4">Primes</th>
              <th className="p-4">Déductions</th>
              <th className="p-4">Salaire Net</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalaires.map(salaire => (
              <tr key={salaire.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {salaire.employe?.prenom?.[0]}{salaire.employe?.nom?.[0]}
                    </div>
                    <span className="text-white">{getEmployeName(salaire.employe_id)}</span>
                  </div>
                </td>
                <td className="p-4 text-white">{formatMonth(salaire.mois, salaire.annee)}</td>
                <td className="p-4 text-white">{formatCurrency(salaire.salaire_base)}</td>
                <td className="p-4 text-green-400">+{formatCurrency(salaire.primes || 0)}</td>
                <td className="p-4 text-red-400">-{formatCurrency(salaire.deductions || 0)}</td>
                <td className="p-4 text-white font-semibold">{formatCurrency(salaire.salaire_net)}</td>
                <td className="p-4">{getStatusBadge(salaire.statut_paiement)}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => openEditModal(salaire)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && editingSalaire && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-800 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/20 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Modifier le Salaire</h3>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <User size={20} className="text-white/50" />
                  <div>
                    <p className="text-white font-medium">{getEmployeName(editingSalaire.employe_id)}</p>
                    <p className="text-white/50 text-sm">{formatMonth(editingSalaire.mois, editingSalaire.annee)}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">Salaire de base</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.salaire_base}
                  onChange={(e) => setFormData({ ...formData, salaire_base: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">Primes</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.primes}
                  onChange={(e) => setFormData({ ...formData, primes: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">Déductions</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <p className="text-white/50 text-sm">Salaire Net</p>
                <p className="text-green-400 text-2xl font-bold">
                  {formatCurrency(
                    (parseFloat(formData.salaire_base) || 0) +
                    (parseFloat(formData.primes) || 0) -
                    (parseFloat(formData.deductions) || 0)
                  )}
                </p>
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
                  <Save size={18} className="inline mr-2" />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSalaires;
