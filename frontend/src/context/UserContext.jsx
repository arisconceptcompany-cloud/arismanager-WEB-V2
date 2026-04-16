import { createContext, useContext, useState, useEffect } from 'react';
import api, { DEFAULT_AVATAR } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children, initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const getDefaultAvatar = () => {
    return `${DEFAULT_AVATAR}&name=${user?.prenom || ''}+${user?.nom || ''}`;
  };

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setPhotoError(false);
      setPhotoLoading(true);
      
      const userId = initialUser.id;
      
      // First check localStorage
      const savedPhoto = localStorage.getItem(`profilePhoto_${userId}`);
      
      if (savedPhoto && savedPhoto !== 'null' && savedPhoto !== 'undefined' && savedPhoto.length < 500000) {
        if (savedPhoto.startsWith('data:') || savedPhoto.startsWith('http')) {
          setProfilePhoto(savedPhoto);
          setPhotoLoading(false);
          return;
        }
      }
      
      // Clear invalid localStorage
      if (savedPhoto && savedPhoto.length > 500000) {
        localStorage.removeItem(`profilePhoto_${userId}`);
      }
      
      // Try to load from API with Axios
      api.get(`/photos/employe/${userId}`, { responseType: 'blob' })
        .then(response => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfilePhoto(reader.result);
            setPhotoLoading(false);
          };
          reader.readAsDataURL(response.data);
        })
        .catch(() => {
          setProfilePhoto(`${DEFAULT_AVATAR}&name=${initialUser?.prenom || ''}+${initialUser?.nom || ''}`);
          setPhotoError(true);
          setPhotoLoading(false);
        });
    }
  }, [initialUser]);

  const updateProfilePhoto = (photo) => {
    setProfilePhoto(photo);
    setPhotoError(false);
    const userId = user?.id || initialUser?.id;
    if (userId && photo && photo.length < 1000000) {
      try {
        localStorage.setItem(`profilePhoto_${userId}`, photo);
      } catch (e) {
        console.warn('Could not save to localStorage');
      }
    }
  };

  const handlePhotoError = () => {
    setPhotoError(true);
    if (user) {
      setProfilePhoto(`${DEFAULT_AVATAR}&name=${user?.prenom || ''}+${user?.nom || ''}`);
    }
  };

  const getAvatarUrl = () => {
    if (user) {
      return `${DEFAULT_AVATAR}&name=${user?.prenom || ''}+${user?.nom || ''}`;
    }
    return DEFAULT_AVATAR;
  };

  return (
    <UserContext.Provider value={{ user, setUser, profilePhoto, updateProfilePhoto, getAvatarUrl, handlePhotoError, photoError, photoLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
