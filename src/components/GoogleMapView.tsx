import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Navigation } from 'lucide-react';
import { DC_NEIGHBORHOODS } from '../data/dcNeighborhoods';
import { NeighborhoodData } from '../types';

interface GoogleMapViewProps {
  selectedNeighborhoodId: string;
  onSelectNeighborhood: (neighborhoodId: string) => void;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  selectedNeighborhoodId,
  onSelectNeighborhood,
}) => {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const [mapError, setMapError] = useState(false);

  const selectedNeighborhood =
    DC_NEIGHBORHOODS.find((n) => n.id === selectedNeighborhoodId) ||
    DC_NEIGHBORHOODS[0];

  const defaultCenter = selectedNeighborhood.coordinates || {
    lat: 38.8951,
    lng: -77.0364,
  };

  // If no API key or map error, render our clean interactive vector map of D.C.
  if (!apiKey || mapError) {
    return (
      <div className="relative w-full h-[320px] sm:h-[360px] rounded-2xl overflow-hidden border border-slate-800 bg-[#0B0E14] flex flex-col">
        {/* Top Header Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white">
          <Navigation className="w-3.5 h-3.5 text-[#00C805]" />
          <span>Washington, D.C. Neighborhood Map</span>
        </div>

        {/* Interactive SVG DC Ward & Neighborhood Canvas */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center p-4">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-full max-h-[300px] object-contain opacity-90"
          >
            {/* D.C. Diamond Outline */}
            <polygon
              points="400,60 700,320 400,560 140,320"
              fill="#121824"
              stroke="#2A364F"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
            {/* Potomac & Anacostia Rivers */}
            <path
              d="M 140,320 Q 280,360 380,370 T 400,560"
              fill="none"
              stroke="#1E293B"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 380,370 Q 480,340 560,260"
              fill="none"
              stroke="#1E293B"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Neighborhood Nodes */}
            {DC_NEIGHBORHOODS.map((n, idx) => {
              // Map geo coordinates into SVG space roughly centered on DC diamond
              // DC bounds: lat ~38.82 to 38.98, lng ~-77.10 to -76.92
              const x = 400 + (n.coordinates.lng - -77.02) * 2800;
              const y = 310 - (n.coordinates.lat - 38.90) * 2800;
              const isSelected = n.id === selectedNeighborhoodId;

              return (
                <g
                  key={n.id}
                  onClick={() => onSelectNeighborhood(n.id)}
                  className="cursor-pointer group"
                >
                  {/* Glow circle */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="22"
                      fill="#00C805"
                      fillOpacity="0.25"
                      className="animate-pulse"
                    />
                  )}
                  {/* Marker Pin */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? "10" : "7"}
                    fill={isSelected ? "#00C805" : "#475569"}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all duration-200 group-hover:scale-125"
                  />
                  {/* Label */}
                  <text
                    x={x}
                    y={y - 14}
                    textAnchor="middle"
                    fill={isSelected ? "#00C805" : "#94A3B8"}
                    fontSize={isSelected ? "13" : "11"}
                    fontWeight={isSelected ? "700" : "500"}
                    className="pointer-events-none drop-shadow-md select-none font-sans"
                  >
                    {n.name.split('/')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Neighborhood Quick Ribbon */}
        <div className="bg-[#121824] px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C805]"></span>
            <span>
              Selected: <strong className="text-white">{selectedNeighborhood.name}</strong> ({selectedNeighborhood.ward})
            </span>
          </div>
          <span className="text-slate-400 hidden sm:inline">
            Click any pin to select neighborhood
          </span>
        </div>
      </div>
    );
  }

  // Google Maps Platform Integration via @vis.gl/react-google-maps
  return (
    <div className="relative w-full h-[320px] sm:h-[360px] rounded-2xl overflow-hidden border border-slate-800 bg-[#0B0E14]">
      <APIProvider apiKey={apiKey} onError={() => setMapError(true)}>
        <Map
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          mapId="DEMO_MAP_ID"
          defaultCenter={defaultCenter}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
        >
          {DC_NEIGHBORHOODS.map((n) => {
            const isSelected = n.id === selectedNeighborhoodId;
            return (
              <AdvancedMarker
                key={n.id}
                position={n.coordinates}
                onClick={() => onSelectNeighborhood(n.id)}
                title={n.name}
              >
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all transform cursor-pointer shadow-lg flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#00C805] text-black scale-110 ring-4 ring-[#00C805]/40'
                      : 'bg-black/90 text-white hover:bg-slate-800'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{n.name.split('/')[0]}</span>
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>

      {/* Selected Neighborhood Quick Ribbon */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#0B0E14]/95 backdrop-blur-md px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C805]"></span>
          <span>
            Selected: <strong className="text-white">{selectedNeighborhood.name}</strong> ({selectedNeighborhood.ward})
          </span>
        </div>
        <span className="text-slate-400 hidden sm:inline">
          Tap any pin or card to switch
        </span>
      </div>
    </div>
  );
};
