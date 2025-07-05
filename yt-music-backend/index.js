const express = require('express');
const cors = require('cors');
const play = require('play-dl');

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).send("Missing query");

  try {
    const searchResults = await play.search(query, {
      source: { youtube: 'video' },
      limit: 20
    });

    const formatted = searchResults.map(video => ({
      title: video.title,
      videoId: video.id,
      url: video.url,
      thumbnail: video.thumbnails?.[0]?.url || null,
      duration: {
        seconds: video.durationInSec,
        text: video.durationRaw
      },
      channel: video.channel?.name || 'Unknown Channel'
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error("Search error with play-dl:", err);
    res.status(500).send("Search failed");
  }
});

app.get('/api/audio/:videoId', async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) return res.status(400).send("Missing videoId");
  
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const stream = await play.stream(url);

    res.set({
      'Content-Type': stream.type,
      'Content-Length': stream.content_length
    });

    stream.stream.pipe(res);
  } catch (err) {
    console.error("Error streaming audio with play-dl:", err);
    res.status(500).send("Error streaming audio");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));