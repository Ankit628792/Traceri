import React, { useState, useMemo } from 'react';
import { ProcessedArchive, LifeReceipt } from '../types';
import { Compass } from 'lucide-react';

interface LifeMapProps {
  archive: ProcessedArchive;
  onSelectReceipt: (receipt: LifeReceipt) => void;
}

export const LifeMap: React.FC<LifeMapProps> = ({ archive, onSelectReceipt }) => {
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  // Filter places with valid coordinates
  const placesWithCoords = useMemo(() => {
    return archive.placeCounts.filter((p) => p.coordinates && p.coordinates.length === 2);
  }, [archive.placeCounts]);

  // Unique cities
  const cities = useMemo(() => {
    const set = new Set(placesWithCoords.map((p) => p.city));
    return ['ALL', ...Array.from(set)];
  }, [placesWithCoords]);

  // Filtered places
  const activePlaces = useMemo(() => {
    if (selectedCity === 'ALL') return placesWithCoords;
    return placesWithCoords.filter((p) => p.city === selectedCity);
  }, [placesWithCoords, selectedCity]);

  // Compute bounding box for projection
  const bounds = useMemo(() => {
    if (activePlaces.length === 0) return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    activePlaces.forEach((p) => {
      if (p.coordinates) {
        const [lat, lng] = p.coordinates;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }
    });

    // Add padding
    const padLat = Math.max((maxLat - minLat) * 0.15, 0.01);
    const padLng = Math.max((maxLng - minLng) * 0.15, 0.01);

    return {
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
      minLng: minLng - padLng,
      maxLng: maxLng + padLng,
    };
  }, [activePlaces]);

  // Project [lat, lng] to SVG canvas coordinates (800 x 480)
  const project = (lat: number, lng: number): [number, number] => {
    const width = 800;
    const height = 480;
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * (width - 120) + 60;
    // Invert latitude for SVG y
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat || 1)) * (height - 120) + 60;
    return [x, y];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Editorial Title */}
      <div className="border-b border-[#232730] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-[#5F9E7D] uppercase tracking-widest mb-1">
            GEOGRAPHIC SPATIAL ANCHORS
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl text-[#FAF8F5]">
            Life Map
          </h2>
        </div>

        {/* City Filter Tabs */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {cities.map((city) => (
            <button
              key={city}
              id={`map-city-${city}`}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded transition-all ${
                selectedCity === city
                  ? 'bg-[#5F9E7D] text-[#0A0B0D] font-bold'
                  : 'bg-[#12141C] text-[#8E939E] hover:text-[#FAF8F5] border border-[#242934]'
              }`}
            >
              {city.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Map Display */}
      <div className="bg-[#0C0E12] border border-[#232730] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        <div className="flex items-center justify-between text-xs font-mono text-[#8E939E] mb-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-[#5F9E7D]" />
            <span>EDITORIAL PROJECTION · REAL COORDINATES ONLY</span>
          </div>
          <span>{activePlaces.length} LOCATIONS IN VIEW</span>
        </div>

        <div className="relative w-full aspect-[16/9] max-h-[500px] border border-[#1A1F29] rounded-xl bg-[#090A0D] overflow-hidden">
          
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#13161C_1px,transparent_1px),linear-gradient(to_bottom,#13161C_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

          <svg className="w-full h-full" viewBox="0 0 800 480">
            {/* Draw thin connection lines between sequential places */}
            {activePlaces.map((p1, idx) => {
              if (idx === activePlaces.length - 1) return null;
              const p2 = activePlaces[idx + 1];
              if (!p1.coordinates || !p2.coordinates) return null;
              const [x1, y1] = project(p1.coordinates[0], p1.coordinates[1]);
              const [x2, y2] = project(p2.coordinates[0], p2.coordinates[1]);

              return (
                <line
                  key={`path-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#3A483E"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
              );
            })}

            {/* Place Nodes */}
            {activePlaces.map((place) => {
              if (!place.coordinates) return null;
              const [x, y] = project(place.coordinates[0], place.coordinates[1]);
              const radius = Math.min(18, 6 + place.count * 2);

              const handlePlaceClick = () => {
                const match = archive.receipts.find(
                  (r) => r.location?.name && r.location.name.toLowerCase() === place.name.toLowerCase()
                );
                if (match) {
                  onSelectReceipt(match);
                }
              };

              return (
                <g key={place.name} className="cursor-pointer group" onClick={handlePlaceClick}>
                  {/* Outer pulse */}
                  <circle
                    cx={x}
                    cy={y}
                    r={radius + 4}
                    fill="#5F9E7D"
                    opacity="0.15"
                    className="animate-pulse"
                  />
                  {/* Core node */}
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill="#5F9E7D"
                    stroke="#FAF8F5"
                    strokeWidth="1.5"
                    className="transition-transform group-hover:scale-125"
                  />
                  {/* Return count */}
                  <text
                    x={x}
                    y={y + 3.5}
                    textAnchor="middle"
                    fill="#0A0B0D"
                    fontSize="9px"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {place.count}
                  </text>

                  {/* Place label */}
                  <text
                    x={x}
                    y={y - radius - 8}
                    textAnchor="middle"
                    fill="#FAF8F5"
                    fontSize="11px"
                    fontFamily="Newsreader"
                    fontWeight="500"
                    className="select-none"
                  >
                    {place.name}
                  </text>
                  <text
                    x={x}
                    y={y + radius + 14}
                    textAnchor="middle"
                    fill="#8E939E"
                    fontSize="8px"
                    fontFamily="JetBrains Mono"
                    className="select-none"
                  >
                    {place.city.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Place Legend Details */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activePlaces.map((place) => {
            const handleCardClick = () => {
              const match = archive.receipts.find(
                (r) => r.location?.name && r.location.name.toLowerCase() === place.name.toLowerCase()
              );
              if (match) {
                onSelectReceipt(match);
              }
            };

            return (
              <div
                key={place.name}
                onClick={handleCardClick}
                className="p-3 rounded bg-[#11141B] border border-[#232730] hover:border-[#3A4252] cursor-pointer transition-colors text-xs font-mono"
              >
                <div className="flex items-center justify-between text-[#8E939E]">
                  <span>{place.city}</span>
                  <span className="text-[#CFA04E] font-semibold">{place.count} TRACES</span>
                </div>
                <div className="font-sans font-semibold text-[#FAF8F5] truncate mt-1">
                  {place.name}
                </div>
                {place.coordinates && (
                  <div className="text-[10px] text-[#5F9E7D] mt-1">
                    {place.coordinates[0].toFixed(2)}°N, {place.coordinates[1].toFixed(2)}°E
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
