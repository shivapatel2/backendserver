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
    
    // Configure ytdl with better options to avoid blocks
    const options = {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      }
    };
    
    const info = await ytdl.getInfo(url, options);
    console.log('Got video info, formats available:', info.formats.length);
    
    // Log all available formats for debugging
    console.log('Available formats:');
    info.formats.forEach((format, index) => {
      console.log(`${index}: ${format.qualityLabel} - Audio: ${format.hasAudio} Video: ${format.hasVideo} - Bitrate: ${format.bitrate} - AudioBitrate: ${format.audioBitrate}`);
    });
    
    // Find the best audio-only format with specific criteria
    let audioFormat = null;
    
    // First try to find a high quality audio-only format
    try {
      audioFormat = ytdl.chooseFormat(info.formats, { 
        quality: 'highestaudio',
        filter: 'audioonly' 
      });
      console.log('Found audio-only format:', audioFormat?.qualityLabel);
    } catch (error) {
      console.log('ytdl.chooseFormat failed, trying manual selection');
    }
    
    // If no audio-only format found, try to find any audio format
    if (!audioFormat) {
      console.log('No audio-only format found, looking for any audio format');
      const audioFormats = info.formats.filter(format => 
        format.hasAudio && !format.hasVideo && format.url
      );
      if (audioFormats.length > 0) {
        // Sort by audio quality (bitrate)
        audioFormats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
        audioFormat = audioFormats[0];
        console.log('Selected audio format:', audioFormat.qualityLabel);
      }
    }
    
    // If still no audio format, try to find a format with both audio and video but prioritize audio
    if (!audioFormat) {
      console.log('No audio-only format found, looking for audio+video format');
      const audioVideoFormats = info.formats.filter(format => 
        format.hasAudio && format.hasVideo && format.url
      );
      if (audioVideoFormats.length > 0) {
        // Sort by audio quality first, then by overall quality
        audioVideoFormats.sort((a, b) => {
          const audioDiff = (b.audioBitrate || 0) - (a.audioBitrate || 0);
          if (audioDiff !== 0) return audioDiff;
          return (b.bitrate || 0) - (a.bitrate || 0);
        });
        audioFormat = audioVideoFormats[0];
        console.log('Selected audio+video format:', audioFormat.qualityLabel);
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
    console.error('ytdl.getInfo error:', error.message);
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