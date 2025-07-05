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
        
        // If the track is from YouTube, fetch the direct stream URL
        if (currentTrack.source === 'youtube' && currentTrack.id) {
          try {
            const videoId = currentTrack.id.replace('youtube_', '');
            const response = await fetch(`https://yt-music-backend-6yj1.onrender.com/api/audio/${videoId}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch stream URL: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.streamUrl) {
              audioUrl = data.streamUrl;
            } else {
              throw new Error('Stream URL not found in response');
            }
          } catch (error) {
            console.error('Error fetching direct stream URL:', error);
            // Fallback to JioSaavn or another source could be implemented here
            setIsLoading(false);
            return;
          }
        }
        
        if (audioRef.current && audioUrl) {
          audioRef.current.src = audioUrl;
          audioRef.current.load();
        } else {
          console.error('No audio URL available for track:', currentTrack.title);
          setIsLoading(false);
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
          
          {/* Preview indicator and full duration */}
          {currentTrack && (
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
