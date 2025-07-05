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
    
    // The data structure for videos is different in the new library version.
    const formatted = search.videos.map(video => ({
      title: video.title.text,
      videoId: video.id,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnail: video.thumbnails[0].url,
      duration: video.duration,
      channel: video.author.name
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