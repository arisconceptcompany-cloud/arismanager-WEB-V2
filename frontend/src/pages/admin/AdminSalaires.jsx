import { useState, useEffect } from 'react';
import { FileText, Upload, Download, X, Trash2, File, Search } from 'lucide-react';
import api, { fichePaieAPI, DEFAULT_AVATAR } from '../../services/api';

function AdminSalaires() {
  const [fiches, setFiches] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [selectedEmploye, setSelectedEmploye] = useState('');
  const [selectedMois, setSelectedMois] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterEmploye, setFilterEmploye] = useState('all');
  const [filterAnnee, setFilterAnnee] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [fichesRes, empRes] = await Promise.all([
        fichePaieAPI.admin.getAll(),
        api.get('/admin/employes')
      ]);
      setFiches(fichesRes.data || []);
      setEmployes(empRes.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMois = (mois, annee) => {
    const moisLabels = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    return `${moisLabels[mois - 1] || mois} ${annee}`;
  };

  const getEmployeName = (id) => {
    const emp = employes.find(e => e.id === id);
    return emp ? `${emp.prenom} ${emp.nom}` : '-';
  };

  const getEmploye = (id) => employes.find(e => e.id === id);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedEmploye || !selectedMois) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('fichier', selectedFile);
      formData.append('employe_id', selectedEmploye);
      formData.append('mois', parseInt(selectedMois.split('-')[1]));
      formData.append('annee', parseInt(selectedMois.split('-')[0]));

      await fichePaieAPI.admin.upload(formData);
      setSelectedFile(null);
      setSelectedEmploye('');
      setSelectedMois('');
      document.getElementById('fileInput').value = '';
      fetchData();
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette fiche de paie ?')) return;
    try {
      await fichePaieAPI.admin.delete(id);
      fetchData();
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleDownload = async (fiche) => {
    try {
      const res = await fichePaieAPI.downloadFiche(fiche.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fiche.nom || `Fiche_Paie_${fiche.mois}_${fiche.annee}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    }
  };

  const employesAvecFiche = new Set();
  if (selectedMois) {
    const [annee, mois] = selectedMois.split('-').map(Number);
    fiches.forEach(f => {
      if (f.mois === mois && f.annee === annee) {
        employesAvecFiche.add(f.employe_id);
      }
    });
  }
  const employesDisponibles = employes.filter(emp => !employesAvecFiche.has(emp.id));

  const filteredFiches = fiches.filter(f => {
    if (filterEmploye !== 'all' && f.employe_id !== parseInt(filterEmploye)) return false;
    if (filterAnnee && `${f.annee}-${String(f.mois).padStart(2, '0')}` !== filterAnnee) return false;
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><p className="text-white bg-black/50 px-4 py-2 rounded-lg">Chargement...</p></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Fiches de Paie</h1>
        <p className="text-white/70">Envoyer et gérer les fiches de paie des employés</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Upload size={24} /> Envoyer une fiche de paie
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedEmploye}
              onChange={(e) => setSelectedEmploye(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="" className="bg-slate-800 text-white/60">Sélectionner un employé</option>
              {employesDisponibles.length === 0 && selectedMois ? (
                <option value="" disabled className="bg-slate-800 text-white/50">Tous les employés ont déjà une fiche pour ce mois</option>
              ) : (
                employesDisponibles.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-slate-800 text-white">{emp.prenom} {emp.nom} ({emp.matricule})</option>
                ))
              )}
            </select>

            <input
              type="month"
              value={selectedMois}
              onChange={(e) => setSelectedMois(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
            />

            <input
              id="fileInput"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:cursor-pointer file:font-medium"
            />
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-3">
                <File size={24} className="text-red-400" />
                <div>
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-white/50 text-sm">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedFile(null); document.getElementById('fileInput').value = ''; }}
                className="text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedFile || !selectedEmploye || !selectedMois || uploading}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Envoyer la fiche de paie
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-white/50" />
            <select
              value={filterEmploye}
              onChange={(e) => setFilterEmploye(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="all" className="bg-slate-800 text-white">Tous les employés</option>
              {employes.map(emp => (
                <option key={emp.id} value={emp.id} className="bg-slate-800 text-white">{emp.prenom} {emp.nom}</option>
              ))}
            </select>
          </div>
          <input
            type="month"
            value={filterAnnee}
            onChange={(e) => setFilterAnnee(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FileText size={24} /> Fiches de paie envoyées
          </h2>
        </div>

        {filteredFiches.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={64} className="mx-auto text-white/30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucune fiche de paie</h3>
            <p className="text-white/60">Les fiches de paie envoyées apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-3 p-6">
            {filteredFiches.map((fiche) => {
              const emp = getEmploye(fiche.employe_id);
              return (
                <div
                  key={fiche.id}
                  className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {emp?.photo ? (
                      <img src={emp.photo} alt="" className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${emp?.photo ? 'hidden' : 'bg-gradient-to-br from-red-500 to-orange-600'}`}
                    >
                      {emp?.prenom?.[0]}{emp?.nom?.[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {getEmployeName(fiche.employe_id)}
                      </h3>
                      <p className="text-sm text-white/50">
                        {formatMois(fiche.mois, fiche.annee)} — {fiche.nom || 'Fiche de paie'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(fiche)}
                      className="p-2 hover:bg-white/10 rounded-lg text-green-400 hover:text-green-300 transition-colors"
                      title="Télécharger"
                    >
                      <Download size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(fiche.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                      <span className="text-sm font-medium">Supprimer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSalaires;