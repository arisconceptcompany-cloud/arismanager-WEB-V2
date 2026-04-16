import { useState, useEffect } from 'react';
import { FileText, Plus, Send } from 'lucide-react';
import { rapportAPI } from '../services/api';

function Rapports() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRapport, setEditingRapport] = useState(null);
  const [formData, setFormData] = useState({ titre: '', contenu: '', type: 'quotidien', date_rapport: new Date().toISOString().split('T')[0] });

  useEffect(() => { fetchRapports(); }, []);

  const fetchRapports = async () => {
    try {
      const response = await rapportAPI.getRapports();
      setRapports(response.data);
    } catch (error) {
      console.error('Erreur chargement rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRapport) {
        await rapportAPI.updateRapport(editingRapport.id, formData);
      } else {
        await rapportAPI.createRapport(formData);
      }
      setShowModal(false);
      setEditingRapport(null);
      setFormData({ titre: '', contenu: '', type: 'quotidien', date_rapport: new Date().toISOString().split('T')[0] });
      fetchRapports();
    } catch (error) {
      console.error('Erreur enregistrement rapport:', error);
    }
  };

  const handleSubmitRapport = async (rapportId) => {
    try {
      await rapportAPI.submitRapport(rapportId);
      fetchRapports();
    } catch (error) {
      console.error('Erreur soumission rapport:', error);
    }
  };

  const handleEdit = (rapport) => {
    setEditingRapport(rapport);
    setFormData({ titre: rapport.titre, contenu: rapport.contenu, type: rapport.type, date_rapport: rapport.date_rapport });
    setShowModal(true);
  };

  const getStatutBadge = (statut) => {
    const badges = { brouillon: 'bg-blue-500/20 text-blue-400', soumis: 'bg-amber-500/20 text-amber-400', approuve: 'bg-green-500/20 text-green-400', rejete: 'bg-red-500/20 text-red-400' };
    return badges[statut] || 'bg-blue-500/20 text-blue-400';
  };

  const getTypeLabel = (type) => ({ quotidien: 'Quotidien', hebdomadaire: 'Hebdomadaire', mensuel: 'Mensuel' })[type] || type;

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><p className="text-white bg-black/50 px-4 py-2 rounded-lg">Chargement...</p></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mes Rapports</h1>
          <p className="text-white/70">Rédigez et soumettez vos rapports d'activité</p>
        </div>
        <button onClick={() => { setEditingRapport(null); setFormData({ titre: '', contenu: '', type: 'quotidien', date_rapport: new Date().toISOString().split('T')[0] }); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors backdrop-blur-sm">
          <Plus size={18} /> Nouveau rapport
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center"><FileText className="text-blue-400" size={20} /></div>
            <div>
              <h3 className="text-sm text-white/70">Total des rapports</h3>
              <div className="text-2xl font-bold text-white">{rapports.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center"><FileText className="text-green-400" size={20} /></div>
            <div>
              <h3 className="text-sm text-white/70">Rapports approuvés</h3>
              <div className="text-2xl font-bold text-white">{rapports.filter(r => r.statut === 'approuve').length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center"><FileText className="text-amber-400" size={20} /></div>
            <div>
              <h3 className="text-sm text-white/70">En attente</h3>
              <div className="text-2xl font-bold text-white">{rapports.filter(r => r.statut === 'soumis' || r.statut === 'en_attente').length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2"><FileText size={24} /> Historique des rapports</h2>
        </div>

        {rapports.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={64} className="mx-auto text-white/30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucun rapport</h3>
            <p className="text-white/60">Commencez par rédiger votre premier rapport</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase">Titre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rapports.map((rapport) => (
                  <tr key={rapport.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{new Date(rapport.date_rapport).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 text-sm text-white">{rapport.titre}</td>
                    <td className="px-6 py-4 text-sm text-white">{getTypeLabel(rapport.type)}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadge(rapport.statut)}`}>{rapport.statut}</span></td>
                    <td className="px-6 py-4">
                      {rapport.statut === 'brouillon' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleSubmitRapport(rapport.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"><Send size={12} /> Soumettre</button>
                          <button onClick={() => handleEdit(rapport)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium">Modifier</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">{editingRapport ? 'Modifier le rapport' : 'Nouveau rapport'}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Titre</label>
                <input type="text" value={formData.titre} onChange={(e) => setFormData({ ...formData, titre: e.target.value })} placeholder="Titre de votre rapport" required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Type de rapport</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="quotidien">Quotidien</option>
                    <option value="hebdomadaire">Hebdomadaire</option>
                    <option value="mensuel">Mensuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Date du rapport</label>
                  <input type="date" value={formData.date_rapport} onChange={(e) => setFormData({ ...formData, date_rapport: e.target.value })} required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Contenu</label>
                <textarea value={formData.contenu} onChange={(e) => setFormData({ ...formData, contenu: e.target.value })} placeholder="Rédigez votre rapport..." rows={6} required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium">Annuler</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">{editingRapport ? 'Mettre à jour' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rapports;
