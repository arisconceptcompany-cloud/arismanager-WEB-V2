import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Search, Send, Users, X, Smile, Reply, Trash2, Image, File, ChevronDown, AtSign, Download, Eye, Paperclip } from 'lucide-react';
import { chatAPI, photoAPI, DEFAULT_AVATAR } from '../services/api';
import { useUser } from '../context/UserContext';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥'];

function Chat() {
  const { user, profilePhoto } = useUser();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [employePhotos, setEmployePhotos] = useState({});
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const [showMentions, setShowMentions] = useState(false);
  const [filteredMentions, setFilteredMentions] = useState([]);
  const [attachements, setAttachements] = useState([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(null);
  const [previewAttachments, setPreviewAttachments] = useState([]);
  const [failedPhotos, setFailedPhotos] = useState(new Set());
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const deleteMenuRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.id && profilePhoto) {
      setEmployePhotos(prev => ({ ...prev, [user.id]: profilePhoto }));
    }
  }, [profilePhoto, user?.id]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(null);
      }
      if (deleteMenuRef.current && !deleteMenuRef.current.contains(e.target)) {
        setShowDeleteMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const [convRes, empRes] = await Promise.all([
        chatAPI.getConversations(),
        chatAPI.getEmployes()
      ]);
      setConversations(convRes.data);
      setEmployes(empRes.data);
      
      const photos = {};
      const baseUrl = 'http://167.86.118.96:3002';
      for (const emp of empRes.data) {
        const storedPhoto = localStorage.getItem(`profilePhoto_${emp.id}`);
        if (storedPhoto && (storedPhoto.startsWith('data:') || storedPhoto.startsWith('http'))) {
          photos[emp.id] = storedPhoto;
        } else if (emp.photo) {
          if (emp.photo.startsWith('data:')) {
            photos[emp.id] = emp.photo;
          } else if (emp.photo.startsWith('/photos/')) {
            photos[emp.id] = baseUrl + emp.photo;
          } else if (emp.photo.startsWith('/')) {
            photos[emp.id] = baseUrl + emp.photo;
          } else {
            photos[emp.id] = emp.photo;
          }
        }
      }
      setEmployePhotos(photos);
    } catch (error) {
      console.error('Erreur chargement chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await chatAPI.getMessages(conversationId);
      setMessages(res.data);
      setReplyTo(null);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const startConversation = async (employe) => {
    try {
      const res = await chatAPI.getOrCreateConversation(employe.id);
      setSelectedConversation(res.data);
      setSelectedUser({
        id: employe.id,
        nom: employe.nom,
        prenom: employe.prenom,
        matricule: employe.matricule
      });
      setShowContacts(false);
      fetchData();
    } catch (error) {
      console.error('Erreur démarrage conversation:', error);
    }
  };

  const openGroupChat = async () => {
    try {
      let res = await chatAPI.getGroupConversation();
      if (!res.data) {
        res = await chatAPI.getOrCreateGroup('Tous les employés');
      }
      setSelectedConversation(res.data);
      setSelectedUser({
        id: null,
        nom: '',
        prenom: 'Tous les employés',
        matricule: 'Groupe'
      });
      setShowContacts(false);
      fetchData();
    } catch (error) {
      console.error('Erreur groupe:', error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 30 * 1024 * 1024) {
        alert(`Le fichier ${file.name} dépasse 30MB`);
        return false;
      }
      return true;
    });
    setAttachements(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachements(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setShowMentions(true);
      setFilteredMentions(
        employes.filter(emp => 
          `${emp.prenom} ${emp.nom}`.toLowerCase().includes(mentionMatch[1].toLowerCase()) ||
          emp.matricule.toLowerCase().includes(mentionMatch[1].toLowerCase())
        ).filter(emp => emp.id !== user.id).slice(0, 5)
      );
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (emp) => {
    const cursorPos = inputRef.current.selectionStart;
    const textBeforeCursor = newMessage.slice(0, cursorPos);
    const textAfterCursor = newMessage.slice(cursorPos);
    const newText = textBeforeCursor.replace(/@\w*$/, `@${emp.prenom} `);
    setNewMessage(newText + textAfterCursor);
    setShowMentions(false);
    inputRef.current.focus();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && attachements.length === 0) return;

    try {
      const conversationId = selectedConversation?.id;
      const destinaireId = selectedUser?.id || selectedConversation?.destinaire_id;
      
      const fichiers = await Promise.all(attachements.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              data: base64
            });
          };
          reader.readAsDataURL(file);
        });
      }));

      let contenu = newMessage.trim() || (fichiers.length > 0 ? '📎' : '');
      const hasEveryoneMention = contenu.toLowerCase().includes('@everyone') || 
                                   contenu.toLowerCase().includes('@tout_le_monde');
      if (hasEveryoneMention) {
        const mentionIndex = contenu.toLowerCase().indexOf('@everyone');
        if (mentionIndex === -1) {
          const index2 = contenu.toLowerCase().indexOf('@tout_le_monde');
          contenu = contenu.slice(0, index2) + '@tout_le_monde ' + contenu.slice(index2 + 14);
        } else {
          contenu = contenu.slice(0, mentionIndex) + '@tout_le_monde ' + contenu.slice(mentionIndex + 9);
        }
      }
      
      await chatAPI.sendMessage({ 
        conversation_id: conversationId, 
        destinaire_id: destinaireId,
        contenu: contenu,
        reply_to_id: replyTo?.id || null,
        fichiers: fichiers 
      });
      
      setNewMessage('');
      setReplyTo(null);
      setAttachements([]);
      if (selectedConversation) {
        fetchMessages(selectedConversation.id);
      }
      fetchData();
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const deleteMessage = async (messageId, forEveryone) => {
    try {
      await chatAPI.deleteMessage(messageId, forEveryone);
      setShowDeleteMenu(null);
      if (selectedConversation) {
        fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Erreur suppression message:', error);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      await chatAPI.addReaction(messageId, emoji);
      setShowEmojiPicker(null);
      if (selectedConversation) {
        fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Erreur reaction:', error);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return formatTime(date);
    }
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  };

  const getInitials = (nom, prenom) => {
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  };

  const getDefaultAvatar = (nom, prenom) => `${DEFAULT_AVATAR}&name=${prenom || ''}+${nom || ''}`;

  const renderAvatar = (employeId, nom, prenom, size = 'w-12 h-12', className = '') => {
    const photoUrl = employePhotos[employeId];
    
    return (
      <div className={`${size} rounded-full ${className}`}>
        <img
          src={photoUrl || getDefaultAvatar(nom, prenom)}
          alt={`${prenom || ''} ${nom || ''}`}
          className={`${size} rounded-full object-cover`}
          onError={(e) => {
            e.target.src = getDefaultAvatar(nom, prenom);
          }}
        />
      </div>
    );
  };

  const filteredEmployes = employes.filter(e => 
    `${e.nom} ${e.prenom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(e => e.id !== user.id);

  const filteredConversations = conversations.filter(c =>
    `${c.autre_prenom || ''} ${c.autre_nom || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.group_name && c.group_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getConversationUser = (conv) => ({
    id: conv.is_group ? null : conv.autre_utilisateur_id,
    nom: conv.is_group ? '' : conv.autre_nom,
    prenom: conv.is_group ? conv.group_name : conv.autre_prenom,
    matricule: conv.is_group ? 'Groupe' : conv.autre_matricule,
    isGroup: conv.is_group
  });

  const parseMessageContent = (content) => {
    if (!content) return '';
    const parts = content.split(/(@\w+\s?)/g);
    return parts.map((part, i) => {
      if (part.match(/^@\w+$/)) {
        return <span key={i} className="text-blue-400 font-medium bg-blue-500/30 px-1 rounded">{part}</span>;
      }
      return part;
    });
  };

  const parseAttachments = (fichiers) => {
    if (!fichiers) return [];
    try {
      const files = typeof fichiers === 'string' ? JSON.parse(fichiers) : fichiers;
      if (!Array.isArray(files)) return [];
      return files;
    } catch {
      return [];
    }
  };

  const openAttachmentModal = (files) => {
    setPreviewAttachments(files);
    setShowAttachmentModal(true);
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = `data:${file.type};base64,${file.data}`;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const groupReactions = (reactions) => {
    const grouped = {};
    reactions.forEach(r => {
      if (!grouped[r.emoji]) {
        grouped[r.emoji] = [];
      }
      grouped[r.emoji].push(r);
    });
    return Object.entries(grouped).map(([emoji, users]) => ({
      emoji,
      count: users.length,
      users: users.map(u => `${u.prenom} ${u.nom}`).join(', ')
    }));
  };

  const getReplyMessage = (replyToId) => {
    return messages.find(m => m.id === replyToId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-white bg-black/50 px-4 py-2 rounded-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)]">
      {showAttachmentModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-8" onClick={() => setShowAttachmentModal(false)}>
          <button 
            onClick={() => setShowAttachmentModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
          >
            <X size={32} />
          </button>
          <div className="max-w-4xl max-h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
            {previewAttachments.map((file, idx) => (
              <div key={idx} className="mb-4">
                {file.type?.startsWith('image/') ? (
                  <img 
                    src={`data:${file.type};base64,${file.data}`} 
                    alt={file.name}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  />
                ) : (
                  <div className="bg-white/10 rounded-lg p-8 flex flex-col items-center gap-4">
                    <File size={64} className="text-white/70" />
                    <p className="text-white text-lg">{file.name}</p>
                    <p className="text-white/50">{formatFileSize(file.size)}</p>
                  </div>
                )}
                <div className="mt-2 flex justify-center gap-4">
                  <button
                    onClick={() => downloadFile(file)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <Download size={18} />
                    Télécharger
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-col sm:flex-row items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-white/70">Discutez avec vos collègues</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button 
            onClick={openGroupChat}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all text-sm sm:text-base"
          >
            <Users size={18} />
            <span className="hidden sm:inline">Groupe</span>
          </button>
          <button 
            onClick={() => setShowContacts(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all text-sm sm:text-base"
          >
            <MessageCircle size={18} />
            <span className="hidden sm:inline">Nouveau message</span>
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden h-[calc(100%-80px)] flex">
        {/* Liste conversations - hidden on mobile when conversation selected */}
        <div className={selectedConversation ? "hidden md:flex w-full md:w-80 border-r border-white/20 flex-col" : "flex w-full md:w-80 border-r border-white/20 flex-col"}>
          <div className="p-4 border-b border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-white/50">
                <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                <p>Aucune conversation</p>
                <button 
                  onClick={() => setShowContacts(true)}
                  className="mt-3 text-blue-400 hover:text-blue-300"
                >
                  Commencer une conversation
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherUser = getConversationUser(conv);
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      setSelectedUser(otherUser);
                    }}
                    className={"p-4 cursor-pointer hover:bg-white/10 transition-colors border-b border-white/10 " + (selectedConversation?.id === conv.id ? 'bg-blue-600/20' : '')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {otherUser.isGroup ? (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white">
                            <Users size={20} />
                          </div>
                        ) : (
                          renderAvatar(conv.autre_utilisateur_id, otherUser.nom, otherUser.prenom)
                        )}
                        {conv.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="text-white font-medium truncate">
                            {otherUser.prenom} {otherUser.nom}
                          </h4>
                          <span className="text-xs text-white/50">
                            {conv.dernier_message_at ? formatDate(conv.dernier_message_at) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-blue-400">{otherUser.matricule}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Zone messages */}
        <div className={selectedConversation ? "flex flex-col w-full flex-1 flex-col" : "hidden md:flex flex-1 flex-col"}>
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-white/20 bg-white/5">
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Bouton retour mobile */}
                  <button
                    onClick={() => { setSelectedConversation(null); setSelectedUser(null); }}
                    className="md:hidden p-2 hover:bg-white/10 rounded-lg text-white"
                  >
                    <X size={20} />
                  </button>
                  {selectedUser?.isGroup ? (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-purple-500 to-pink-600">
                      <Users size={18} />
                    </div>
                  ) : (
                    renderAvatar(selectedUser?.id, selectedUser?.nom, selectedUser?.prenom, 'w-10 h-10')
                  )}
                  <div>
                    <h4 className="text-white font-medium">
                      {selectedUser?.prenom} {selectedUser?.nom}
                    </h4>
                    <p className="text-xs text-blue-400">{selectedUser?.matricule}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.expediteur_id === user.id;
                  const replyMsg = msg.reply_to_id ? getReplyMessage(msg.reply_to_id) : null;
                  const files = parseAttachments(msg.fichiers);
                  const reactions = msg.reactions || [];
                  const groupedReactions = groupReactions(reactions);
                  
                  return (
                    <div key={msg.id} className={isMe ? "flex justify-end group" : "flex justify-start group"}>
                      {!isMe && (
                        <div className="mr-2">
                          {renderAvatar(msg.expediteur_id, msg.nom, msg.prenom, 'w-10 h-10')}
                        </div>
                      )}
                      <div className={isMe ? "max-w-[75%] order-2" : "max-w-[75%] order-1"}>
                        {replyMsg && (
                          <div className={"mb-1 px-3 py-2 rounded-lg text-xs " + (isMe ? 'bg-blue-500/30' : 'bg-white/10')}>
                            <p className="text-white/50 mb-1">Réponse à {replyMsg.expediteur_id === user.id ? 'vous' : replyMsg.prenom + ' ' + replyMsg.nom}</p>
                            <p className="text-white/80 truncate">{replyMsg.contenu || '📎 Fichier'}</p>
                          </div>
                        )}
                        <div
                          className={"px-4 py-3 rounded-2xl relative " + (isMe ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white/20 text-white rounded-bl-md')}
                        >
                          {!isMe && (
                            <p className="text-xs text-blue-400 mb-1 font-medium">{msg.prenom} {msg.nom}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{parseMessageContent(msg.contenu)}</p>
                          
                          {files.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {files.length === 1 ? (
                                files[0].type?.startsWith('image/') ? (
                                  <div className="relative group/file">
                                    <img 
                                      src={`data:${files[0].type};base64,${files[0].data}`} 
                                      alt={files[0].name}
                                      className="max-w-[300px] max-h-[300px] object-cover rounded-lg cursor-pointer hover:opacity-90"
                                      onClick={() => openAttachmentModal(files)}
                                    />
                                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover/file:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => openAttachmentModal(files)}
                                        className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
                                        title="Voir"
                                      >
                                        <Eye size={14} />
                                      </button>
                                      <button
                                        onClick={() => downloadFile(files[0])}
                                        className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
                                        title="Télécharger"
                                      >
                                        <Download size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 cursor-pointer hover:bg-white/20" onClick={() => openAttachmentModal(files)}>
                                    <File size={24} className="text-blue-400" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-white truncate">{files[0].name}</p>
                                      <p className="text-xs text-white/50">{formatFileSize(files[0].size)}</p>
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); downloadFile(files[0]); }}
                                      className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
                                      title="Télécharger"
                                    >
                                      <Download size={14} />
                                    </button>
                                  </div>
                                )
                              ) : (
                                <div className="bg-white/10 rounded-lg p-2 cursor-pointer hover:bg-white/20" onClick={() => openAttachmentModal(files)}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Paperclip size={16} className="text-white/70" />
                                    <span className="text-sm text-white">{files.length} fichiers</span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    {files.slice(0, 6).map((file, idx) => (
                                      <div key={idx} className="relative aspect-square bg-white/5 rounded overflow-hidden">
                                        {file.type?.startsWith('image/') ? (
                                          <img 
                                            src={`data:${file.type};base64,${file.data}`} 
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <File size={24} className="text-white/50" />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {files.length > 6 && (
                                      <div className="absolute right-2 bottom-2 bg-black/50 rounded px-2 py-1 text-xs text-white">
                                        +{files.length - 6}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <p className={isMe ? "text-xs text-blue-200" : "text-xs text-white/50"}>
                              {formatTime(msg.created_at)}
                            </p>
                            {isMe && (
                              <div className="flex items-center gap-1">
                                <span className="text-blue-200 text-xs">✓</span>
                                {msg.is_read_by && msg.is_read_by.length > 1 && (
                                  <span className="text-xs text-blue-300" title={`Lu par ${msg.is_read_by.map(u => u.prenom).join(', ')}`}>
                                    ✓
                                  </span>
                                )}
                              </div>
                            )}
                            {groupedReactions.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {groupedReactions.map((gr, i) => (
                                  <div 
                                    key={i} 
                                    className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs"
                                    title={gr.users}
                                  >
                                    <span>{gr.emoji}</span>
                                    <span className="text-white/80">{gr.count > 1 ? gr.count : ''}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {!isMe && selectedUser?.isGroup && msg.is_read_by && msg.is_read_by.length > 0 && (
                              <div className="flex items-center gap-1 ml-auto">
                                {msg.is_read_by.slice(0, 3).map((reader, idx) => (
                                  <div 
                                    key={reader.id} 
                                    className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold"
                                    title={`Lu par ${reader.prenom}`}
                                  >
                                    {reader.prenom?.[0]}{reader.nom?.[0]}
                                  </div>
                                ))}
                                {msg.is_read_by.length > 3 && (
                                  <span className="text-xs text-white/50">+{msg.is_read_by.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className={isMe ? "absolute top-1/2 -translate-y-1/2 -left-12 hidden group-hover:flex gap-1" : "absolute top-1/2 -translate-y-1/2 right-0 hidden group-hover:flex gap-1"}>
                            <button
                              onClick={() => { setReplyTo(msg); inputRef.current?.focus(); }}
                              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                              title="Répondre"
                            >
                              <Reply size={14} />
                            </button>
                            <div className="relative" ref={emojiPickerRef}>
                              <button
                                onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                                title="Réaction"
                              >
                                <Smile size={14} />
                              </button>
                              {showEmojiPicker === msg.id && (
                                <div className="absolute bottom-full mb-2 bg-slate-800 rounded-lg p-2 shadow-lg z-50">
                                  <div className="flex gap-1 flex-wrap w-[160px]">
                                    {EMOJIS.map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={() => handleReaction(msg.id, emoji)}
                                        className="w-8 h-8 hover:bg-white/20 rounded flex items-center justify-center text-lg"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            {isMe && (
                              <div className="relative" ref={deleteMenuRef}>
                                <button
                                  onClick={() => setShowDeleteMenu(showDeleteMenu === msg.id ? null : msg.id)}
                                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                                  title="Supprimer"
                                >
                                  <ChevronDown size={14} />
                                </button>
                                {showDeleteMenu === msg.id && (
                                  <div className="absolute bottom-full mb-2 right-0 bg-slate-800 rounded-lg shadow-lg z-50 overflow-hidden min-w-[160px]">
                                    <button
                                      onClick={() => deleteMessage(msg.id, false)}
                                      className="flex items-center gap-2 px-4 py-2 hover:bg-white/20 text-white w-full"
                                    >
                                      <Trash2 size={14} />
                                      <span className="text-sm">Supprimer pour moi</span>
                                    </button>
                                    <button
                                      onClick={() => deleteMessage(msg.id, true)}
                                      className="flex items-center gap-2 px-4 py-2 hover:bg-red-600/50 text-white w-full"
                                    >
                                      <Trash2 size={14} />
                                      <span className="text-sm">Supprimer pour tous</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-4 border-t border-white/20 bg-white/5">
                {replyTo && (
                  <div className="mb-3 px-3 py-2 bg-white/10 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/50 mb-1">Réponse à {replyTo.expediteur_id === user.id ? 'vous' : `${replyTo.prenom} ${replyTo.nom}`}</p>
                      <p className="text-sm text-white/80 truncate">{replyTo.contenu || '📎 Fichier'}</p>
                    </div>
                    <button type="button" onClick={() => setReplyTo(null)} className="text-white/50 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>
                )}
                {attachements.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachements.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                        {file.type?.startsWith('image/') ? (
                          <img src={URL.createObjectURL(file)} alt="" className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <File size={16} className="text-white/70" />
                        )}
                        <span className="text-sm text-white truncate max-w-[100px]">{file.name}</span>
                        <button type="button" onClick={() => removeAttachment(idx)} className="text-white/50 hover:text-white">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                      title="Joindre un fichier"
                    >
                      <Paperclip size={20} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Écrivez un message... (@ pour mentionner)"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                      />
                      {showMentions && filteredMentions.length > 0 && (
                        <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                          {filteredMentions.map((emp) => (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => insertMention(emp)}
                              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-white/10 text-left"
                            >
                              {renderAvatar(emp.id, emp.nom, emp.prenom, 'w-8 h-8')}
                              <div>
                                <p className="text-white text-sm">{emp.prenom} {emp.nom}</p>
                                <p className="text-white/50 text-xs">{emp.matricule}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const text = newMessage + (newMessage.includes('@') ? '' : ' @tout_le_monde');
                        setNewMessage(text);
                        inputRef.current?.focus();
                      }}
                      className="w-12 h-12 bg-purple-600/50 hover:bg-purple-600 rounded-full flex items-center justify-center text-white transition-colors"
                      title="Mentionner tout le monde"
                    >
                      <AtSign size={20} />
                    </button>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() && attachements.length === 0}
                      className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/50">
                <MessageCircle size={80} className="mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-medium mb-2">Bienvenue dans ARIS Chat</h3>
                <p>Sélectionnez une conversation ou démarrez un nouveau message</p>
                <button 
                  onClick={openGroupChat}
                  className="mt-4 mx-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Groupe
                </button>
                <button 
                  onClick={() => setShowContacts(true)}
                  className="mt-4 mx-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Nouveau message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showContacts && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowContacts(false)}>
          <div className="bg-slate-800 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Nouveau message</h3>
              <button onClick={() => setShowContacts(false)} className="text-white/50 hover:text-white text-2xl">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 border-b border-white/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher un contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredEmployes.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => startConversation(emp)}
                  className="p-3 cursor-pointer hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
                >
                  {renderAvatar(emp.id, emp.nom, emp.prenom)}
                  <div>
                    <h4 className="text-white font-medium">{emp.prenom} {emp.nom}</h4>
                    <p className="text-xs text-blue-400">{emp.matricule} - {emp.poste}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
