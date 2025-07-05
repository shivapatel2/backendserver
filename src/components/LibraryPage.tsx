import { Heart, Clock, Plus, Download, ListMusic, Bookmark, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Track } from "@/pages/Index";
import { useMusicContext } from "@/contexts/MusicContext";
import { useState } from "react";

interface LibraryPageProps {
  onTrackSelect: (track: Track) => void;
}

export const LibraryPage = ({ onTrackSelect }: LibraryPageProps) => {
  const { likedSongs, playlists, removeFromLikedSongs, downloadTrack, addToPlaylist } = useMusicContext();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'liked' | 'saved' | 'playlists'>('liked');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (selectedTrack) {
      addToPlaylist(playlistId, selectedTrack);
      setIsAddToPlaylistOpen(false);
      setSelectedTrack(null);
    }
  };

  // Mock saved songs (in a real app, this would come from a database)
  const savedSongs = likedSongs.slice(0, 5); // Using first 5 liked songs as saved for demo

  return (
    <div className="h-full overflow-y-auto mobile-smooth-scroll">
      <div className="p-4 md:p-8">
        {/* Library Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Your Library</h1>
            <p className="text-muted-foreground">Your favorite songs and collections</p>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden mb-6">
          <div className="flex bg-card rounded-lg p-1">
            {[
              { id: 'liked', label: 'Liked', icon: Heart, count: likedSongs.length },
              { id: 'saved', label: 'Saved', icon: Bookmark, count: savedSongs.length },
              { id: 'playlists', label: 'Playlists', icon: ListMusic, count: playlists.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'liked' | 'saved' | 'playlists')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                    {tab.count > 99 ? '99+' : tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Quick Access Cards */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-800/20 to-pink-800/20 p-6 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Liked Songs</h3>
                <p className="text-red-200">{likedSongs.length} songs</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-800/20 to-indigo-800/20 p-6 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Saved Songs</h3>
                <p className="text-blue-200">{savedSongs.length} songs</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-800/20 to-teal-800/20 p-6 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <ListMusic className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Playlists</h3>
                <p className="text-green-200">{playlists.length} playlists</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="md:hidden">
          {activeTab === 'liked' && (
            <div className="animate-page-transition">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Liked Songs</h2>
                {likedSongs.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-muted-foreground text-muted-foreground hover:text-white"
                    onClick={() => likedSongs.forEach(track => downloadTrack(track))}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {likedSongs.length > 0 ? (
                <div className="space-y-2">
                  {likedSongs.map((track, index) => (
                    <div
                      key={track.id}
                      className="music-card flex items-center gap-3 p-3 rounded-lg group cursor-pointer mobile-ripple"
                      onClick={() => onTrackSelect(track)}
                    >
                      <span className="text-muted-foreground w-6 text-center text-sm">{index + 1}</span>
                      <img
                        src={track.image}
                        alt={track.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate text-sm">{track.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDuration(track.duration)}</span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromLikedSongs(track.id);
                        }}
                      >
                        <Heart className="w-4 h-4" fill="currentColor" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card/50 rounded-lg">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No liked songs yet</h3>
                  <p className="text-sm text-muted-foreground">Heart songs you love to see them here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="animate-page-transition">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Saved Songs</h2>
                {savedSongs.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-muted-foreground text-muted-foreground hover:text-white"
                    onClick={() => savedSongs.forEach(track => downloadTrack(track))}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {savedSongs.length > 0 ? (
                <div className="space-y-2">
                  {savedSongs.map((track, index) => (
                    <div
                      key={track.id}
                      className="music-card flex items-center gap-3 p-3 rounded-lg group cursor-pointer mobile-ripple"
                      onClick={() => onTrackSelect(track)}
                    >
                      <span className="text-muted-foreground w-6 text-center text-sm">{index + 1}</span>
                      <img
                        src={track.image}
                        alt={track.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate text-sm">{track.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDuration(track.duration)}</span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          // In a real app, this would remove from saved songs
                        }}
                      >
                        <Bookmark className="w-4 h-4" fill="currentColor" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card/50 rounded-lg">
                  <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No saved songs yet</h3>
                  <p className="text-sm text-muted-foreground">Save songs for offline listening</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="animate-page-transition">
              <h2 className="text-xl font-bold text-white mb-4">Playlists</h2>
              {playlists.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="bg-card p-3 rounded-lg cursor-pointer hover:bg-card/80 transition-all"
                    >
                      <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-2">
                        {playlist.tracks.length > 0 ? (
                          <img
                            src={playlist.tracks[0].image}
                            alt={playlist.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ListMusic className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <h4 className="font-medium text-white truncate text-sm">{playlist.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {playlist.tracks.length} songs
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card/50 rounded-lg">
                  <ListMusic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No playlists yet</h3>
                  <p className="text-muted-foreground">Create playlists to organize your music</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Content */}
        <div className="hidden md:block">
        {/* Liked Songs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Liked Songs</h2>
            {likedSongs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-muted-foreground text-muted-foreground hover:text-white"
                onClick={() => likedSongs.forEach(track => downloadTrack(track))}
              >
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            )}
          </div>

          {likedSongs.length > 0 ? (
            <div className="space-y-2">
              {likedSongs.map((track, index) => (
                <div
                  key={track.id}
                  className="music-card flex items-center gap-4 p-3 rounded-lg group cursor-pointer"
                  onClick={() => onTrackSelect(track)}
                >
                  <span className="text-muted-foreground w-8 text-center">{index + 1}</span>
                  <img
                    src={track.image}
                    alt={track.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{track.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrack(track);
                        setIsAddToPlaylistOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTrack(track);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromLikedSongs(track.id);
                      }}
                    >
                      <Heart className="w-4 h-4" fill="currentColor" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card/50 rounded-lg">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No liked songs yet</h3>
              <p className="text-muted-foreground">Heart songs you love to see them here</p>
            </div>
          )}
        </div>

          {/* Saved Songs */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Saved Songs</h2>
              {savedSongs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-muted-foreground text-muted-foreground hover:text-white"
                  onClick={() => savedSongs.forEach(track => downloadTrack(track))}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>

            {savedSongs.length > 0 ? (
              <div className="space-y-2">
                {savedSongs.map((track, index) => (
                  <div
                    key={track.id}
                    className="music-card flex items-center gap-4 p-3 rounded-lg group cursor-pointer"
                    onClick={() => onTrackSelect(track)}
                  >
                    <span className="text-muted-foreground w-8 text-center">{index + 1}</span>
                    <img
                      src={track.image}
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{track.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          // In a real app, this would remove from saved songs
                        }}
                      >
                        <Bookmark className="w-4 h-4" fill="currentColor" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card/50 rounded-lg">
                <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No saved songs yet</h3>
                <p className="text-muted-foreground">Save songs for offline listening</p>
              </div>
            )}
          </div>

        {/* Recent Playlists */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Recent Playlists</h2>
          {playlists.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.slice(0, 8).map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-card p-4 rounded-lg cursor-pointer hover:bg-card/80 transition-all"
                >
                  <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-3">
                    {playlist.tracks.length > 0 ? (
                      <img
                        src={playlist.tracks[0].image}
                        alt={playlist.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ListMusic className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <h4 className="font-medium text-white truncate">{playlist.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {playlist.tracks.length} songs
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card/50 rounded-lg">
              <ListMusic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
              <p className="text-muted-foreground">Create playlists to organize your music</p>
            </div>
          )}
          </div>
        </div>

        {/* Add to Playlist Dialog */}
        <Dialog open={isAddToPlaylistOpen} onOpenChange={setIsAddToPlaylistOpen}>
          <DialogContent className="bg-neutral-900 border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-white">Add to Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                      <ListMusic className="w-5 h-5 text-muted-foreground" />
                    </div>
                  <div>
                      <h4 className="font-medium text-white">{playlist.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {playlist.tracks.length} songs
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
