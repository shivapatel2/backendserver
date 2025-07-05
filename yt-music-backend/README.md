# YouTube Music Backend

A Node.js Express server for streaming YouTube music tracks.

## Features

- YouTube video search using `ytsr`
- Audio streaming using `play-dl`
- CORS enabled for frontend integration
- Health check endpoint

## API Endpoints

- `GET /health` - Health check
- `GET /api/search?q=<query>` - Search YouTube videos
- `GET /api/audio/:videoId` - Get audio stream URL for a video

## Deployment on Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Set environment variables in Vercel dashboard if needed.

## Local Development

```bash
npm install
npm start
```

The server will run on `http://localhost:3001` 