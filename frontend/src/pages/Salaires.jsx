import { useState, useEffect } from 'react';
import { FileText, Download, Maximize2, X, File, Trash2 } from 'lucide-react';
import { fichePaieAPI } from '../services/api';
import api from '../services/api';
import { useUser } from '../context/UserContext';

function Salaires() {
  const { user } = useUser();
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerFiche, setViewerFiche] = useState(null);
  const [viewerUrl, setViewerUrl] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => { fetchFiches(); }, []);

  const fetchFiches = async () => {
    try {
      const res = await fichePaieAPI.getFiches();
      setFiches(res.data || []);
    } catch (error) {
      console.error('Erreur chargement fiches de paie:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMois = (mois, annee) => {
    const moisLabels = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    return `${moisLabels[mois - 1] || mois} ${annee}`;
  };

  const handleDownload = async (fiche) => {
    setDownloading(fiche.id);
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
    } finally {
      setDownloading(null);
    }
  };

  const openViewer = async (fiche) => {
    setViewerFiche(fiche);
    setViewerLoading(true);
    try {
      const res = await fichePaieAPI.downloadFiche(fiche.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setViewerUrl(url);
    } catch (error) {
      console.error('Erreur chargement PDF:', error);
      setViewerFiche(null);
    } finally {
      setViewerLoading(false);
    }
  };

  const closeViewer = () => {
    if (viewerUrl) window.URL.revokeObjectURL(viewerUrl);
    setViewerUrl(null);
    setViewerFiche(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette fiche de paie ?')) return;
    try {
      await api.delete(`/admin/fiches-paie/${id}`);
      setFiches(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><p className="text-white bg-black/50 px-4 py-2 rounded-lg">Chargement...</p></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Fiche de Paye</h1>
        <p className="text-white/70">Consultez et téléchargez vos fiches de paie</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FileText size={24} /> Mes fiches de paie
          </h2>
        </div>

        {fiches.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={64} className="mx-auto text-white/30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucune fiche de paie</h3>
            <p className="text-white/60">Vos fiches de paie apparaîtront ici une fois publiées par l'administration</p>
          </div>
        ) : (
          <div className="space-y-3 p-6">
            {fiches.map((fiche) => (
              <div
                key={fiche.id}
                className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <File size={24} className="text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-medium truncate">
                      Fiche de paie - {formatMois(fiche.mois, fiche.annee)}
                    </h3>
                    <p className="text-sm text-white/50">
                      {fiche.nom || `Fiche_Paie_${fiche.mois}_${fiche.annee}.pdf`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openViewer(fiche)}
                    className="p-2 hover:bg-white/10 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                    title="Voir en plein écran"
                  >
                    <Maximize2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDownload(fiche)}
                    disabled={downloading === fiche.id}
                    className="p-2 hover:bg-white/10 rounded-lg text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                    title="Télécharger"
                  >
                    {downloading === fiche.id ? (
                      <div className="w-5 h-5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                    ) : (
                      <Download size={20} />
                    )}
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(fiche.id)}
                      className="p-2 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewerFiche && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex flex-col"
          onClick={closeViewer}
        >
          <div
            className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold text-lg">
              Fiche de paie - {formatMois(viewerFiche.mois, viewerFiche.annee)}
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownload(viewerFiche)}
                disabled={downloading === viewerFiche.id}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {downloading === viewerFiche.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                Télécharger
              </button>
              <button
                onClick={closeViewer}
                className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4" onClick={(e) => e.stopPropagation()}>
            {viewerLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : viewerUrl ? (
              <iframe
                src={viewerUrl}
                className="w-full h-full rounded-lg border border-white/20"
                title={`Fiche de paie ${formatMois(viewerFiche.mois, viewerFiche.annee)}`}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white/50">
                Erreur lors du chargement du PDF
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Salaires;
