# 🎵 Free Music Player

A modern, responsive music player that streams full tracks from JioSaavn's music catalog. **No API keys required, no setup needed!**

## ✨ Features

- **Completely Free**: No API keys, no registration, no setup required
- **Full Track Streaming**: Access to thousands of complete songs from JioSaavn
- **International Music Catalog**: Access to music from around the world, especially Indian music
- **Modern UI**: Beautiful, responsive design with dark theme
- **Cross-Platform**: Works on desktop and mobile devices
- **Real-time Search**: Instant search across JioSaavn's music collection
- **Playlist Management**: Create and manage your music playlists
- **Like System**: Save your favorite tracks
- **Download Support**: Download tracks when available

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd soundscape-player-hub-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8083/` (or the port shown in your terminal)

**That's it! No API keys, no configuration needed!** 🎉

## 🎯 How It Works

The app uses the **JioSaavn API**, which provides:

- **Thousands of free tracks** from JioSaavn's music catalog
- **Full-length songs** with complete audio files
- **High-quality MP3 files** for streaming
- **International music** with focus on Indian music and Bollywood
- **No rate limits** or API restrictions
- **Completely free** with no authentication required

## 🎨 UI Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes with beautiful gradients
- **Smooth Animations**: Fluid transitions and hover effects
- **Source Indicators**: Shows "JioSaavn" for API tracks
- **Loading States**: Beautiful loading animations
- **Error Handling**: Graceful error messages and fallbacks

## 📱 Mobile Support

- **Touch Optimized**: Large touch targets and swipe gestures
- **Bottom Navigation**: Easy thumb navigation
- **Responsive Player**: Adapts to screen size
- **Offline Capable**: PWA features for better mobile experience

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
├── contexts/           # React contexts
├── services/           # API services
├── config/             # Configuration files
├── pages/              # Page components
└── utils/              # Utility functions
```

### Key Files
- `src/services/musicApi.ts` - JioSaavn API integration
- `src/components/MusicPlayer.tsx` - Audio player
- `src/components/MainContent.tsx` - Home page
- `src/components/SearchPage.tsx` - Search functionality

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues

1. **No music playing**
   - Check browser console for errors
   - Verify your internet connection
   - Try refreshing the page

2. **Slow loading**
   - JioSaavn API may be slow during peak hours
   - Check your internet connection
   - Try searching for different terms

3. **CORS errors**
   - The app handles CORS gracefully
   - If issues persist, try a different browser

### Debug Mode
Enable debug logging by opening browser console and running:
```javascript
quickTest()  // Quick API test
runAPITests()  // Full API test
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- **JioSaavn** for providing access to their music catalog
- **Independent Artists** who share their music freely
- **Open Source Community** for making this possible

---

**Note**: This app streams music from JioSaavn's music catalog. All music is legally available for streaming under JioSaavn's terms of service.
