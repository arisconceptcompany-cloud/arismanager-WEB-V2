import { useState, useEffect } from 'react';
import { QrCode, Download, Eye, User, Users } from 'lucide-react';
import api, { badgeAPI, photoAPI, DEFAULT_AVATAR } from '../../services/api';

function AdminBadges() {
  const [employes, setEmployes] = useState([]);
  const [badges, setBadges] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployes();
  }, []);

  const fetchEmployes = async () => {
    try {
      const res = await badgeAPI.getEmployes();
      setEmployes(res.data || []);
      fetchBadges(res.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async (employesList) => {
    const badgesData = {};
    for (const emp of employesList) {
      try {
        const res = await badgeAPI.getBadgeQR(emp.matricule);
        badgesData[emp.matricule] = res.data;
      } catch (error) {
        console.error('Erreur badge:', emp.matricule);
      }
    }
    setBadges(badgesData);
  };

  const getInitials = (nom, prenom) => {
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  };

  const getDefaultAvatar = (employe) => `${DEFAULT_AVATAR}&name=${employe.prenom || ''}+${employe.nom || ''}`;

  const getPhotoUrl = (employe) => {
    const storedPhoto = localStorage.getItem(`profilePhoto_${employe.id}`);
    if (storedPhoto && (storedPhoto.startsWith('data:') || storedPhoto.startsWith('http'))) {
      return storedPhoto;
    }
    if (employe.photo) {
      if (employe.photo.startsWith('data:') || employe.photo.startsWith('/')) {
        return employe.photo.startsWith('/') 
          ? `http://167.86.118.96:3002${employe.photo}` 
          : employe.photo;
      }
      return `http://167.86.118.96:3002/api/photos/employe/${employe.id}`;
    }
    return getDefaultAvatar(employe);
  };

  const handlePhotoError = (e) => {
    const emp = { prenom: e.target.dataset.prenom, nom: e.target.dataset.nom };
    e.target.src = getDefaultAvatar(emp);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Badges & QR Codes</h1>
        <p className="text-white/70">
          Chaque employé possède un badge ID unique. Scannez le QR code pour enregistrer une entrée ou sortie.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-6">
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={(e) => {
              e.preventDefault();
              const exampleBadge = document.querySelector('.badge-grid .badge-card');
              if (exampleBadge) exampleBadge.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Eye size={18} />
            Voir un exemple
          </a>
        </div>
      </div>

      <div className="badge-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employes.map((emp) => {
          const badgeData = badges[emp.matricule];
          const photoUrl = getPhotoUrl(emp);
          
          return (
            <div key={emp.id} className="badge-card bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
              <div className="p-6">
                <div className="bg-white rounded-xl p-4 mb-4 flex items-center justify-center">
                  {badgeData?.qr ? (
                    <img 
                      src={badgeData.qr} 
                      alt={`QR ${emp.matricule}`} 
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center">
                      <QrCode size={64} className="text-gray-400 animate-pulse" />
                    </div>
                  )}
                </div>
                
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt={emp.prenom}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                        data-prenom={emp.prenom}
                        data-nom={emp.nom}
                        onError={handlePhotoError}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {getInitials(emp.nom, emp.prenom)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-lg">
                    {emp.prenom} {emp.nom}
                  </h3>
                  <code className="inline-block mt-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg font-mono text-sm">
                    {emp.matricule}
                  </code>
                  <p className="text-white/60 text-sm mt-1">{emp.poste}</p>
                </div>
              </div>
              
              <div className="bg-white/5 px-6 py-4 flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                  onClick={() => {
                    if (badgeData?.qr) {
                      window.open(badgeData.qr, '_blank');
                    }
                  }}
                >
                  <Eye size={16} />
                  Fiche
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  onClick={() => {
                    if (badgeData?.qr) {
                      const link = document.createElement('a');
                      link.href = badgeData.qr;
                      link.download = `badge-${emp.matricule}.png`;
                      link.click();
                    }
                  }}
                >
                  <Download size={16} />
                  PNG
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {employes.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
          <QrCode size={64} className="mx-auto text-white/30 mb-4" />
          <h3 className="text-white text-xl font-medium mb-2">Aucun employé</h3>
          <p className="text-white/50">Aucun badge à afficher</p>
        </div>
      )}
    </div>
  );
}

export default AdminBadges;
