import { Music, Search, Library, Plus, Heart, ListMusic, Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusicContext } from "@/contexts/MusicContext";

interface SidebarProps {
  currentView: 'home' | 'search' | 'library' | 'playlists' | 'settings';
  onViewChange: (view: 'home' | 'search' | 'library' | 'playlists' | 'settings') => void;
}

export const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  const { playlists, likedSongs } = useMusicContext();

  const navItems = [
    { id: 'home', label: 'Home', icon: Music },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-black rounded-lg flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-white text-2xl font-bold flex items-center gap-2">
          <div className="relative">
            <Zap className="text-primary w-8 h-8" fill="currentColor" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            SPEEDIFY
          </span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1 ml-10">MUSIC</p>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-2 mb-8">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`w-full justify-start text-left h-12 transition-all duration-200 ${
              currentView === item.id
                ? 'bg-primary/20 text-primary border-r-2 border-primary'
                : 'text-muted-foreground hover:text-white hover:bg-muted/20'
            }`}
            onClick={() => onViewChange(item.id as 'home' | 'search' | 'library' | 'playlists' | 'settings')}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
            {item.id === 'playlists' && playlists.length > 0 && (
              <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                {playlists.length}
              </span>
            )}
          </Button>
        ))}
      </nav>

      {/* Quick Access */}
      <div className="px-3 mb-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-white h-10 transition-colors"
            onClick={() => onViewChange('library')}
          >
            <Heart className="w-4 h-4 mr-3" />
            Liked Songs
            {likedSongs.length > 0 && (
              <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                {likedSongs.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Recent Playlists */}
      <div className="px-3 flex-1 overflow-hidden">
        <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
          {playlists.slice(0, 8).map((playlist) => (
            <Button
              key={playlist.id}
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-white h-8 text-sm transition-colors"
              onClick={() => onViewChange('playlists')}
            >
              <ListMusic className="w-3 h-3 mr-2" />
              <span className="truncate">{playlist.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 mt-auto">
        <div className="text-xs text-muted-foreground text-center">
          <p>© 2024 Speedify Music</p>
          <p className="text-primary">Ultimate Music Experience</p>
        </div>
      </div>
    </div>
  );
};
