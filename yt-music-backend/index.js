const express = require('express');
const cors = require('cors');
const { play } = require('play-dl');
const ytsr = require('ytsr');

const app = express();
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper function to convert duration string (e.g., "1:23") to seconds
const durationToSeconds = (duration) => {
  if (!duration) return 0;
  const parts = duration.split(':').map(Number);
  let seconds = 0;
  if (parts.length === 3) { // HH:MM:SS
    seconds += parts[0] * 3600;
    seconds += parts[1] * 60;
    seconds += parts[2];
  } else if (parts.length === 2) { // MM:SS
    seconds += parts[0] * 60;
    seconds += parts[1];
  } else if (parts.length === 1) { // SS
    seconds += parts[0];
  }
  return seconds;
};

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).send("Missing query");

  try {
    console.log('Searching for:', query);
    const searchResults = await ytsr(query, { limit: 20 });
    const videos = searchResults.items.filter(item => item.type === 'video');

    const formatted = videos.map(video => ({
      title: video.title,
      videoId: video.id,
      url: video.url,
      thumbnail: video.bestThumbnail.url,
      duration: {
        seconds: durationToSeconds(video.duration),
        text: video.duration || '0:00'
      },
      channel: video.author?.name || 'Unknown Channel'
    }));
    
    console.log(`Found ${formatted.length} videos for query: ${query}`);
    res.json(formatted);
  } catch (err) {
    console.error("Search error with ytsr:", err);
    res.status(500).send("Search failed");
  }
});

app.get('/api/audio/:videoId', async (req, res) => {
  const videoId = req.params.videoId;
  if (!videoId) return res.status(400).send("Missing videoId");

  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log('Fetching info for URL:', url);
    
    // Use play-dl to get video info and stream URL
    const videoInfo = await play.video_info(url);
    console.log('Got video info with play-dl');
    
    if (!videoInfo) {
      console.error('No video info found');
      return res.status(404).send('Video not found');
    }
    
    // Get the best audio stream
    const stream = await play.stream(url);
    console.log('Got stream info:', {
      type: stream.type,
      quality: stream.quality,
      hasAudio: stream.hasAudio,
      hasVideo: stream.hasVideo
    });
    
    if (!stream || !stream.url) {
      console.error('No stream URL available');
      return res.status(404).send('No suitable audio stream found');
    }

    console.log('Selected stream:', {
      type: stream.type,
      quality: stream.quality,
      hasAudio: stream.hasAudio,
      hasVideo: stream.hasVideo,
      url: stream.url ? 'Available' : 'Not available'
    });

    // Send the direct stream URL to the frontend
    res.json({ 
      streamUrl: stream.url,
      format: {
        type: stream.type,
        quality: stream.quality,
        hasAudio: stream.hasAudio,
        hasVideo: stream.hasVideo
      }
    });

  } catch (error) {
    console.error('play-dl error:', error.message);
    console.error('Full error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('Video unavailable')) {
      res.status(404).send('Video is unavailable or private');
    } else if (error.message.includes('Sign in')) {
      res.status(403).send('Video requires sign in');
    } else if (error.message.includes('age-restricted')) {
      res.status(403).send('Video is age-restricted');
    } else if (error.message.includes('region')) {
      res.status(403).send('Video is not available in this region');
    } else {
      res.status(500).send('Failed to get audio stream information');
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));