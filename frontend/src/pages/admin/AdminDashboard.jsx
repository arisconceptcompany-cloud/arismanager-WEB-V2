import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, FileText, DollarSign, AlertCircle, FolderKanban } from 'lucide-react';
import { pointageAPI, congeAPI, projetAPI, salaireAPI, rapportAPI } from '../../services/api';
import api from '../../services/api';
import { useUser } from '../../context/UserContext';

function AdminDashboard() {
  const { user } = useUser();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pointages, setPointages] = useState([]);
  const [stats, setStats] = useState({
    totalEmployes: 0,
    pendingConges: 0,
    enCoursProjects: 0,
    totalProjects: 0,
    enAttenteProjects: 0,
    pendingRapports: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const year = currentMonth.getFullYear();
      const [employeRes, pointageRes, congeRes, projetRes, rapportRes] = await Promise.all([
        api.get('/admin/employes'),
        pointageAPI.getPointages({ year }),
        congeAPI.getConges(),
        projetAPI.getAdminProjets(),
        rapportAPI.getRapports()
      ]);
      
      setPointages(pointageRes.data || []);
      
      setStats({
        totalEmployes: (employeRes.data || []).length,
        pendingConges: (congeRes.data || []).filter(c => c.statut === 'en_attente').length,
        totalProjects: (projetRes.data || []).length,
        enCoursProjects: (projetRes.data || []).filter(p => p.statut === 'en_cours').length,
        enAttenteProjects: (projetRes.data || []).reduce((sum, p) => sum + (parseInt(p.nb_en_attente) || 0), 0),
        pendingRapports: (rapportRes.data || []).filter(r => r.statut === 'soumis').length
      });
    } catch (error) {
      console.error('Erreur chargement donnees:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getLocalDateString = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getPointageForDate = (date) => {
    if (!date) return null;
    const dateStr = getLocalDateString(date);
    return pointages.find(p => p.date === dateStr);
  };

  const getStatusColor = (pointage) => {
    if (!pointage) return 'bg-gray-600';
    switch (pointage.statut) {
      case 'present': return 'bg-green-500';
      case 'retard': return 'bg-yellow-500';
      case 'absent': return 'bg-red-500';
      case 'conge': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (pointage) => {
    if (!pointage) return 'Aucun';
    switch (pointage.statut) {
      case 'present': return 'Présent';
      case 'retard': return 'Retard';
      case 'absent': return 'Absent';
      case 'conge': return 'Congé';
      default: return pointage.statut;
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Tableau de bord Admin</h1>
      <p className="text-white/70 mb-4 md:mb-6">Bienvenue, {user?.prenom} {user?.nom}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs md:text-sm">Total Employés</p>
              <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalEmployes}</p>
            </div>
            <Users size={24} md:size={40} className="text-blue-400 opacity-50" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs md:text-sm">Demandes Congé</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-400">{stats.pendingConges}</p>
            </div>
            <Clock size={24} md:size={40} className="text-yellow-400 opacity-50" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs md:text-sm">Total Projets</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-400">{stats.totalProjects}</p>
            </div>
            <FolderKanban size={24} md:size={40} className="text-blue-400 opacity-50" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs md:text-sm">En attente réponse</p>
              <p className="text-2xl md:text-3xl font-bold text-amber-400">{stats.enAttenteProjects}</p>
            </div>
            <Clock size={24} md:size={40} className="text-amber-400 opacity-50" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs md:text-sm">Rapports en attente</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-400">{stats.pendingRapports}</p>
            </div>
            <FileText size={24} md:size={40} className="text-purple-400 opacity-50" />
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4 mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <Calendar size={24} />
            Mon Calendrier de Présence
          </h2>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={prevMonth}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              ←
            </button>
            <span className="text-white font-medium min-w-[120px] sm:min-w-[150px] text-center capitalize text-sm sm:text-base">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-white/50 text-sm font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth(currentMonth).map((date, idx) => {
            const pointage = getPointageForDate(date);
            return (
              <div
                key={idx}
                className={`aspect-square p-2 rounded-lg ${
                  date ? 'bg-white/5 hover:bg-white/10' : ''
                } ${isToday(date) ? 'ring-2 ring-red-500' : ''}`}
              >
                {date && (
                  <div className="h-full flex flex-col">
                    <span className={`text-sm ${isToday(date) ? 'text-red-400 font-bold' : 'text-white/70'}`}>
                      {date.getDate()}
                    </span>
                    <div className="flex-1 mt-1">
                      <div className={`w-full h-1 rounded-full ${getStatusColor(pointage)}`} />
                      <p className="text-[10px] text-white/50 mt-1 truncate">
                        {getStatusLabel(pointage)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-white/70 text-sm">Présent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-white/70 text-sm">Retard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-white/70 text-sm">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-white/70 text-sm">Congé</span>
          </div>
        </div>
      </div>

      {stats.pendingConges > 0 && (
        <div className="mt-6 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 flex items-center gap-4">
          <AlertCircle size={24} className="text-yellow-400" />
          <p className="text-white">
            Vous avez <span className="font-bold">{stats.pendingConges}</span> demande(s) de congé en attente de validation.
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
