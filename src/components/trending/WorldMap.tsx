import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule
} from 'react-simple-maps';
import { cn } from '../../lib/utils';

const geoUrl = "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";

interface WorldMapProps {
  theme: 'light' | 'dark';
  onCountryClick: (country: string) => void;
  trends: any[]; // Data for heatmap
}

export const WorldMap: React.FC<WorldMapProps> = ({ theme, onCountryClick, trends }) => {
  const [tooltipContent, setTooltipContent] = useState("");

  // Map country names to counts or velocity
  const countryActivity: Record<string, number> = {};
  trends.forEach(t => {
    countryActivity[t.country] = (countryActivity[t.country] || 0) + t.score;
  });

  const getColor = (countryName: string) => {
    const activity = countryActivity[countryName] || 0;
    if (activity === 0) return theme === 'dark' ? "#1e293b" : "#f1f5f9";
    if (activity < 100) return "#3b82f6";
    if (activity < 200) return "#06b6d4";
    return "#00f2ff"; // Neon Blue
  };

  return (
    <div className="relative w-full aspect-[2/1] overflow-hidden rounded-[32px] border border-white/10 bg-black/40 backdrop-blur-xl">

      <div className="absolute bottom-6 right-6 z-10 flex gap-4">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="w-3 h-3 rounded-sm bg-[#1e293b]" />
          <span className="text-[8px] font-black text-white/40 uppercase">Quiet</span>
          <div className="w-3 h-3 rounded-sm bg-neon-blue" />
          <span className="text-[8px] font-black text-white/40 uppercase">Peak Virality</span>
        </div>
      </div>

      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147
        }}
        className="w-full h-full"
      >
        <Sphere stroke={theme === 'dark' ? "#ffffff10" : "#00000010"} strokeWidth={0.5} id="sphere" fill="transparent" />
        <Graticule stroke={theme === 'dark' ? "#ffffff05" : "#00000005"} strokeWidth={0.5} />
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    setTooltipContent(`${countryName}: ${countryActivity[countryName] || 'No signals'}`);
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                  onClick={() => onCountryClick(countryName)}
                  style={{
                    default: {
                      fill: getColor(countryName),
                      outline: "none",
                      transition: "all 250ms"
                    },
                    hover: {
                      fill: "#ffffff20",
                      outline: "none",
                      cursor: "pointer"
                    },
                    pressed: {
                      fill: "#00f2ff",
                      outline: "none"
                    }
                  }}
                  stroke={theme === 'dark' ? "#00000040" : "#ffffff40"}
                  strokeWidth={0.5}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      
      {tooltipContent && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none p-3 rounded-xl bg-black border border-neon-blue/30 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-2xl shadow-neon-blue/20">
          {tooltipContent}
        </div>
      )}
    </div>
  );
};
