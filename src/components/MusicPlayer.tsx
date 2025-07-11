import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Track } from "@/pages/Index";
import { useMusicContext } from "@/contexts/MusicContext";

interface MusicPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export const MusicPlayer = ({ currentTrack, isPlaying, onPlayPause }: MusicPlayerProps) => {
  const [progress, setProgress] = useState([0]);
  const [volume, setVolume] = useState([75]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isLiked, addToLikedSongs, removeFromLikedSongs } = useMusicContext();

  const isTrackLiked = currentTrack ? isLiked(currentTrack.id) : false;

  // Handle track change
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      console.log('Loading new track:', currentTrack.title);
      setIsLoading(true);
      setIsAudioReady(false);
      setProgress([0]);
      setCurrentTime(0);
      setDuration(0);
      
      audioRef.current.pause();
      audioRef.current.src = ''; // Clear the previous source immediately

      const fetchAndPlayAudio = async () => {
        let audioUrl = currentTrack.fullTrackUrl || currentTrack.preview_url;
        
        // Clear any previous errors when loading a new track
        setStreamError(null);
        
        // If the track is from YouTube, fetch the direct stream URL
        if (currentTrack.source === 'youtube' && currentTrack.id) {
          try {
            const videoId = currentTrack.id.replace('youtube_', '');
            console.log('Fetching YouTube audio for video ID:', videoId);
            
            const response = await fetch(`https://backendserver-feuj.vercel.app/api/audio/${videoId}`);
            console.log('Backend response status:', response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Backend error response:', errorText);
              
              // Provide user-friendly error messages based on the backend response
              let errorMessage = 'Failed to load the track. Please try again later or use an alternative source.';
              if (errorText.includes('Video is unavailable')) {
                errorMessage = 'This video is unavailable or private. Please try a different track.';
              } else if (errorText.includes('age-restricted')) {
                errorMessage = 'This video is age-restricted and cannot be played. Please try a different track.';
              } else if (errorText.includes('region')) {
                errorMessage = 'This video is not available in your region. Please try a different track.';
              } else if (errorText.includes('No suitable audio format')) {
                errorMessage = 'No suitable audio format found for this video. Please try a different track.';
              }
              
              throw new Error(errorMessage);
            }
            
            const data = await response.json();
            console.log('Backend response data:', data);
            
            if (data.streamUrl) {
              audioUrl = data.streamUrl;
              console.log('Using YouTube stream URL:', audioUrl);
            } else {
              console.error('No stream URL in response:', data);
              throw new Error('Stream URL not found in response');
            }
          } catch (error) {
            console.error('Error fetching direct stream URL:', error);
            
            // Try to find the same song on JioSaavn as a fallback
            try {
              console.log('YouTube failed, trying to find same song on JioSaavn...');
              
              // Import the JioSaavn API function
              const { searchTracksJioSaavn } = await import('@/services/jiosaavnApi');
              
              // Try multiple search strategies to find a match
              let jioSaavnTracks = [];
              let searchQuery = '';
              
              // Strategy 1: Try with title + artist
              searchQuery = `${currentTrack.title} ${currentTrack.artist}`;
              console.log('Trying JioSaavn search with:', searchQuery);
              jioSaavnTracks = await searchTracksJioSaavn(searchQuery, 10);
              
              // Strategy 2: If no results, try with just the title
              if (jioSaavnTracks.length === 0) {
                searchQuery = currentTrack.title;
                console.log('No results, trying with just title:', searchQuery);
                jioSaavnTracks = await searchTracksJioSaavn(searchQuery, 10);
              }
              
              // Strategy 3: If still no results, try with just the artist
              if (jioSaavnTracks.length === 0) {
                searchQuery = currentTrack.artist;
                console.log('No results, trying with just artist:', searchQuery);
                jioSaavnTracks = await searchTracksJioSaavn(searchQuery, 10);
              }
              
              console.log('JioSaavn search results:', jioSaavnTracks.length, 'tracks found');
              
              if (jioSaavnTracks.length > 0) {
                // Find the first track with a valid audio URL
                const fallbackTrack = jioSaavnTracks.find(track => 
                  track.fullTrackUrl || track.preview_url
                );
                
                if (fallbackTrack) {
                  console.log('Found fallback track on JioSaavn:', fallbackTrack.title);
                  console.log('Audio URL:', fallbackTrack.fullTrackUrl || fallbackTrack.preview_url);
                  
                  // Use the JioSaavn track's audio URL
                  audioUrl = fallbackTrack.fullTrackUrl || fallbackTrack.preview_url;
                  setStreamError(`YouTube unavailable. Playing from JioSaavn: ${fallbackTrack.title}`);
                } else {
                  console.log('No tracks with valid audio URLs found');
                  throw new Error('No tracks with valid audio URLs found');
                }
              } else {
                console.log('No matching tracks found on JioSaavn');
                throw new Error('No matching tracks found on JioSaavn');
              }
            } catch (fallbackError) {
              console.error('Fallback search failed:', fallbackError);
              
              // Try iTunes as a second fallback
              try {
                console.log('JioSaavn failed, trying iTunes...');
                const { searchTracksITunes } = await import('@/services/musicApi');
                const searchQuery = `${currentTrack.title} ${currentTrack.artist}`;
                const itunesTracks = await searchTracksITunes(searchQuery, 5);
                
                if (itunesTracks.length > 0) {
                  const itunesTrack = itunesTracks[0];
                  console.log('Found fallback track on iTunes:', itunesTrack.title);
                  audioUrl = itunesTrack.preview_url;
                  setStreamError(`YouTube unavailable. Playing from iTunes: ${itunesTrack.title}`);
                } else {
                  throw new Error('No iTunes tracks found');
                }
              } catch (itunesError) {
                console.error('iTunes fallback also failed:', itunesError);
                setStreamError(error instanceof Error ? error.message : 'Failed to load the track. Please try again later or use an alternative source.');
                setIsLoading(false);
                return;
              }
            }
          }
        }
        
        if (audioRef.current && audioUrl) {
          console.log('Setting audio source:', audioUrl);
          audioRef.current.src = audioUrl;
          audioRef.current.load();
        } else {
          console.error('No audio URL available for track:', currentTrack.title);
          setIsLoading(false);
          setStreamError('No audio URL available for the track. Please try again later or use an alternative source.');
        }
      };

      fetchAndPlayAudio();
    }
  }, [currentTrack]);

  // Handle play/pause after audio is ready
  useEffect(() => {
    if (audioRef.current && isAudioReady) {
      if (isPlaying) {
        console.log('Playing audio');
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
          // Note: We can't directly call setIsPlaying here as it's not available
          // The parent component should handle this through onPlayPause
        });
      } else {
        console.log('Pausing audio');
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isAudioReady]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  // Audio event handlers
  const handleCanPlay = () => {
    console.log('Audio can play');
    setIsLoading(false);
    setIsAudioReady(true);
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      if (audioDuration && !isNaN(audioDuration) && isFinite(audioDuration)) {
        // Use the actual audio duration (preview duration)
        setDuration(audioDuration);
        console.log('Audio duration set to:', audioDuration);
      } else {
        // For preview URLs, use the track's preview duration
        const previewDuration = currentTrack?.previewDuration || 30;
        setDuration(previewDuration);
        console.log('Using preview duration:', previewDuration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      if (audioDuration && !isNaN(audioDuration) && isFinite(audioDuration)) {
        setDuration(audioDuration);
        console.log('Metadata loaded, duration:', audioDuration);
      } else {
        // For preview URLs, use the track's preview duration
        const previewDuration = currentTrack?.previewDuration || 30;
        setDuration(previewDuration);
        console.log('Using preview duration:', previewDuration);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      setCurrentTime(current);
      if (duration > 0) {
        setProgress([(current / duration) * 100]);
      }
    }
  };

  const handleEnded = () => {
    console.log('Track ended');
    if (repeatMode === 'one') {
      // Repeat current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      // Stop playing
      onPlayPause();
      setProgress([0]);
      setCurrentTime(0);
    }
  };

  const handleError = (error: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error('Audio error:', error);
    setIsAudioReady(false);
    setIsLoading(false);
    setStreamError('An error occurred while loading the track. Please try again later or use an alternative source.');
  };

  // Handle progress bar change
  const handleProgressChange = (value: number[]) => {
    if (audioRef.current && duration > 0 && isAudioReady) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(value);
      setCurrentTime(newTime);
    }
  };

  const handleLikeToggle = () => {
    if (currentTrack) {
      if (isTrackLiked) {
        removeFromLikedSongs(currentTrack.id);
      } else {
        addToLikedSongs(currentTrack);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSourceIndicator = (track: Track) => {
    if (track.source === 'freemusic') {
      return (
        <span className="text-purple-400 flex items-center gap-1">
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
          iTunes
        </span>
      );
    } else if (track.fullTrackUrl) {
      return (
        <span className="text-green-400 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Full Track
        </span>
      );
    } else if (track.preview_url) {
      return (
        <span className="text-yellow-400 flex items-center gap-1">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
          Preview
        </span>
      );
    }
    return null;
  };

  if (!currentTrack) {
    return (
      <div className="h-20 bg-gradient-to-r from-neutral-900 to-black border-t border-neutral-800" />
    );
  }

  return (
    <div className="h-20 bg-gradient-to-r from-neutral-900 to-black border-t border-neutral-800 px-4 flex items-center animate-slide-up">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onCanPlay={handleCanPlay}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      />

      {/* Track Info - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-3 w-1/4 min-w-0">
        <img
          src={currentTrack.image}
          alt={currentTrack.title}
          className="w-14 h-14 rounded object-cover"
        />
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-white truncate">{currentTrack.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={`player-control ${isTrackLiked ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={handleLikeToggle}
        >
          <Heart className="w-4 h-4" fill={isTrackLiked ? 'currentColor' : 'none'} />
        </Button>
      </div>

      {/* Mobile Track Info */}
      <div className="md:hidden flex items-center gap-2 w-1/3 min-w-0">
        <img
          src={currentTrack.image}
          alt={currentTrack.title}
          className="w-10 h-10 rounded object-cover"
        />
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-white truncate text-sm">{currentTrack.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl mx-4 md:mx-8">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`player-control hidden md:flex ${isShuffled ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setIsShuffled(!isShuffled)}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="player-control text-white">
            <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
          </Button>

          <Button
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all disabled:opacity-50"
            onClick={onPlayPause}
            disabled={!isAudioReady || isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
            ) : (
              <Play className="w-4 h-4 md:w-5 md:h-5 ml-0.5" fill="currentColor" />
            )}
          </Button>

          <Button variant="ghost" size="sm" className="player-control text-white">
            <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`player-control hidden md:flex ${repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex flex-col gap-1">
          <div className="w-full flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-xs">{formatTime(currentTime)}</span>
            <Slider
              value={progress}
              onValueChange={handleProgressChange}
              max={100}
              step={1}
              className="flex-1 h-1"
              disabled={!isAudioReady}
            />
            <span className="text-xs">{formatTime(duration)}</span>
          </div>
          
          {/* Error message display */}
          {streamError && (
            <div className="text-xs text-red-400 text-center px-2 py-1 bg-red-900/20 rounded">
              {streamError}
            </div>
          )}
          
          {/* Preview indicator and full duration */}
          {currentTrack && !streamError && (
            <div className="flex items-center justify-between text-xs">
              {getSourceIndicator(currentTrack)}
              {currentTrack.duration > duration && (
                <span className="text-muted-foreground">
                  Full track: {formatTime(currentTrack.duration)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Volume Control - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 w-1/4 justify-end">
        <Button variant="ghost" size="sm" className="player-control text-muted-foreground">
          <Volume2 className="w-4 h-4" />
        </Button>
        <Slider
          value={volume}
          onValueChange={setVolume}
          max={100}
          step={1}
          className="w-24 h-1"
        />
      </div>

      {/* Mobile Like Button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          className={`player-control ${isTrackLiked ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={handleLikeToggle}
        >
          <Heart className="w-4 h-4" fill={isTrackLiked ? 'currentColor' : 'none'} />
        </Button>
      </div>
    </div>
  );
};
