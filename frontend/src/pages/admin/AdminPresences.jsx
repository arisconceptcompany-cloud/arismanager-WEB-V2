import { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, RefreshCw, Monitor } from 'lucide-react';
import api, { DEFAULT_AVATAR } from '../../services/api';

function AdminPresences() {
  const [presences, setPresences] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [pcStatus, setPcStatus] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [photoCache, setPhotoCache] = useState({});

  const preloadPhotos = (employeeList) => {
    const newCache = {};
    employeeList.forEach(emp => {
      const storedPhoto = localStorage.getItem(`profilePhoto_${emp.id}`);
      if (storedPhoto && (storedPhoto.startsWith('data:') || storedPhoto.startsWith('http'))) {
        newCache[emp.id] = storedPhoto;
      } else if (emp.photo && emp.photo.startsWith('data:') && emp.photo.length < 80000) {
        newCache[emp.id] = emp.photo;
        localStorage.setItem(`profilePhoto_${emp.id}`, emp.photo);
      } else {
        newCache[emp.id] = null;
      }
    });
    setPhotoCache(newCache);
    
    const toFetch = employeeList.filter(emp => !newCache[emp.id] && !emp.photo?.startsWith('data:'));
    toFetch.forEach(emp => {
      api.get(`/photos/employe/${emp.id}`, { responseType: 'blob' })
        .then(response => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result;
            if (base64.length < 80000) {
              localStorage.setItem(`profilePhoto_${emp.id}`, base64);
            }
            setPhotoCache(prev => ({ ...prev, [emp.id]: base64 }));
          };
          reader.readAsDataURL(response.data);
        })
        .catch(() => {
          setPhotoCache(prev => ({ ...prev, [emp.id]: 'default' }));
        });
    });
  };

  const getPhotoUrl = (employe) => {
    const cached = photoCache[employe.id];
    if (cached === 'default') {
      return `${DEFAULT_AVATAR}&name=${employe.prenom || ''}+${employe.nom || ''}`;
    }
    if (cached) {
      return cached;
    }
    const storedPhoto = localStorage.getItem(`profilePhoto_${employe.id}`);
    if (storedPhoto && (storedPhoto.startsWith('data:') || storedPhoto.startsWith('http'))) {
      return storedPhoto;
    }
    if (employe.photo && employe.photo.startsWith('data:')) {
      return employe.photo;
    }
    return null;
  };

  const handlePhotoError = (e, employe) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const [presenceRes, empRes, pcStatusRes] = await Promise.all([
        api.get('/admin/presences', { params: { date: dateStr } }),
        api.get('/admin/employes'),
        api.get('/admin/pc-status')
      ]);
      setPresences(presenceRes.data || []);
      setEmployes(empRes.data || []);
      preloadPhotos(empRes.data || []);
      
      const statusMap = {};
      (pcStatusRes.data || []).forEach(s => {
        statusMap[s.id] = s;
      });
      setPcStatus(statusMap);
    } catch (error) {
      console.error('Erreur chargement:', error);
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

  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPresenceForEmploye = (employeId) => {
    const dateStr = getLocalDateString(currentDate);
    return presences.find(p => p.employe_id === employeId && p.date === dateStr);
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  const calculateRetard = (heure_arrivee) => {
    if (!heure_arrivee) return '-';
    const [h, m] = heure_arrivee.split(':').map(Number);
    const totalMinutes = h * 60 + m;
    const debutMinutes = 8 * 60;
    const retardMinutes = totalMinutes - debutMinutes;
    if (retardMinutes <= 0) return '-';
    const hours = Math.floor(retardMinutes / 60);
    const mins = retardMinutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}min`;
  };

  const calculateWorkHours = (arrivee, depart) => {
    if (!arrivee || !depart) return '-';
    const [h1, m1] = arrivee.split(':').map(Number);
    const [h2, m2] = depart.split(':').map(Number);
    const minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (minutes < 0) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const prevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const dateStr = currentDate.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

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
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Présences</h1>
          <p className="text-white/70">Tableau de présence journalier</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sync...' : 'Sync PresenceAris'}
          </button>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
            <button
              onClick={prevDay}
              className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center px-4">
              <span className="text-white font-medium capitalize">
                {dateStr}
              </span>
            </div>
            <button
              onClick={nextDay}
              className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Aujourd'hui
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <Monitor className="text-green-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-white/70">PC en ligne</p>
              <p className="text-2xl font-bold text-green-400">
                {Object.values(pcStatus).filter(s => s.is_online).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-500/20 rounded-full flex items-center justify-center">
              <Monitor className="text-gray-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-white/70">PC hors ligne</p>
              <p className="text-2xl font-bold text-gray-400">
                {Object.values(pcStatus).filter(s => !s.is_online).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Monitor className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-white/70">Total PCs</p>
              <p className="text-2xl font-bold text-blue-400">
                {Object.keys(pcStatus).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/20">
                <th className="px-6 py-4 text-left text-white font-semibold">Matricule</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Nom Complet</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Heure Arrivee</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Heure Sortie</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Retard</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Total Heures</th>
                <th className="px-6 py-4 text-center text-white font-semibold">PC Status</th>
              </tr>
            </thead>
            <tbody>
              {employes.map((employe, index) => {
                const presence = getPresenceForEmploye(employe.id);
                const hasRetard = calculateRetard(presence?.heure_arrivee) !== '-';
                
                return (
                  <tr 
                    key={employe.id} 
                    className={`border-b border-white/10 hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-white/5' : ''}`}
                  >
                    <td className="px-6 py-4 text-white font-mono">
                      {employe.matricule || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const photoUrl = getPhotoUrl(employe);
                          return (
                            <>
                              {photoUrl ? (
                                <img 
                                  src={photoUrl} 
                                  alt="" 
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => handlePhotoError(e, employe)}
                                />
                              ) : null}
                              <div 
                                className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm ${photoUrl ? 'hidden' : ''}`}
                              >
                                {employe.prenom?.[0]}{employe.nom?.[0]}
                              </div>
                            </>
                          );
                        })()}
                        <div>
                          <p className="text-white font-medium">{employe.prenom} {employe.nom}</p>
                          <p className="text-white/50 text-sm">{employe.poste || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Clock size={16} className="text-green-400" />
                        <span className="text-white font-mono">
                          {formatTime(presence?.heure_arrivee)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-white font-mono">
                        {formatTime(presence?.heure_depart)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {hasRetard ? (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                          {calculateRetard(presence?.heure_arrivee)}
                        </span>
                      ) : (
                        <span className="text-green-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-white font-mono">
                        {calculateWorkHours(presence?.heure_arrivee, presence?.heure_depart)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {pcStatus[employe.id] ? (
                        <div className="flex flex-col items-center gap-1">
                          {pcStatus[employe.id].is_online ? (
                            <>
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                                <Monitor size={14} className="text-green-400" />
                                <span className="text-green-400 text-xs font-medium">En ligne</span>
                              </div>
                              <span className="text-white/40 text-xs">{pcStatus[employe.id].last_seen_text}</span>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 rounded-full">
                                <Monitor size={14} className="text-gray-400" />
                                <span className="text-gray-400 text-xs font-medium">Hors ligne</span>
                              </div>
                              <span className="text-white/40 text-xs">{pcStatus[employe.id].last_seen_text}</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-white/40 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {employes.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-white/50">
                    Aucun employe trouve
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-white/50">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500/20 rounded-full"></span>
          <span>Retard</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-400 rounded-full"></span>
          <span>A l'heure</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500/20 rounded-full"></span>
          <span>PC en ligne</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-500/20 rounded-full"></span>
          <span>PC hors ligne</span>
        </div>
      </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-400 rounded-full"></span>
          <span>À l'heure</span>
        </div>
      </div>
    </div>
  );
}

export default AdminPresences;
