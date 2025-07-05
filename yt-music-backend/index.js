const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
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
    
    const info = await ytdl.getInfo(url);
    console.log('Got video info, formats available:', info.formats.length);
    
    // Find the best audio-only format with specific criteria
    let audioFormat = null;
    
    // First try to find a high quality audio-only format
    audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio',
      filter: 'audioonly' 
    });
    
    // If no audio-only format found, try to find any audio format
    if (!audioFormat) {
      console.log('No audio-only format found, looking for any audio format');
      const audioFormats = info.formats.filter(format => 
        format.hasAudio && !format.hasVideo
      );
      if (audioFormats.length > 0) {
        // Sort by audio quality (bitrate)
        audioFormats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
        audioFormat = audioFormats[0];
      }
    }
    
    // If still no audio format, try to find a format with both audio and video but prioritize audio
    if (!audioFormat) {
      console.log('No audio-only format found, looking for audio+video format');
      const audioVideoFormats = info.formats.filter(format => 
        format.hasAudio && format.hasVideo
      );
      if (audioVideoFormats.length > 0) {
        // Sort by audio quality first, then by overall quality
        audioVideoFormats.sort((a, b) => {
          const audioDiff = (b.audioBitrate || 0) - (a.audioBitrate || 0);
          if (audioDiff !== 0) return audioDiff;
          return (b.bitrate || 0) - (a.bitrate || 0);
        });
        audioFormat = audioVideoFormats[0];
      }
    }

    if (!audioFormat) {
      console.error('No suitable audio format found');
      return res.status(404).send('No suitable audio format found');
    }

    console.log('Selected audio format:', {
      quality: audioFormat.qualityLabel,
      audioBitrate: audioFormat.audioBitrate,
      hasAudio: audioFormat.hasAudio,
      hasVideo: audioFormat.hasVideo,
      url: audioFormat.url ? 'Available' : 'Not available'
    });

    // Send the direct stream URL to the frontend
    res.json({ 
      streamUrl: audioFormat.url,
      format: {
        quality: audioFormat.qualityLabel,
        audioBitrate: audioFormat.audioBitrate,
        hasAudio: audioFormat.hasAudio,
        hasVideo: audioFormat.hasVideo
      }
    });

  } catch (error) {
    console.error('ytdl.getInfo error:', error);
    res.status(500).send('Failed to get audio stream information');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));