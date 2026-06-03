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
      
      const userId = initialUser.id;
      
      const savedPhoto = localStorage.getItem(`profilePhoto_${userId}`);
      
      if (savedPhoto && savedPhoto !== 'null' && savedPhoto !== 'undefined' && savedPhoto.length < 100000) {
        if (savedPhoto.startsWith('data:') || savedPhoto.startsWith('http')) {
          setProfilePhoto(savedPhoto);
          return;
        }
      }
      
      if (savedPhoto && savedPhoto.length > 100000) {
        localStorage.removeItem(`profilePhoto_${userId}`);
      }

      const photoUrl = `https://apiv2.aris-cc.com/api/photos/employe/${userId}`;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setProfilePhoto(photoUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          if (dataUrl.length < 80000) {
            localStorage.setItem(`profilePhoto_${userId}`, dataUrl);
          }
        } catch (_) {}
      };
      img.onerror = () => setPhotoError(true);
      img.src = photoUrl;
    }
  }, [initialUser]);

  const updateProfilePhoto = (photo) => {
    setProfilePhoto(photo);
    setPhotoError(false);
    const userId = user?.id || initialUser?.id;
    if (userId && photo && photo.length < 80000) {
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
