
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Track } from '@/pages/Index';

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: Date;
  image?: string;
}

interface MusicContextType {
  likedSongs: Track[];
  playlists: Playlist[];
  addToLikedSongs: (track: Track) => void;
  removeFromLikedSongs: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  downloadTrack: (track: Track) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusicContext must be used within a MusicProvider');
  }
  return context;
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedLikedSongs = localStorage.getItem('speedify-liked-songs');
    const savedPlaylists = localStorage.getItem('speedify-playlists');
    
    if (savedLikedSongs) {
      setLikedSongs(JSON.parse(savedLikedSongs));
    }
    
    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('speedify-liked-songs', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('speedify-playlists', JSON.stringify(playlists));
  }, [playlists]);

  const addToLikedSongs = (track: Track) => {
    setLikedSongs(prev => {
      if (prev.some(t => t.id === track.id)) return prev;
      return [...prev, track];
    });
  };

  const removeFromLikedSongs = (trackId: string) => {
    setLikedSongs(prev => prev.filter(t => t.id !== trackId));
  };

  const isLiked = (trackId: string) => {
    return likedSongs.some(t => t.id === trackId);
  };

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      tracks: [],
      createdAt: new Date(),
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const addToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, tracks: [...playlist.tracks.filter(t => t.id !== track.id), track] }
        : playlist
    ));
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, tracks: playlist.tracks.filter(t => t.id !== trackId) }
        : playlist
    ));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  const downloadTrack = (track: Track) => {
    if (track.preview_url) {
      const link = document.createElement('a');
      link.href = track.preview_url;
      link.download = `${track.artist} - ${track.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <MusicContext.Provider value={{
      likedSongs,
      playlists,
      addToLikedSongs,
      removeFromLikedSongs,
      isLiked,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      deletePlaylist,
      downloadTrack,
    }}>
      {children}
    </MusicContext.Provider>
  );
};
