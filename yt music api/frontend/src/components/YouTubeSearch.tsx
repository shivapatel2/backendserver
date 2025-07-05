import React, { useState } from 'react';
import axios from 'axios';

interface Video {
  title: string;
  videoId: string;
  url: string;
  thumbnail: string;
  duration: string;
  channel: string;
}

const BACKEND_URL = 'http://localhost:3001/api'; // Replace with your deployed backend URL

const YouTubeSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Video[]>([]);

  const search = async () => {
    const res = await axios.get(`${BACKEND_URL}/search?q=${encodeURIComponent(query)}`);
    setResults(res.data);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <input
        className="border p-2 w-full"
        placeholder="Search songs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={search} className="bg-blue-500 text-white px-4 py-2 mt-2">Search</button>

      <div className="mt-4 space-y-4">
        {results.map(video => (
          <div key={video.videoId} className="border p-3 rounded">
            <img src={video.thumbnail} className="w-full max-w-sm" />
            <h2 className="text-lg font-semibold">{video.title}</h2>
            <p>{video.channel} • {video.duration}</p>
            <audio controls src={`${BACKEND_URL}/audio/${video.videoId}`} className="mt-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubeSearch;