import { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Building2, Calendar, Camera, Upload, Check, X } from 'lucide-react';
import { employeAPI } from '../services/api';
import { useUser } from '../context/UserContext';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);
  const { updateProfilePhoto, profilePhoto, user: initialUser } = useUser();

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await employeAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'La photo ne doit pas dépasser 5MB');
        return;
      }
      
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        
        updateProfilePhoto(base64);
        
        try {
          const response = await employeAPI.uploadPhoto(base64);
          const photoUrl = response.data?.photo_url || base64;
          
          const userId = initialUser?.id || profile?.id || response.data?.employe?.id;
          console.log('Saving with userId:', userId);
          
          // Always save to localStorage for small photos, regardless of API response
          if (userId && photoUrl) {
            try {
              const allKeys = Object.keys(localStorage);
              allKeys.forEach(k => {
                if (k.startsWith('profilePhoto_')) localStorage.removeItem(k);
              });
              // Only save if small enough
              if (photoUrl.length < 1000000) {
                localStorage.setItem(`profilePhoto_${userId}`, photoUrl);
                console.log('Saved to localStorage');
              }
            } catch (e) {
              console.warn('localStorage error:', e);
            }
          }
          
          updateProfilePhoto(photoUrl);
          showNotification('success', 'Photo mise à jour avec succès');
        } catch (error) {
          console.error('Erreur upload photo:', error);
          // Try to save locally even if API fails
          const userId = initialUser?.id || profile?.id;
          if (userId && base64.length < 1000000) {
            try {
              localStorage.setItem(`profilePhoto_${userId}`, base64);
              updateProfilePhoto(base64);
            } catch (e) {
              updateProfilePhoto(base64);
            }
          } else {
            updateProfilePhoto(base64);
          }
          showNotification('success', 'Photo affichée');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (nom, prenom) => {
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-white bg-black/50 px-4 py-2 rounded-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {notification && (
        <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl bg-green-600 text-white animate-slide-in min-w-[280px]">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Check size={20} />
          </div>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mon Profil</h1>
        <p className="text-white/70">Vos informations personnelles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8 text-center">
          <div className="relative inline-block">
            {uploading ? (
              <div className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-white/20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : profilePhoto ? (
              <img 
                src={profilePhoto} 
                alt="Profil" 
                className="w-32 h-32 rounded-full mx-auto mb-5 object-cover border-4 border-white/20"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl font-bold text-white border-4 border-white/20">
                {getInitials(profile?.nom, profile?.prenom)}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 ${uploading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Camera size={18} />
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          
          <h3 className="text-xl font-semibold text-white mb-1">{profile?.prenom} {profile?.nom}</h3>
          <p className="text-white/70 mb-5">{profile?.poste}</p>
          
          <div className="flex justify-center gap-2 mb-5">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${profile?.statut === 'actif' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {profile?.statut}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
              {profile?.role}
            </span>
          </div>

          <div className="bg-white/10 rounded-lg p-4 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-white/50" />
              <span className="text-white/80">{profile?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="text-white/50" />
              <span className="text-white/80">{profile?.telephone || 'Non renseigné'}</span>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20"
          >
            <Upload size={18} />
            Changer la photo
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <User size={24} />
            Informations professionnelles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <label className="flex items-center gap-2 text-xs text-white/50 mb-2">
                <User size={14} /> Matricule
              </label>
              <span className="text-white font-semibold text-lg">{profile?.matricule}</span>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <label className="flex items-center gap-2 text-xs text-white/50 mb-2">
                <Briefcase size={14} /> Poste
              </label>
              <span className="text-white font-semibold text-lg">{profile?.poste}</span>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <label className="flex items-center gap-2 text-xs text-white/50 mb-2">
                <Building2 size={14} /> Département
              </label>
              <span className="text-white font-semibold text-lg">{profile?.departement}</span>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <label className="flex items-center gap-2 text-xs text-white/50 mb-2">
                <Calendar size={14} /> Date d'embauche
              </label>
              <span className="text-white font-semibold text-lg">
                {profile?.date_embauche ? new Date(profile.date_embauche).toLocaleDateString('fr-FR') : '-'}
              </span>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg md:col-span-2">
              <label className="flex items-center gap-2 text-xs text-white/50 mb-2">
                <MapPin size={14} /> Adresse
              </label>
              <span className="text-white font-medium">{profile?.adresse || 'Non renseignée'}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-blue-400" />
              </div>
              <div>
                <h4 className="text-blue-400 font-medium text-sm mb-1">Profil géré par l'administrateur</h4>
                <p className="text-white/60 text-xs">
                  Vos informations professionnelles sont gérées par le service des ressources humaines. 
                  Pour toute modification, contactez votre administrateur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
