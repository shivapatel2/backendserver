// API Testing Utility for Spotify Music API
import { testAllAPIs, searchTracks, getFeaturedTracks } from '@/services/musicApi';

export const runAPITests = async () => {
  console.log('🔍 Testing Spotify Music API...');
  
  try {
    // Test Spotify API
    console.log('\n📡 Testing API Connection...');
    const apiResults = await testAllAPIs();
    
    console.log('API Test Results:');
    Object.entries(apiResults).forEach(([api, working]) => {
      const status = working ? '✅' : '❌';
      console.log(`  ${status} ${api.toUpperCase()}: ${working ? 'Connected' : 'Failed'}`);
    });
    
    // Test search functionality
    console.log('\n🔎 Testing Search Functionality...');
    const searchResults = await searchTracks('jazz', 5);
    console.log(`Search Results: ${searchResults.length} tracks found`);
    
    searchResults.forEach((track, index) => {
      console.log(`  ${index + 1}. ${track.title} - ${track.artist} (${track.source})`);
      console.log(`     URL: ${track.preview_url}`);
    });
    
    // Test featured tracks
    console.log('\n⭐ Testing Featured Tracks...');
    const featuredResults = await getFeaturedTracks();
    console.log(`Featured Tracks: ${featuredResults.length} tracks found`);
    
    featuredResults.slice(0, 3).forEach((track, index) => {
      console.log(`  ${index + 1}. ${track.title} - ${track.artist} (${track.source})`);
      console.log(`     URL: ${track.preview_url}`);
    });
    
    // Summary
    const workingAPIs = Object.entries(apiResults).filter(([_, working]) => working);
    console.log(`\n📊 Summary: ${workingAPIs.length}/${Object.keys(apiResults).length} APIs working`);
    
    if (workingAPIs.length > 0) {
      console.log('🎉 Spotify API is working!');
      console.log('🎵 You now have access to 30-second previews!');
      
      // Test if tracks are actually playable
      if (featuredResults.length > 0) {
        console.log('\n🎵 Testing track playback...');
        const testTrack = featuredResults[0];
        console.log(`Testing: ${testTrack.title} - ${testTrack.artist}`);
        console.log(`Audio URL: ${testTrack.preview_url}`);
        
        // Test if the audio URL is accessible
        try {
          const response = await fetch(testTrack.preview_url!, { method: 'HEAD' });
          if (response.ok) {
            console.log('✅ Audio URL is accessible!');
          } else {
            console.log('⚠️  Audio URL returned status:', response.status);
          }
        } catch (error) {
          console.log('⚠️  Could not test audio URL:', error);
        }
      }
      
      return true;
    } else {
      console.log('⚠️  Spotify API is not working. Check your internet connection.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    return false;
  }
};

// Function to test Spotify API
export const testIndividualAPI = async (apiName: string) => {
  console.log(`🔍 Testing ${apiName} API...`);
  
  try {
    if (apiName.toLowerCase() === 'spotify') {
      const { testSpotifyAPI } = await import('@/services/musicApi');
      const spotifyResult = await testSpotifyAPI();
      console.log(`Spotify API: ${spotifyResult ? '✅ Working' : '❌ Failed'}`);
      if (spotifyResult) {
        console.log('🎵 Access to 30-second previews!');
      }
      return spotifyResult;
    } else {
      console.log(`❌ Unknown API: ${apiName}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error testing ${apiName} API:`, error);
    return false;
  }
};

// Function to get API status for UI
export const getAPIStatus = async () => {
  const apiResults = await testAllAPIs();
  const workingAPIs = Object.entries(apiResults).filter(([_, working]) => working);
  
  return {
    working: workingAPIs.map(([api, _]) => api),
    total: Object.keys(apiResults).length,
    status: workingAPIs.length > 0 ? 'success' : 'error',
    message: workingAPIs.length > 0 
      ? 'Spotify Connected - 30s Previews Available' 
      : 'Spotify Connection Failed'
  };
};

// Quick test function for immediate feedback
export const quickTest = async () => {
  console.log('🚀 Quick Spotify Test...');
  
  const spotifyTest = await testIndividualAPI('spotify');
  
  if (spotifyTest) {
    console.log('✅ Spotify is working!');
    console.log('🎵 You have access to 30-second previews!');
    return true;
  } else {
    console.log('❌ Spotify is not working. Check your internet connection.');
    return false;
  }
};

// Function to test track loading specifically
export const testTrackLoading = async () => {
  console.log('🎵 Testing Track Loading...');
  
  try {
    const tracks = await getFeaturedTracks();
    console.log(`Found ${tracks.length} tracks`);
    
    if (tracks.length > 0) {
      console.log('Sample tracks:');
      tracks.slice(0, 3).forEach((track, index) => {
        console.log(`  ${index + 1}. ${track.title} - ${track.artist}`);
        console.log(`     Duration: ${track.duration}s`);
        console.log(`     URL: ${track.preview_url}`);
      });
      return true;
    } else {
      console.log('❌ No tracks found');
      return false;
    }
  } catch (error) {
    console.error('❌ Track loading failed:', error);
    return false;
  }
}; 