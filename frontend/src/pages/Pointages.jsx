import { useState, useEffect } from 'react';
import { Clock, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import api, { pointageAPI } from '../services/api';

function Pointages() {
  const [pointages, setPointages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pointagesRes, statsRes] = await Promise.all([
        pointageAPI.getPointages(),
        pointageAPI.getStats(new Date().getFullYear())
      ]);
      setPointages(pointagesRes.data || []);
      setStats(statsRes.data || []);
    } catch (error) {
      console.error('Erreur chargement pointages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.get('/sync');
      await fetchData();
    } catch (error) {
      console.error('Erreur sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce pointage ?')) return;
    try {
      await pointageAPI.deletePointage(id);
      setPointages(pointages.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const formatTime = (time) => time ? time.substring(0, 5) : '-';

  const calculerHeuresTravail = (heureArrivee, heureDepart) => {
    if (!heureArrivee || !heureDepart) return '-';
    const [h1, m1] = heureArrivee.split(':').map(Number);
    const [h2, m2] = heureDepart.split(':').map(Number);
    const totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${heures}h ${minutes}m`;
  };

  const calculerRetard = (heureArrivee) => {
    if (!heureArrivee) return { estRetard: false, retard: '-' };
    const [h, m] = heureArrivee.split(':').map(Number);
    const heureArriveeMinutes = h * 60 + m;
    const heureLimite = 8 * 60;
    const retardMinutes = heureArriveeMinutes - heureLimite;
    if (retardMinutes > 0) {
      const heures = Math.floor(retardMinutes / 60);
      const minutes = retardMinutes % 60;
      return {
        estRetard: true,
        retard: heures > 0 ? `${heures}h ${minutes}m` : `${minutes}m`
      };
    }
    return { estRetard: false, retard: '-' };
  };

  // FIX: Number() pour forcer la conversion en nombre et éviter la concaténation de strings
  const totalJours    = stats?.reduce((acc, s) => acc + Number(s.total_jours),   0) || 0;
  const totalPresents = stats?.reduce((acc, s) => acc + Number(s.jours_present), 0) || 0;
  const totalRetards  = stats?.reduce((acc, s) => acc + Number(s.jours_retard),  0) || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-white bg-black/50 px-4 py-2 rounded-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Mes Pointages</h1>
          <p className="text-white/70 text-sm">Historique de vos heures de travail (Horaire: 8h00 - 17h00)</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Sync...' : 'Sync'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-green-400" size={20} />
            </div>
            <div>
              <h3 className="text-xs md:text-sm text-white/70">Jours présents</h3>
              <div className="text-2xl md:text-3xl font-bold text-white">{totalPresents}</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Clock className="text-red-400" size={20} />
            </div>
            <div>
              <h3 className="text-xs md:text-sm text-white/70">Jours de retard</h3>
              <div className="text-2xl md:text-3xl font-bold text-white">{totalRetards}</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Clock className="text-purple-400" size={20} />
            </div>
            <div>
              <h3 className="text-xs md:text-sm text-white/70">Total pointages</h3>
              <div className="text-2xl md:text-3xl font-bold text-white">{pointages.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/20">
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <Clock size={24} />
            Historique des pointages
          </h2>
        </div>

        {pointages.length === 0 ? (
          <div className="p-12 text-center">
            <Clock size={64} className="mx-auto text-white/30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucun pointage</h3>
            <p className="text-white/60">Vos pointages apparaîtront ici automatiquement</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3 p-4">
              {pointages.map((pointage) => {
                const { estRetard, retard } = calculerRetard(pointage.heure_arrivee);
                const totalTravail = calculerHeuresTravail(pointage.heure_arrivee, pointage.heure_depart);
                return (
                  <div key={pointage.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-white font-medium">
                        {(() => {
                          const [y, m, d] = pointage.date.split('-');
                          const date = new Date(y, m - 1, d);
                          return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                        })()}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        pointage.statut === 'present' ? 'bg-green-500/20 text-green-400' :
                        pointage.statut === 'retard' ? 'bg-amber-500/20 text-amber-400' :
                        pointage.statut === 'absent' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {pointage.statut}
                      </span>
                      <button
                        onClick={() => handleDelete(pointage.id)}
                        className="ml-2 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-white/50 text-xs">Entrée</p>
                        <p className={estRetard ? "text-amber-400" : "text-green-400"}>
                          {formatTime(pointage.heure_arrivee) || '-'}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-white/50 text-xs">Sortie</p>
                        <p className="text-white">{formatTime(pointage.heure_depart) || '-'}</p>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-white/50 text-xs">Retard</p>
                        {estRetard ? (
                          <p className="text-red-400">+{retard}</p>
                        ) : (
                          <p className="text-green-400">-</p>
                        )}
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-white/50 text-xs">Total</p>
                        <p className="text-purple-400">{totalTravail || '-'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FIX: "hidden md:block" au lieu de "hidden md:overflow-x-auto" — la table s'affiche maintenant sur desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">Entrée</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">Sortie</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">Retard</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">Total Travail</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {pointages.map((pointage) => {
                    const { estRetard, retard } = calculerRetard(pointage.heure_arrivee);
                    const totalTravail = calculerHeuresTravail(pointage.heure_arrivee, pointage.heure_depart);

                    return (
                      // FIX: </tr> était en dehors du return, il est maintenant correctement à l'intérieur
                      <tr key={pointage.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm text-white font-medium">
                            {(() => {
                              const [y, m, d] = pointage.date.split('-');
                              const date = new Date(y, m - 1, d);
                              return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
                            })()}
                          </div>
                          <div className="text-xs text-white/50 capitalize">
                            {(() => {
                              const [y, m, d] = pointage.date.split('-');
                              const date = new Date(y, m - 1, d);
                              return date.toLocaleDateString('fr-FR', { weekday: 'long' });
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                            estRetard
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {pointage.heure_arrivee ? (
                              <>
                                <Clock size={16} />
                                {formatTime(pointage.heure_arrivee)}
                              </>
                            ) : (
                              <span className="text-white/50">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 text-white">
                            {pointage.heure_depart ? (
                              <>
                                <Clock size={16} />
                                {formatTime(pointage.heure_depart)}
                              </>
                            ) : (
                              <span className="text-white/50">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {estRetard ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
                              +{retard}
                            </span>
                          ) : (
                            <span className="text-green-400 text-sm font-medium">À l'heure</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-semibold">
                            {totalTravail !== '-' && <Clock size={16} />}
                            {totalTravail}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${
                            pointage.statut === 'present' ? 'bg-green-500/20 text-green-400' :
                            pointage.statut === 'retard' ? 'bg-amber-500/20 text-amber-400' :
                            pointage.statut === 'absent' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {pointage.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDelete(pointage.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Pointages;