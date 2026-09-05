"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { NearbyEssentialPOI, EssentialCategory, formatDistance } from "./map-service";
import { ExternalLink, Clock } from "lucide-react";


// Helper to create category-specific Leaflet DivIcons
function createCustomPin(
  iconEmoji: string,
  bgColor: string,
  borderColor: string,
  isHighlight: boolean = false
): L.DivIcon {
  const size = isHighlight ? 36 : 30;
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${size}px;
        height: ${size}px;
        background: ${bgColor};
        border: 2px solid ${borderColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: ${isHighlight ? 16 : 13}px;
          line-height: 1;
        ">${iconEmoji}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
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

// Center Search Pin Icon
const centerSearchIcon = L.divIcon({
  className: "center-search-marker",
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background: #0f172a;
      border: 2.5px solid #38bdf8;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    ">
      <span style="transform: rotate(45deg); font-size: 16px;">📍</span>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

function getPoiIcon(category: EssentialCategory, isSelected: boolean): L.DivIcon {
  switch (category) {
    case "hotel":
      return createCustomPin("🏨", isSelected ? "#4f46e5" : "#6366f1", "#ffffff", isSelected);
    case "pharmacy":
      return createCustomPin("💊", isSelected ? "#dc2626" : "#ef4444", "#ffffff", isSelected);
    case "supermarket":
      return createCustomPin("🛒", isSelected ? "#059669" : "#10b981", "#ffffff", isSelected);
    case "atm":
      return createCustomPin("🏧", isSelected ? "#d97706" : "#f59e0b", "#ffffff", isSelected);
    case "transit":
      return createCustomPin("🚆", isSelected ? "#0284c7" : "#0ea5e9", "#ffffff", isSelected);
    default:
      return createCustomPin("📍", "#64748b", "#ffffff", isSelected);
  }
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
        duration: 0.8,
      });
    } else {
      map.flyTo(center, zoom, { duration: 0.8 });
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
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-[480px] w-full z-0 font-sans"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapViewController center={center} zoom={zoom} selectedPoi={selectedPoi} />

      {/* 1.5km Radius Visual Cue */}
      <Circle
        center={center}
        radius={1200}
        pathOptions={{
          color: "#0ea5e9",
          fillColor: "#0ea5e9",
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
              <span>{isUserDeviceLocation ? "🔵 My Device Location" : "📍 Selected Destination"}</span>
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

      {/* Nearby Travel Essential POIs */}
      {pois.map((poi) => {
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
                  <span className="text-[11px] font-bold text-blue-600 font-mono">
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
                    className="text-blue-600 hover:underline flex items-center gap-0.5 font-bold"
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
