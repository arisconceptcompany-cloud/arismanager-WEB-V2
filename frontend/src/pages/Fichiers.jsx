import { useState, useEffect } from 'react';
import { FolderArchive, Upload, Download, File, X, Trash2 } from 'lucide-react';
import api from '../services/api';

function Fichiers() {
  const [fichiers, setFichiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchFichiers();
  }, []);

  const fetchFichiers = async () => {
    try {
      const response = await api.get('/fichiers');
      setFichiers(response.data || []);
    } catch (error) {
      console.error('Erreur chargement fichiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('fichier', selectedFile);
    
    try {
      await api.post('/fichiers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedFile(null);
      document.getElementById('fileInput').value = '';
      fetchFichiers();
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fichier) => {
    try {
      const response = await api.get(`/fichiers/${fichier.id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fichier.nom);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur download:', error);
    }
  };

  const handleDelete = async (fichierId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce fichier ?')) return;
    
    try {
      await api.delete(`/fichiers/${fichierId}`);
      fetchFichiers();
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><p className="text-white bg-black/50 px-4 py-2 rounded-lg">Chargement...</p></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Fichiers</h1>
          <p className="text-white/70">Gérer vos fichiers et documents</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Upload size={24} /> Uploader un fichier
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              id="fileInput"
              type="file"
              onChange={handleFileSelect}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedFile && !uploading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
          >
            {uploading ? 'Upload en cours...' : 'Uploader'}
          </button>
        </div>

        {selectedFile && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File size={24} className="text-blue-400" />
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-white/50 text-sm">{formatSize(selectedFile.size)}</p>
              </div>
            </div>
            <button onClick={() => { setSelectedFile(null); document.getElementById('fileInput').value = ''; }} className="text-white/50 hover:text-white">
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <FolderArchive size={24} /> Mes fichiers
        </h2>

        {fichiers.length === 0 ? (
          <div className="text-center py-12">
            <FolderArchive size={64} className="mx-auto text-white/30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucun fichier</h3>
            <p className="text-white/60">Uploadez votre premier fichier ci-dessus</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fichiers.map((fichier) => (
              <div key={fichier.id} className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <File size={24} className="text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-medium truncate">{fichier.nom}</h3>
                    <div className="flex items-center gap-3 text-sm text-white/50">
                      <span>{formatSize(fichier.taille)}</span>
                      <span>•</span>
                      <span>{formatDate(fichier.date_upload)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownload(fichier)}
                    className="p-2 hover:bg-white/10 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                    title="Télécharger"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(fichier.id)}
                    className="p-2 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Fichiers;