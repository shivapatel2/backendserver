// API Configuration for Multi-API Music Service
// Replace the placeholder values with your actual API keys

export const API_CONFIG = {
  JAMENDO: {
    BASE_URL: 'https://api.jamendo.com/v3.0',
    CLIENT_ID: 'YOUR_JAMENDO_CLIENT_ID', // Get from: https://developer.jamendo.com/
    ENABLED: true
  },
  DEEZER: {
    BASE_URL: 'https://api.deezer.com',
    ENABLED: true // No API key required - works out of the box
  },
  FMA: {
    BASE_URL: 'https://freemusicarchive.org/api',
    ENABLED: true // No API key required - works out of the box
  },
  LASTFM: {
    BASE_URL: 'https://ws.audioscrobbler.com/2.0',
    API_KEY: 'YOUR_LASTFM_API_KEY', // Get from: https://www.last.fm/api
    ENABLED: true
  },
  AUDD: {
    BASE_URL: 'https://api.audd.io',
    API_KEY: 'YOUR_AUDD_API_KEY', // Get from: https://audd.io/
    ENABLED: true
  }
};

// Demo Configuration (uncomment to use)
// This configuration enables APIs that work without keys
/*
export const API_CONFIG = {
  JAMENDO: {
    BASE_URL: 'https://api.jamendo.com/v3.0',
    CLIENT_ID: 'YOUR_JAMENDO_CLIENT_ID',
    ENABLED: false // Disabled - requires API key
  },
  DEEZER: {
    BASE_URL: 'https://api.deezer.com',
    ENABLED: true // ✅ Works without API key
  },
  FMA: {
    BASE_URL: 'https://freemusicarchive.org/api',
    ENABLED: true // ✅ Works without API key
  },
  LASTFM: {
    BASE_URL: 'https://ws.audioscrobbler.com/2.0',
    API_KEY: 'YOUR_LASTFM_API_KEY',
    ENABLED: false // Disabled - requires API key
  },
  AUDD: {
    BASE_URL: 'https://api.audd.io',
    API_KEY: 'YOUR_AUDD_API_KEY',
    ENABLED: false // Disabled - requires API key
  }
};
*/

// Helper function to get API status
export const getAPIStatusInfo = () => {
  const status = {
    jamendo: API_CONFIG.JAMENDO.ENABLED && API_CONFIG.JAMENDO.CLIENT_ID !== 'YOUR_JAMENDO_CLIENT_ID',
    deezer: API_CONFIG.DEEZER.ENABLED,
    fma: API_CONFIG.FMA.ENABLED,
    lastfm: API_CONFIG.LASTFM.ENABLED && API_CONFIG.LASTFM.API_KEY !== 'YOUR_LASTFM_API_KEY',
    audd: API_CONFIG.AUDD.ENABLED && API_CONFIG.AUDD.API_KEY !== 'YOUR_AUDD_API_KEY'
  };

  const workingAPIs = Object.entries(status).filter(([_, working]) => working);
  const totalAPIs = Object.keys(status).length;

  return {
    status,
    working: workingAPIs.map(([api, _]) => api),
    total: totalAPIs,
    message: workingAPIs.length > 0 
      ? `${workingAPIs.map(([api, _]) => api.toUpperCase()).join(', ')} Connected` 
      : 'No APIs Connected - Add API keys to enable more features'
  };
};

// Instructions for getting API keys:
// 
// 1. Jamendo API (Free full tracks):
//    - Visit: https://developer.jamendo.com/
//    - Sign up for a free account
//    - Get your Client ID
//    - Replace 'YOUR_JAMENDO_CLIENT_ID' with your actual Client ID
//
// 2. Last.fm API (Metadata only):
//    - Visit: https://www.last.fm/api
//    - Sign up for a free account
//    - Create an application to get your API key
//    - Replace 'YOUR_LASTFM_API_KEY' with your actual API key
//
// 3. AudD API (Lyrics and metadata):
//    - Visit: https://audd.io/
//    - Sign up for a free account
//    - Get your API key
//    - Replace 'YOUR_AUDD_API_KEY' with your actual API key
//
// 4. Deezer API (30-second previews):
//    - No API key required - works out of the box
//
// 5. Free Music Archive API (Full tracks):
//    - No API key required - works out of the box
//
// The app will automatically use the best available API for each request.
// APIs are tried in order: Jamendo (full tracks) > FMA (full tracks) > Deezer (previews) > Last.fm (metadata) 