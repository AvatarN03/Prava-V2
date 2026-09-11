"use client";

import { useEffect, useMemo } from "react";

import L from "leaflet";
import { Clock, ExternalLink, MapPin, Navigation } from "lucide-react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { formatDistance } from "./map-service";

import type { EssentialCategory, NearbyEssentialPOI } from "./map-service";
import "leaflet/dist/leaflet.css";

// Icon cache to avoid recreating DOM/L.divIcon instances on every render
const iconCache = new Map<string, L.DivIcon>();

// Modern Lucide-style vector SVG icons for Leaflet markers
const SVG_ICONS = {
  atm: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/><circle cx="7" cy="15" r="1"/></svg>`,
  pharmacy: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12"/><path d="M6 12h12"/><rect width="20" height="20" x="2" y="2" rx="4"/></svg>`,
  hotel: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,
  transit: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>`,
  supermarket: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  pin: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/></svg>`,
};

// Helper to create sleek, modern vector pin markers
function createCustomPin(
  svgIcon: string,
  bgColor: string,
  isHighlight: boolean = false
): L.DivIcon {
  const circleSize = isHighlight ? 34 : 28;
  const pinHeight = isHighlight ? 44 : 38;
  const pinWidth = circleSize + 4;
  const needleSize = isHighlight ? 6 : 5;

  return L.divIcon({
    className: "modern-map-pin",
    html: `
      <div style="
        position: relative;
        width: ${pinWidth}px;
        height: ${pinHeight}px;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: auto;
      ">
        <div style="
          width: ${circleSize}px;
          height: ${circleSize}px;
          border-radius: 50%;
          background: ${bgColor};
          color: #ffffff;
          border: 2px solid #ffffff;
          box-shadow: ${
            isHighlight
              ? "0 0 0 4px rgba(45, 155, 240, 0.45), 0 6px 14px rgba(0,0,0,0.35)"
              : "0 3px 8px rgba(0,0,0,0.25)"
          };
          display: flex;
          align-items: center;
          justify-content: center;
          transform: ${isHighlight ? "scale(1.06)" : "scale(1)"};
          transition: transform 0.2s ease;
        ">
          ${svgIcon}
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: ${needleSize}px solid transparent;
          border-right: ${needleSize}px solid transparent;
          border-top: ${needleSize + 2}px solid ${bgColor};
          margin-top: -1px;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
        "></div>
      </div>
    `,
    iconSize: [pinWidth, pinHeight],
    iconAnchor: [pinWidth / 2, pinHeight],
    popupAnchor: [0, -pinHeight + 4],
  });
}

// Device Live Location Pulsing Icon
const deviceLocationIcon = L.divIcon({
  className: "device-location-marker",
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.35);
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #2563eb;
        border: 2.5px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Center Search Pin Icon (Modern Pin with Navigation icon)
const centerSearchIcon = L.divIcon({
  className: "center-search-marker",
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 46px;
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #0f172a;
        border: 2.5px solid #2D9BF0;
        box-shadow: 0 0 0 3px rgba(45, 155, 240, 0.4), 0 5px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #2D9BF0;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 5.5px solid transparent;
        border-right: 5.5px solid transparent;
        border-top: 7px solid #0f172a;
        margin-top: -1px;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
      "></div>
    </div>
  `,
  iconSize: [36, 46],
  iconAnchor: [18, 46],
  popupAnchor: [0, -42],
});

function getPoiIcon(category: EssentialCategory, isSelected: boolean): L.DivIcon {
  const cacheKey = `${category}_${isSelected ? "selected" : "normal"}`;
  const existing = iconCache.get(cacheKey);
  if (existing) return existing;

  let icon: L.DivIcon;
  switch (category) {
    case "atm":
      icon = createCustomPin(SVG_ICONS.atm, isSelected ? "#059669" : "#10b981", isSelected);
      break;
    case "pharmacy":
      icon = createCustomPin(SVG_ICONS.pharmacy, isSelected ? "#e11d48" : "#f43f5e", isSelected);
      break;
    case "hotel":
      icon = createCustomPin(SVG_ICONS.hotel, isSelected ? "#4f46e5" : "#6366f1", isSelected);
      break;
    case "transit":
      icon = createCustomPin(SVG_ICONS.transit, isSelected ? "#0369a1" : "#0284c7", isSelected);
      break;
    case "supermarket":
      icon = createCustomPin(SVG_ICONS.supermarket, isSelected ? "#d97706" : "#f59e0b", isSelected);
      break;
    default:
      icon = createCustomPin(SVG_ICONS.pin, isSelected ? "#0284c7" : "#2d9bf0", isSelected);
      break;
  }

  iconCache.set(cacheKey, icon);
  return icon;
}

function MapViewController({
  center,
  zoom,
  selectedPoi,
}: {
  center: [number, number];
  zoom: number;
  selectedPoi: NearbyEssentialPOI | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedPoi) {
      map.flyTo([selectedPoi.lat, selectedPoi.lon], Math.max(map.getZoom(), 15), {
        duration: 0.6,
      });
    } else {
      map.flyTo(center, zoom, { duration: 0.6 });
    }
  }, [center, zoom, selectedPoi, map]);

  return null;
}

interface MapInnerProps {
  center: [number, number];
  zoom: number;
  locationName: string;
  isUserDeviceLocation?: boolean;
  deviceCoords?: [number, number] | null;
  pois?: NearbyEssentialPOI[];
  selectedPoi?: NearbyEssentialPOI | null;
  onSelectPoi?: (poi: NearbyEssentialPOI | null) => void;
}

export default function MapInner({
  center,
  zoom,
  locationName,
  isUserDeviceLocation = false,
  deviceCoords = null,
  pois = [],
  selectedPoi = null,
  onSelectPoi,
}: MapInnerProps) {
  // Cap rendered POIs to top 18 closest to prevent excessive DOM allocations in Leaflet
  const visiblePois = useMemo(() => pois.slice(0, 18), [pois]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-[480px] w-full z-0 font-sans"
    >
      {/* Memory-optimized TileLayer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        updateWhenIdle={true}
        updateWhenZooming={false}
        keepBuffer={2}
        maxZoom={18}
        minZoom={4}
      />

      <MapViewController center={center} zoom={zoom} selectedPoi={selectedPoi} />

      {/* 1.5km Radius Visual Cue */}
      <Circle
        center={center}
        radius={1200}
        pathOptions={{
          color: "#2D9BF0",
          fillColor: "#2D9BF0",
          fillOpacity: 0.05,
          weight: 1,
          dashArray: "4 4",
        }}
      />

      {/* Primary Center Search Marker */}
      <Marker
        position={center}
        icon={isUserDeviceLocation ? deviceLocationIcon : centerSearchIcon}
      >
        <Popup className="travel-map-popup">
          <div className="p-1 space-y-1 min-w-[160px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <span>{isUserDeviceLocation ? "🔵 My Device Location" : "📍 Selected Hub"}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">{locationName}</p>
            <div className="text-[10px] text-slate-400 font-mono pt-0.5">
              {center[0].toFixed(4)}° N, {center[1].toFixed(4)}° E
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Separate User GPS Marker if user searched another destination */}
      {deviceCoords && !isUserDeviceLocation && (
        <Marker position={deviceCoords} icon={deviceLocationIcon}>
          <Popup className="travel-map-popup">
            <div className="p-1 space-y-0.5">
              <span className="text-xs font-bold text-blue-600">Your Live GPS Location</span>
              <p className="text-[10px] text-slate-500 font-mono">
                {deviceCoords[0].toFixed(4)}° N, {deviceCoords[1].toFixed(4)}° E
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Nearby Travel Essential POIs (Capped to top 18 closest) */}
      {visiblePois.map((poi) => {
        const isSelected = selectedPoi?.id === poi.id;
        const icon = getPoiIcon(poi.category, isSelected);
        const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${poi.name} ${poi.lat},${poi.lon}`
        )}`;

        return (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lon]}
            icon={icon}
            eventHandlers={{
              click: () => onSelectPoi?.(poi),
            }}
          >
            <Popup className="travel-map-popup">
              <div className="p-1.5 space-y-1.5 min-w-[190px] max-w-[240px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {poi.categoryLabel}
                  </span>
                  <span className="text-[11px] font-bold text-primary font-mono">
                    {formatDistance(poi.distanceMeters)}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900 leading-snug">
                  {poi.name}
                </div>

                {poi.address && (
                  <p className="text-[11px] text-slate-600 leading-tight">
                    {poi.address}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" /> ~{poi.walkingMinutes} min walk
                  </span>
                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline flex items-center gap-0.5 font-bold"
                  >
                    Directions <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
