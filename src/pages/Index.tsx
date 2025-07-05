import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";
import { MusicPlayer } from "@/components/MusicPlayer";
import { SearchPage } from "@/components/SearchPage";
import { LibraryPage } from "@/components/LibraryPage";
import { PlaylistsPage } from "@/components/PlaylistsPage";
import { SettingsPage } from "@/components/SettingsPage";
import { BottomNav } from "@/components/BottomNav";
import { MusicProvider } from "@/contexts/MusicContext";
import { MusicTrack } from "@/services/musicApi";

// Use the enhanced MusicTrack interface
export type Track = MusicTrack;

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'library' | 'playlists' | 'settings'>('home');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTrackSelect = (track: Track) => {
    console.log('Track selected:', track.title);
    
    // If selecting the same track, toggle play/pause
    if (currentTrack && currentTrack.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      // New track selected
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleViewChange = (view: 'home' | 'search' | 'library' | 'playlists' | 'settings') => {
    if (view !== currentView) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentView(view);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'search':
        return <SearchPage onTrackSelect={handleTrackSelect} />;
      case 'library':
        return <LibraryPage onTrackSelect={handleTrackSelect} />;
      case 'playlists':
        return <PlaylistsPage onTrackSelect={handleTrackSelect} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <MainContent onTrackSelect={handleTrackSelect} />;
    }
  };

  return (
    <MusicProvider>
      <div className="h-screen flex flex-col bg-black">
        {/* Desktop Layout */}
        <div className="hidden md:flex flex-1 gap-2 p-2">
          {/* Desktop Sidebar */}
            <Sidebar currentView={currentView} onViewChange={setCurrentView} />
          
          {/* Main Content */}
          <main className={`flex-1 bg-gradient-to-b from-neutral-900 to-black rounded-lg overflow-hidden transition-all duration-300 ${
            isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}>
            <div className={`h-full transition-all duration-300 ${
              isTransitioning ? 'transform translate-x-4' : 'transform translate-x-0'
            }`}>
            {renderContent()}
            </div>
          </main>
        </div>
        
        {/* Mobile Layout */}
        <div className="md:hidden mobile-layout">
          {/* Main Content Area - Scrollable */}
          <div className="mobile-content">
            <main className={`min-h-full transition-all duration-300 ${
              isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}>
              <div className={`transition-all duration-300 ${
                isTransitioning ? 'transform translate-x-4' : 'transform translate-x-0'
              }`}>
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
        
        {/* Music Player - Fixed at bottom */}
        <div className="mobile-bottom">
        <MusicPlayer 
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
        />
        </div>
        
        {/* Mobile Bottom Navigation - Fixed at bottom */}
        <div className="md:hidden mobile-bottom">
          <BottomNav currentView={currentView} onViewChange={handleViewChange} />
        </div>
      </div>
    </MusicProvider>
  );
};

export default Index;
