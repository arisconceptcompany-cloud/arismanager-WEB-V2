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
      
      if (savedPhoto && savedPhoto !== 'null' && savedPhoto !== 'undefined' && savedPhoto.length < 500000) {
        if (savedPhoto.startsWith('data:') || savedPhoto.startsWith('http')) {
          setProfilePhoto(savedPhoto);
          return;
        }
      }
      
      if (savedPhoto && savedPhoto.length > 500000) {
        localStorage.removeItem(`profilePhoto_${userId}`);
      }
      
      api.get(`/photos/employe/${userId}`, { responseType: 'blob' })
        .then(response => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result;
            setProfilePhoto(base64);
            if (base64.length < 1000000) {
              localStorage.setItem(`profilePhoto_${userId}`, base64);
            }
          };
          reader.readAsDataURL(response.data);
        })
        .catch(() => {
          setPhotoError(true);
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
