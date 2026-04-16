import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, FolderKanban, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { pointageAPI, congeAPI, projetAPI } from '../services/api';
import { useUser } from '../context/UserContext';

function Dashboard() {
  const { user, profilePhoto } = useUser();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [stats, setStats] = useState({
    pointages: { presents: 0, retards: 0, absents: 0 },
    conges: { approuves: 0, enAttente: 0 },
    projets: 0,
    dernierPointage: null,
    congesList: [],
    pointagesMois: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const [pointages, pointagesStats, statsConge, projets, congesList] = await Promise.all([
        pointageAPI.getPointages(),
        pointageAPI.getStats(year),
        congeAPI.getStats(),
        projetAPI.getProjets(),
        congeAPI.getConges()
      ]);

      const pointagesMois = pointages.data.filter(p => {
        const date = new Date(p.date);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });

      const pointageStats = pointagesStats.data.reduce((acc, curr) => ({
        presents: acc.presents + (curr.jours_present || 0),
        retards: acc.retards + (curr.jours_retard || 0),
        absents: acc.absents + (curr.jours_absent || 0)
      }), { presents: 0, retards: 0, absents: 0 });

      const congeStats = statsConge.data.reduce((acc, curr) => ({
        approuves: acc.approuves + (curr.jours_approuves || 0),
        enAttente: acc.enAttente + (curr.jours_en_attente || 0)
      }), { approuves: 0, enAttente: 0 });

      setStats({
        pointages: pointageStats,
        conges: congeStats,
        projets: projets.data.length,
        dernierPointage: pointages.data[0] || null,
        congesList: congesList.data.slice(0, 5),
        pointagesMois
      });
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-white bg-black/50 px-4 py-2 rounded-lg">Chargement...</p>
      </div>
    );
  }

  const totalJoursMois = stats.pointagesMois.length;
  const joursPresents = stats.pointagesMois.filter(p => p.statut === 'present' || p.statut === 'retard').length;
  const tauxPresence = totalJoursMois > 0 ? ((joursPresents / totalJoursMois) * 100).toFixed(0) : 0;

  const getJoursCalendrier = () => {
    const moisCal = currentMonth.getMonth();
    const anneeCal = currentMonth.getFullYear();
    const premierJour = new Date(anneeCal, moisCal, 1);
    const joursDansMois = new Date(anneeCal, moisCal + 1, 0).getDate();
    const jourDebutSemaine = premierJour.getDay();
    const maintenant = new Date();
    const jourActuel = maintenant.getDate();
    const moisActuelReel = maintenant.getMonth();
    const anneeActuelleReel = maintenant.getFullYear();
    
    const jours = [];
    
    for (let i = 0; i < jourDebutSemaine; i++) {
      jours.push({ empty: true, key: `empty-${i}` });
    }
    
    for (let i = 1; i <= joursDansMois; i++) {
      const date = new Date(anneeCal, moisCal, i);
      const jourSemaine = date.getDay();
      const estWeekend = jourSemaine === 0 || jourSemaine === 6;
      const estAujourdHui = i === jourActuel && moisCal === moisActuelReel && anneeCal === anneeActuelleReel;
      
      const pointage = stats.pointagesMois.find(p => {
        const pDate = new Date(p.date);
        return pDate.getDate() === i && pDate.getMonth() === moisCal;
      });

      let statut = null;
      if (pointage) {
        statut = pointage.statut;
      } else if (estWeekend) {
        statut = 'weekend';
      } else if (i <= jourActuel && moisCal === moisActuelReel && anneeCal === anneeActuelleReel) {
        statut = 'absent';
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      jours.push({
        jour: i,
        estWeekend,
        statut,
        date: `${year}-${month}-${day}`,
        estAujourdHui,
        key: i
      });
    }
    
    return jours;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const joursCalendrier = getJoursCalendrier();
  const moisLabel = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="mb-6 md:mb-6 flex items-center gap-3 md:gap-4">
        {profilePhoto ? (
          <img 
            src={profilePhoto} 
            alt="Profil" 
            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"
          />
        ) : (
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-lg md:text-xl font-bold text-white border-2 border-blue-500/50 shadow-lg shadow-blue-500/20">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Bienvenue, {user?.prenom} {user?.nom}</h1>
          <p className="text-blue-400 font-medium text-sm">{user?.matricule}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 md:p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Calendar size={16} className="text-blue-400" />
              </div>
              <span className="capitalize">{moisLabel}</span>
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['D', 'L', 'M', 'Ma', 'J', 'V', 'S'].map((jour, i) => (
              <div key={i} className="text-center text-[10px] font-semibold text-white/50 py-1.5 bg-white/5 rounded">{jour}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {joursCalendrier.map((item) => (
              <div
                key={item.key}
                className={`
                  aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all cursor-pointer
                  ${item.empty ? '' : 'hover:scale-105'}
                  ${item.estWeekend && !item.statut ? 'bg-slate-700/60 text-slate-400' : ''}
                  ${item.statut === 'present' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' : ''}
                  ${item.statut === 'retard' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30' : ''}
                  ${item.statut === 'absent' ? 'bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg shadow-rose-500/30' : ''}
                  ${item.statut === 'conge' ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30' : ''}
                  ${item.estAujourdHui && !item.statut ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-800 bg-blue-100 text-blue-700 font-bold' : ''}
                  ${!item.statut && !item.estWeekend && !item.estAujourdHui ? 'bg-white/10 text-slate-200 hover:bg-white/20' : ''}
                  ${item.estAujourdHui && item.statut ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                `}
              >
                {item.jour}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-5 mt-4 pt-3 border-t border-white/10 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-400 to-emerald-600"></div>
              <span>Présent</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-400 to-amber-600"></div>
              <span>Retard</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-rose-400 to-rose-600"></div>
              <span>Absent</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 md:p-5 shadow-xl">
          <h2 className="text-base md:text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Clock size={16} className="text-green-400" />
            </div>
            Dernier pointage
          </h2>
          {stats.dernierPointage ? (
            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-[11px] text-slate-400 mb-1">Date</div>
                <div className="text-sm text-white font-medium">
                  {new Date(stats.dernierPointage.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-3 border border-green-500/30">
                  <div className="text-[10px] text-green-400/80 mb-1">Entrée</div>
                  <div className="text-xl font-bold text-green-400">{stats.dernierPointage.heure_arrivee?.substring(0, 5) || '-'}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <div className="text-[10px] text-slate-400 mb-1">Sortie</div>
                  <div className="text-xl font-bold text-white">{stats.dernierPointage.heure_depart?.substring(0, 5) || '-'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">
              <Clock size={28} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">Aucun pointage</p>
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 md:p-5 shadow-xl">
          <h2 className="text-base md:text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-purple-400" />
            </div>
            Aujourd'hui
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-green-500/20 rounded-xl px-3 py-2.5 border border-green-500/30">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm text-white">Présence</span>
              </div>
              <span className="text-lg font-bold text-green-400">{tauxPresence}%</span>
            </div>
            <div className="flex items-center justify-between bg-blue-500/20 rounded-xl px-3 py-2.5 border border-blue-500/30">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" />
                <span className="text-sm text-white">Ce mois</span>
              </div>
              <span className="text-lg font-bold text-blue-400">{joursPresents}/{totalJoursMois}</span>
            </div>
            <div className="flex items-center justify-between bg-purple-500/20 rounded-xl px-3 py-2.5 border border-purple-500/30">
              <div className="flex items-center gap-2">
                <FolderKanban size={16} className="text-purple-400" />
                <span className="text-sm text-white">Projets</span>
              </div>
              <span className="text-lg font-bold text-purple-400">{stats.projets}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 md:p-5 shadow-xl">
          <h2 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Calendar size={16} className="text-blue-400" />
            </div>
            Mes congés récents
          </h2>
          {stats.congesList.length > 0 ? (
            <div className="space-y-2">
              {stats.congesList.map(conge => (
                <div key={conge.id} className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3 transition-all border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      conge.statut === 'approuve' ? 'bg-green-500/20' :
                      conge.statut === 'en_attente' ? 'bg-amber-500/20' : 'bg-red-500/20'
                    }`}>
                      <Calendar size={18} className={
                        conge.statut === 'approuve' ? 'text-green-400' :
                        conge.statut === 'en_attente' ? 'text-amber-400' : 'text-red-400'
                      } />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{conge.type_conge.replace('_', ' ')}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(conge.date_debut).toLocaleDateString('fr-FR')} - {new Date(conge.date_fin).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    conge.statut === 'approuve' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    conge.statut === 'en_attente' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {conge.statut === 'approuve' ? 'Approuvé' : conge.statut === 'en_attente' ? 'En attente' : 'Refusé'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune demande de congé</p>
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 md:p-5 shadow-xl">
          <h2 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertCircle size={16} className="text-red-400" />
            </div>
            Statistiques annuelles
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gradient-to-r from-green-500/20 to-transparent rounded-xl px-4 py-3 border border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle size={18} className="text-green-400" />
                </div>
                <span className="text-white font-medium">Jours présents</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">{stats.pointages.presents}</div>
                <div className="text-[10px] text-green-400/60">cette année</div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/20 to-transparent rounded-xl px-4 py-3 border border-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <AlertCircle size={18} className="text-amber-400" />
                </div>
                <span className="text-white font-medium">Jours de retard</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-400">{stats.pointages.retards}</div>
                <div className="text-[10px] text-amber-400/60">cette année</div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-gradient-to-r from-red-500/20 to-transparent rounded-xl px-4 py-3 border border-red-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <XCircle size={18} className="text-red-400" />
                </div>
                <span className="text-white font-medium">Jours absents</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-400">{stats.pointages.absents}</div>
                <div className="text-[10px] text-red-400/60">cette année</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
