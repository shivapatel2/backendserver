// iTunes API - Free Music Streaming (30-second previews only)
// Provides music search and preview clips from iTunes

import {
  searchTracksJioSaavn,
  testJioSaavnAPI as testJioSaavn,
} from './jiosaavnApi';
import {
  searchTracksYoutube,
  testYoutubeAPI as testYoutube,
} from './youtubeApi';

export interface ITunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  trackTimeMillis: number;
  artworkUrl100: string;
  previewUrl: string;
  trackViewUrl: string;
  collectionViewUrl: string;
  primaryGenreName: string;
}

// Enhanced track interface
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  previewDuration: number;
  image: string;
  preview_url?: string;
  fullTrackUrl?: string;
  streamUrl?: string;
  downloadUrl?: string;
  source: 'freemusic' | 'jiosaavn' | 'youtube';
  license?: string;
  genre?: string;
}

// iTunes API configuration
const ITUNES_BASE_URL = 'https://itunes.apple.com';

// Search tracks using iTunes API
export const searchTracksITunes = async (query: string, limit: number = 20): Promise<MusicTrack[]> => {
  try {
    console.log('Searching iTunes API for:', query);
    // iTunes search endpoint
    const searchUrl = `${ITUNES_BASE_URL}/search?term=${encodeURIComponent(query)}&media=music&limit=${limit}`;
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }
    const data = await response.json();
    const tracks = data.results || [];
    console.log(`Found ${tracks.length} tracks from iTunes for query: ${query}`);
    const convertedTracks = tracks.map(convertITunesToTrack).filter(track => track.preview_url);
    return convertedTracks.length > 0 ? convertedTracks : getDemoTracks();
  } catch (error) {
    console.error('Error searching iTunes tracks:', error);
    return getDemoTracks();
  }
};

// Get featured tracks from iTunes (using a default search)
export const getFeaturedTracksITunes = async (): Promise<MusicTrack[]> => {
  // Use a popular search term to get featured tracks
  return await searchTracksITunes('top hits', 12);
};

// Convert iTunes track to our format
export const convertITunesToTrack = (itunesTrack: ITunesTrack): MusicTrack => {
  const duration = Math.floor((itunesTrack.trackTimeMillis || 30000) / 1000);
  const imageUrl = itunesTrack.artworkUrl100?.replace('100x100', '300x300') || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop';
  const audioUrl = itunesTrack.previewUrl;
  return {
    id: `itunes_${itunesTrack.trackId}`,
    title: itunesTrack.trackName,
    artist: itunesTrack.artistName,
    album: itunesTrack.collectionName || 'Unknown Album',
    duration: duration,
    previewDuration: duration,
    image: imageUrl,
    preview_url: audioUrl,
    fullTrackUrl: undefined, // iTunes only provides preview clips
    streamUrl: audioUrl,
    downloadUrl: audioUrl,
    source: 'freemusic',
    license: 'iTunes Preview',
    genre: itunesTrack.primaryGenreName || 'Unknown',
  };
};

// Demo tracks as fallback
const getDemoTracks = (): MusicTrack[] => {
  return [
    {
      id: 'demo_1',
      title: 'Jazz Improvisation',
      artist: 'Free Jazz Collective',
      album: 'Open Source Jazz',
      duration: 180,
      previewDuration: 180,
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop',
      preview_url: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      fullTrackUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      streamUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      downloadUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      source: 'freemusic',
      license: 'Creative Commons',
      genre: 'Jazz',
    },
    {
      id: 'demo_2',
      title: 'Classical Symphony',
      artist: 'Open Orchestra',
      album: 'Public Domain Classics',
      duration: 240,
      previewDuration: 240,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      preview_url: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      fullTrackUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      streamUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      downloadUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      source: 'freemusic',
      license: 'Creative Commons',
      genre: 'Classical',
    },
    {
      id: 'demo_3',
      title: 'Electronic Beats',
      artist: 'Digital Commons',
      album: 'Free Electronic Music',
      duration: 200,
      previewDuration: 200,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      preview_url: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      fullTrackUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      streamUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      downloadUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      source: 'freemusic',
      license: 'Creative Commons',
      genre: 'Electronic',
    },
    {
      id: 'demo_4',
      title: 'Folk Ballad',
      artist: 'Traditional Folk',
      album: 'Public Domain Folk',
      duration: 160,
      previewDuration: 160,
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop',
      preview_url: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      fullTrackUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      streamUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      downloadUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      source: 'freemusic',
      license: 'Creative Commons',
      genre: 'Folk',
    },
    {
      id: 'demo_5',
      title: 'Rock Anthem',
      artist: 'Indie Rock Band',
      album: 'Open Source Rock',
      duration: 220,
      previewDuration: 220,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      preview_url: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      fullTrackUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      streamUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      downloadUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      source: 'freemusic',
      license: 'Creative Commons',
      genre: 'Rock',
    },
    {
      id: 'demo_6',
      title: 'Blues Guitar',
      artist: 'Delta Blues',
      album: 'Public Domain Blues',
      duration: 190,
      previewDuration: 190,
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop',
      preview_url: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      fullTrackUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      streamUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      downloadUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      source: 'freemusic',
      license: 'Creative Commons',
      genre: 'Blues',
    }
  ];
};

// Main functions
export const searchTracks = async (query: string, limit: number = 20): Promise<MusicTrack[]> => {
  const youtubeResults = await searchTracksYoutube(query, limit);
  if (youtubeResults.length > 0) {
    return youtubeResults;
  }
  const jiosaavnResults = await searchTracksJioSaavn(query, limit);
  if (jiosaavnResults.length > 0) {
    return jiosaavnResults;
  }
  // Fallback to iTunes if JioSaavn fails or returns no results
  return await searchTracksITunes(query, limit);
};

export const getFeaturedTracks = async (): Promise<MusicTrack[]> => {
  const youtubeResults = await searchTracksYoutube('top hits', 12);
  if (youtubeResults.length > 0) {
    return youtubeResults;
  }
  const jiosaavnResults = await searchTracksJioSaavn('top hits', 12);
  if (jiosaavnResults.length > 0) {
    return jiosaavnResults;
  }
  // Fallback to iTunes if JioSaavn fails or returns no results
  return await getFeaturedTracksITunes();
};

export const getFeaturedTracksEnhanced = async (): Promise<MusicTrack[]> => {
  return await getFeaturedTracks();
};

// API status testing functions
export const testITunesAPI = async (): Promise<boolean> => {
  try {
    console.log('Testing iTunes API connection...');
    const response = await fetch(`${ITUNES_BASE_URL}/search?term=test&media=music&limit=1`);
    if (!response.ok) {
      throw new Error(`iTunes API test failed: ${response.status}`);
    }
    console.log('iTunes API test successful');
    return true;
  } catch (error) {
    console.error('iTunes API test error:', error);
    return false;
  }
};

export const testJioSaavnAPI = async (): Promise<boolean> => {
  return await testJioSaavn();
};

export const testYoutubeAPI = async (): Promise<boolean> => {
  return await testYoutube();
};

export const testAllAPIs = async (): Promise<{
  freemusic: boolean;
  jiosaavn: boolean;
  youtube: boolean;
}> => {
  const itunesResult = await testITunesAPI();
  const jiosaavnResult = await testJioSaavnAPI();
  const youtubeResult = await testYoutubeAPI();
  return {
    freemusic: itunesResult,
    jiosaavn: jiosaavnResult,
    youtube: youtubeResult,
  };
};

// Legacy functions for backward compatibility
export const getBestTrackSource = async (query: string): Promise<MusicTrack[]> => {
  return await searchTracksITunes(query);
}; 