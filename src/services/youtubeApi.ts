// src/services/youtubeApi.ts

import { Track as MusicTrack } from '@/pages/Index';

// YouTube Music API Configuration
// const API_URL = 'http://localhost:3001'; // This was for local testing
const API_URL = 'https://backendserver-feuj.vercel.app';

// Interface for a track from the YouTube Music API
interface YoutubeTrack {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: {
      seconds: number;
      text: string;
  };
  url: string;
}

/**
 * Converts a YouTube track to the common MusicTrack format.
 * @param youtubeTrack - The track object from the YouTube Music API.
 * @returns A MusicTrack object.
 */
export const convertYoutubeToTrack = (youtubeTrack: YoutubeTrack): MusicTrack => {
  return {
    id: `youtube_${youtubeTrack.videoId}`,
    title: youtubeTrack.title,
    artist: youtubeTrack.channel,
    album: 'YouTube', // YouTube doesn't really have albums for single tracks
    duration: youtubeTrack.duration.seconds,
    previewDuration: 30, // Default preview duration
    image: youtubeTrack.thumbnail,
    preview_url: `${API_URL}/api/audio/${youtubeTrack.videoId}`,
    fullTrackUrl: `${API_URL}/api/audio/${youtubeTrack.videoId}`,
    streamUrl: `${API_URL}/api/audio/${youtubeTrack.videoId}`,
    downloadUrl: `${API_URL}/api/audio/${youtubeTrack.videoId}`,
    source: 'youtube',
    license: 'YouTube',
    genre: 'Various',
  };
};

/**
 * Searches for tracks using the YouTube Music API.
 * @param query - The search query.
 * @param limit - The number of tracks to fetch (the backend doesn't seem to support a limit).
 * @returns A promise that resolves to an array of MusicTrack objects.
 */
export const searchTracksYoutube = async (query: string, limit: number = 20): Promise<MusicTrack[]> => {
  try {
    console.log('Searching YouTube API for:', query);
    // The backend doesn't support a limit, so we'll fetch and then slice.
    const searchUrl = `${API_URL}/api/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    const data: YoutubeTrack[] = await response.json();
    console.log(`Found ${data.length} tracks from YouTube for query: ${query}`);
    return data.slice(0, limit).map(convertYoutubeToTrack);
  } catch (error) {
    console.error('Error searching YouTube tracks:', error);
    return []; // Return empty array on error
  }
};

/**
 * Tests the YouTube API connection.
 * @returns A promise that resolves to true if the API is reachable, false otherwise.
 */
export const testYoutubeAPI = async (): Promise<boolean> => {
  try {
    console.log('Testing YouTube API connection...');
    const response = await fetch(`${API_URL}/api/search?q=test`);
    if (!response.ok) {
      throw new Error(`YouTube API test failed: ${response.status}`);
    }
    console.log('YouTube API connection successful');
    return true;
  } catch (error) {
    console.error('YouTube API test error:', error);
    return false;
  }
}; 