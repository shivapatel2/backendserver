import { useState, useEffect } from "react";
import { Play, Heart, Download, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Track } from "@/pages/Index";
import { getFeaturedTracksEnhanced, testAllAPIs } from "@/services/musicApi";
import { useMusicContext } from "@/contexts/MusicContext";

interface MainContentProps {
  onTrackSelect: (track: Track) => void;
}

export const MainContent = ({ onTrackSelect }: MainContentProps) => {
  const [featuredTracks, setFeaturedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { isLiked, addToLikedSongs, removeFromLikedSongs, downloadTrack } = useMusicContext();

  useEffect(() => {
    const loadFeaturedTracks = async () => {
      try {
        console.log('Loading featured tracks...');
        
        // Test Free Music API
        const apiResults = await testAllAPIs();
        console.log('API test results:', apiResults);
        
        if (apiResults.freemusic) {
          setApiStatus('success');
        } else {
          setApiStatus('error');
        }
        
        const tracks = await getFeaturedTracksEnhanced();
        console.log('Loaded tracks:', tracks.length);
        
        if (tracks.length > 0) {
          setFeaturedTracks(tracks);
          console.log('Tracks set successfully');
        } else {
          console.log('No tracks returned, this should not happen with fallback');
          setApiStatus('error');
        }
      } catch (error) {
        console.error('Failed to load featured tracks:', error);
        setApiStatus('error');
        
        // Even if API fails, we should have demo tracks
        try {
          const tracks = await getFeaturedTracksEnhanced();
          if (tracks.length > 0) {
            setFeaturedTracks(tracks);
          }
        } catch (fallbackError) {
          console.error('Even fallback failed:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedTracks();
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getSourceIndicator = (track: Track) => {
    if (track.source === 'freemusic') {
      return (
        <span className="text-purple-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
          iTunes
        </span>
      );
    } else if (track.fullTrackUrl) {
      return (
        <span className="text-green-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
          Full Track
        </span>
      );
    } else if (track.preview_url) {
      return (
        <span className="text-yellow-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
          Preview
        </span>
      );
    }
    return null;
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Header */}
      <div className="p-8 pb-6 bg-gradient-to-br from-primary/10 via-purple-600/5 to-transparent">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <Zap className="text-primary w-12 h-12 animate-glow-pulse" fill="currentColor" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-1 text-gradient">
              {getGreeting()}
            </h1>
            <p className="text-muted-foreground text-lg">Ready to discover amazing music?</p>
          </div>
          {/* API Status Indicator */}
          <div className="flex items-center gap-2">
            {apiStatus === 'loading' && (
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Connecting...</span>
              </div>
            )}
            {apiStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            )}
            {apiStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-sm">API Connection Failed - Using Demo Tracks</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="px-8 pb-8">
          <div className="text-center py-12">
            <div className="animate-spin-slow rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading amazing tracks<span className="loading-dots"></span></p>
          </div>
        </div>
      )}

      {/* Featured Section */}
      {!isLoading && featuredTracks.length > 0 && (
        <div className="px-8 pb-8">
          {/* Speedify Music Header */}
          <h2 className="text-4xl font-extrabold text-primary mb-2 tracking-tight drop-shadow-lg">Speedify Music</h2>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white text-glow">Featured for You</h2>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black">
              <Plus className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          {/* Responsive grid for music cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {featuredTracks.map((track, index) => (
              <div
                key={track.id}
                className="music-card bg-card p-4 rounded-lg group relative animate-fade-in glass-effect"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => onTrackSelect(track)}
              >
                <div className="relative mb-4">
                  <img
                    src={track.image}
                    alt={track.title}
                    className="w-full aspect-square object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback image if the original fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      className="play-button w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-xl btn-glow"
                    >
                      <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                    </Button>
                  </div>
                  {/* Action buttons overlay */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-8 h-8 rounded-full glass-effect ${isLiked(track.id) ? 'text-red-400' : 'text-white'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isLiked(track.id)) {
                          removeFromLikedSongs(track.id);
                        } else {
                          addToLikedSongs(track);
                        }
                      }}
                    >
                      <Heart className="w-4 h-4" fill={isLiked(track.id) ? 'currentColor' : 'none'} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 rounded-full glass-effect text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTrack(track);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold text-white truncate mb-1 group-hover:text-primary transition-colors">
                  {track.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate mb-1">{track.artist}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{formatDuration(track.duration)}</span>
                  {getSourceIndicator(track)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Tracks State */}
      {!isLoading && featuredTracks.length === 0 && (
        <div className="px-8 pb-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No tracks available</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load tracks from iTunes API. Please check your internet connection.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-primary hover:bg-primary/90"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Recently Played */}
      {!isLoading && featuredTracks.length > 0 && (
        <div className="px-8 pb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-glow">Recently Played</h2>
          <div className="space-y-2">
            {featuredTracks.slice(0, 6).map((track, index) => (
              <div
                key={`recent-${track.id}`}
                className="music-card flex items-center gap-4 p-4 rounded-lg group glass-effect animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => onTrackSelect(track)}
              >
                <div className="relative">
                  <img
                    src={track.image}
                    alt={track.title}
                    className="w-14 h-14 rounded object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" fill="currentColor" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate group-hover:text-primary transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(track.duration)}
                  </span>
                  {getSourceIndicator(track)}
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${isLiked(track.id) ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLiked(track.id)) {
                        removeFromLikedSongs(track.id);
                      } else {
                        addToLikedSongs(track);
                      }
                    }}
                  >
                    <Heart className="w-4 h-4" fill={isLiked(track.id) ? 'currentColor' : 'none'} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadTrack(track);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
