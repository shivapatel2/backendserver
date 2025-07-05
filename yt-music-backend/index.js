const express = require('express');
const cors = require('cors');
const { Innertube } = require('youtubei.js');
const ytdl = require('ytdl-core');

const app = express();
app.use(cors());

let yt;
(async () => {
  yt = await Innertube.create();
  console.log("YouTube API ready");
})();

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).send("Missing query");

  try {
    const search = await yt.search(query, { type: 'video' });
    
    // The data structure can vary. This is a more defensive approach.
    const formatted = search.videos
      .filter(video => video.id && video.title) // Ensure the video has a title and ID
      .map(video => ({
        title: video.title?.text || video.title, // Handle cases where title is an object or a string
        videoId: video.id,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        thumbnail: video.thumbnails?.[0]?.url || null, // Safely access thumbnail, provide null if missing
        duration: video.duration, // This might be null for live streams, which is acceptable
        channel: video.author?.name || 'Unknown Channel' // Safely access author name
      }));
    
    res.json(formatted);
  } catch (err) {
    console.error("Search error", err);
    res.status(500).send("Search failed");
  }
});

app.get('/api/audio/:videoId', (req, res) => {
  const url = `https://www.youtube.com/watch?v=${req.params.videoId}`;
  try {
    res.set({ 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes' });
    ytdl(url, { filter: 'audioonly' })
      .pipe(res)
      .on('error', (err) => {
        console.error("Error streaming audio:", err);
        res.status(500).send("Error streaming audio");
      });
  } catch (err) {
    console.error("Error setting up stream:", err);
    res.status(500).send("Failed to start audio stream");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)); 