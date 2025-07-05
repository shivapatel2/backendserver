
import { useState } from "react";
import { Settings, Download, Volume2, Shuffle, Music, Palette, Info, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useMusicContext } from "@/contexts/MusicContext";

export const SettingsPage = () => {
  const [volume, setVolume] = useState([75]);
  const [autoPlay, setAutoPlay] = useState(true);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState("high");
  const { likedSongs, playlists } = useMusicContext();

  const settingSections = [
    {
      title: "Audio Settings",
      icon: Volume2,
      items: [
        {
          label: "Master Volume",
          type: "slider",
          value: volume,
          onChange: setVolume,
        },
        {
          label: "Auto Play Next",
          type: "switch",
          value: autoPlay,
          onChange: setAutoPlay,
        },
        {
          label: "Shuffle by Default",
          type: "switch",
          value: shuffleMode,
          onChange: setShuffleMode,
        },
      ],
    },
    {
      title: "Download Settings",
      icon: Download,
      items: [
        {
          label: "Download Quality",
          type: "select",
          value: downloadQuality,
          options: ["high", "medium", "low"],
          onChange: setDownloadQuality,
        },
      ],
    },
    {
      title: "Library Stats",
      icon: Music,
      items: [
        {
          label: "Liked Songs",
          type: "info",
          value: likedSongs.length,
        },
        {
          label: "Playlists",
          type: "info",
          value: playlists.length,
        },
        {
          label: "Total Tracks in Playlists",
          type: "info",
          value: playlists.reduce((total, playlist) => total + playlist.tracks.length, 0),
        },
      ],
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/20 rounded-lg">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-muted-foreground">Customize your music experience</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section) => (
          <div key={section.title} className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <section.icon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            </div>
            
            <div className="space-y-4">
              {section.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground flex-1">
                    {item.label}
                  </label>
                  
                  <div className="flex-shrink-0 w-32">
                    {item.type === "slider" && (
                      <div className="flex items-center gap-2">
                        <Slider
                          value={item.value}
                          onValueChange={item.onChange}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-8">
                          {item.value[0]}%
                        </span>
                      </div>
                    )}
                    
                    {item.type === "switch" && (
                      <Switch
                        checked={item.value}
                        onCheckedChange={item.onChange}
                      />
                    )}
                    
                    {item.type === "select" && (
                      <select
                        value={item.value}
                        onChange={(e) => item.onChange(e.target.value)}
                        className="bg-neutral-800 text-white rounded px-2 py-1 text-sm"
                      >
                        {item.options.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {item.type === "info" && (
                      <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* App Info */}
      <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <Info className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-white">About SPEEDIFY MUSIC</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Your ultimate music streaming experience with advanced features and premium quality.
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Version 1.0.0</span>
          <span>•</span>
          <span>Built with React & TypeScript</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-12 flex items-center gap-2 bg-card/30 border-neutral-700 hover:bg-card/50"
        >
          <Download className="w-4 h-4" />
          Clear Cache
        </Button>
        <Button
          variant="outline"
          className="h-12 flex items-center gap-2 bg-card/30 border-neutral-700 hover:bg-card/50"
        >
          <Palette className="w-4 h-4" />
          Theme Settings
        </Button>
      </div>
    </div>
  );
};
