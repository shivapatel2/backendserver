const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

const app = express();
app.use(cors());

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
    const info = await ytdl.getInfo(url);
    
    // Find the best audio-only format
    const audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio',
      filter: 'audioonly' 
    });

    if (!audioFormat) {
      return res.status(404).send('No suitable audio format found');
    }

    // Send the direct stream URL to the frontend
    res.json({ streamUrl: audioFormat.url });

  } catch (error) {
    console.error('ytdl.getInfo error:', error);
    res.status(500).send('Failed to get audio stream information');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));