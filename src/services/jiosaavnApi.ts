// src/services/jiosaavnApi.ts

import { Track as MusicTrack } from '@/pages/Index';

// JioSaavn API Configuration
const API_URL = 'https://jiosaavnapi-six.vercel.app';

// Interface for a track from the JioSaavn API
interface JioSaavnTrack {
  id: string;
  name: string;
  album: {
    id: string;
    name: string;
    url: string;
  };
  year: string;
  duration: string;
  language: string;
  artists: {
    primary: {
      id: string;
      name: string;
      url: string;
    }[];
    all: {
      id: string;
      name: string;
      url: string;
    }[];
  };
  image: {
    quality: string;
    url: string;
  }[];
  downloadUrl: {
    quality: string;
    url: string;
  }[];
  url: string;
}

// Interface for the JioSaavn search API response
interface JioSaavnSearchResponse {
  success: boolean;
  data: {
    results: JioSaavnTrack[];
  };
}

/**
 * Converts a JioSaavn track to the common MusicTrack format.
 * @param saavnTrack - The track object from the JioSaavn API.
 * @returns A MusicTrack object.
 */
export const convertJioSaavnToTrack = (saavnTrack: JioSaavnTrack): MusicTrack => {
  const forceHttps = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    return url.replace(/^http:/, 'https:');
  };

  const highQualityImage = saavnTrack.image.find(img => img.quality === '500x500') || saavnTrack.image[0];
  const highQualityDownload = saavnTrack.downloadUrl.find(dl => dl.quality === '320kbps') || saavnTrack.downloadUrl[saavnTrack.downloadUrl.length - 1];
  
  const secureImageUrl = forceHttps(highQualityImage.url);
  const secureDownloadUrl = forceHttps(highQualityDownload?.url);

  return {
    id: `jiosaavn_${saavnTrack.id}`,
    title: saavnTrack.name,
    artist: saavnTrack.artists.primary[0]?.name || 'Unknown Artist',
    album: saavnTrack.album.name || 'Unknown Album',
    duration: parseInt(saavnTrack.duration, 10),
    previewDuration: 30, // JioSaavn API doesn't provide preview duration, default to 30s
    image: secureImageUrl,
    preview_url: secureDownloadUrl,
    fullTrackUrl: secureDownloadUrl,
    streamUrl: secureDownloadUrl,
    downloadUrl: secureDownloadUrl,
    source: 'jiosaavn',
    license: 'JioSaavn',
    genre: saavnTrack.language,
  };
};

/**
 * Searches for tracks using the JioSaavn API.
 * @param query - The search query.
 * @param limit - The number of tracks to fetch.
 * @returns A promise that resolves to an array of MusicTrack objects.
 */
export const searchTracksJioSaavn = async (query: string, limit: number = 20): Promise<MusicTrack[]> => {
  try {
    console.log('Searching JioSaavn API for:', query);
    const searchUrl = `${API_URL}/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`;
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`JioSaavn API error: ${response.status}`);
    }
    const data: JioSaavnSearchResponse = await response.json();
    const tracks = data.data.results || [];
    console.log(`Found ${tracks.length} tracks from JioSaavn for query: ${query}`);
    return tracks.map(convertJioSaavnToTrack);
  } catch (error) {
    console.error('Error searching JioSaavn tracks:', error);
    return []; // Return empty array on error
  }
};

/**
 * Tests the JioSaavn API connection.
 * @returns A promise that resolves to true if the API is reachable, false otherwise.
 */
export const testJioSaavnAPI = async (): Promise<boolean> => {
  try {
    console.log('Testing JioSaavn API connection...');
    const response = await fetch(`${API_URL}/api/search/songs?query=test&limit=1`);
    if (!response.ok) {
      throw new Error(`JioSaavn API test failed: ${response.status}`);
    }
    console.log('JioSaavn API connection successful');
    return true;
  } catch (error) {
    console.error('JioSaavn API test error:', error);
    return false;
  }
}; 