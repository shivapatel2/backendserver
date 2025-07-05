import { Home, Search, Library, Settings, Heart, ListMusic, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusicContext } from "@/contexts/MusicContext";

interface BottomNavProps {
  currentView: 'home' | 'search' | 'library' | 'playlists' | 'settings';
  onViewChange: (view: 'home' | 'search' | 'library' | 'playlists' | 'settings') => void;
}

export const BottomNav = ({ currentView, onViewChange }: BottomNavProps) => {
  const { likedSongs, playlists } = useMusicContext();

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home,
      description: 'Discover music'
    },
    { 
      id: 'search', 
      label: 'Search', 
      icon: Search,
      description: 'Find your music'
    },
    { 
      id: 'library', 
      label: 'Library', 
      icon: Library,
      description: 'Your collection'
    },
    { 
      id: 'playlists', 
      label: 'Playlists', 
      icon: ListMusic,
      description: 'Your playlists'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      description: 'App settings'
    },
  ];

  return (
    <div className="md:hidden bg-gradient-to-t from-black via-neutral-900/95 to-neutral-900/90 backdrop-blur-xl border-t border-neutral-800/50 px-2 py-3 z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const IconComponent = item.icon;
          
          return (
          <Button
            key={item.id}
            variant="ghost"
              className={`flex flex-col items-center gap-1 p-2 h-auto transition-all duration-300 relative group ${
                isActive
                ? 'text-primary scale-110'
                : 'text-muted-foreground hover:text-white hover:scale-105'
            }`}
              onClick={() => onViewChange(item.id as 'home' | 'search' | 'library' | 'playlists' | 'settings')}
          >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
              )}
              
            <div className="relative">
                <IconComponent className={`w-5 h-5 transition-all duration-300 ${
                  isActive ? 'animate-bounce' : 'group-hover:animate-pulse'
                }`} />
                
                {/* Badge for playlists */}
              {item.id === 'playlists' && playlists.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-xs rounded-full flex items-center justify-center text-black font-bold animate-pulse">
                  {playlists.length > 9 ? '9+' : playlists.length}
                </div>
              )}
                
                {/* Badge for liked songs */}
              {item.id === 'library' && likedSongs.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-xs rounded-full flex items-center justify-center text-white font-bold animate-pulse">
                  {likedSongs.length > 9 ? '9+' : likedSongs.length}
                </div>
              )}
            </div>
              
              <span className={`text-xs font-medium transition-all duration-300 ${
                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-white'
              }`}>
                {item.label}
              </span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                {item.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
              </div>
          </Button>
          );
        })}
      </div>
      
      {/* Bottom safe area for devices with home indicator */}
      <div className="h-1 bg-gradient-to-t from-neutral-900 to-transparent" />
    </div>
  );
};
