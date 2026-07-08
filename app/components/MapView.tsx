'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';

// Fix default marker icon for webpack/next
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createPropertyIcon(selected = false) {
  return L.divIcon({
    html: `<div style="background:${selected ? '#1d4ed8' : '#2e7d54'};color:white;padding:${selected ? '6px 12px' : '4px 10px'};border-radius:10px;font-size:${selected ? '13px' : '11px'};font-weight:700;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.3);border:2px solid white;${selected ? 'transform:scale(1.1);' : ''}">₹</div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

const userIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;background:#2563eb;border:4px solid white;border-radius:50%;box-shadow:0 2px 12px rgba(37,99,235,0.4);position:relative;"><div style="width:8px;height:8px;background:white;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MapViewProps {
  properties: any[];
  userCoords?: { lat: number; lng: number } | null;
  height?: string;
  showInquiry?: boolean;
  onInquiry?: (propertyId: string, propertyTitle: string) => void;
  onPropertyClick?: (property: any) => void;
  selectedProperty?: any;
}

export default function MapView({
  properties,
  userCoords,
  height = '400px',
  showInquiry = false,
  onInquiry,
  onPropertyClick,
  selectedProperty,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Global inquiry handler for Leaflet popups
  const inquiryHandlerRef = useRef(onInquiry);
  inquiryHandlerRef.current = onInquiry;

  useEffect(() => {
    (window as any).__mapInquiry = (id: string, title: string) => {
      inquiryHandlerRef.current?.(id, title);
    };
    return () => {
      delete (window as any).__mapInquiry;
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const validProperties = properties.filter(
      (p) => p.location?.lat && p.location?.lng
    );

    if (validProperties.length === 0 && !userCoords) return;

    const allPoints: [number, number][] = [];

    // Add user location marker
    if (userCoords) {
      const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`
          <div style="text-align:center;font-family:system-ui,sans-serif;">
            <div style="font-weight:700;font-size:14px;color:#2563eb;margin-bottom:4px;">📍 Your Location</div>
            <div style="font-size:12px;color:#666;">${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}</div>
          </div>
        `);
      markersRef.current.push(userMarker);
      allPoints.push([userCoords.lat, userCoords.lng]);
    }

    // Add property markers
    validProperties.forEach((property) => {
      const lat = property.location.lat;
      const lng = property.location.lng;
      const isSelected = selectedProperty?._id === property._id;
      allPoints.push([lat, lng]);

      const safeTitle = encodeURIComponent(`${property.bhk || ''} ${property.propertyType || 'Property'}`);
      const galleryImages = (property.propertyImages || []).slice(0, 3);
      const galleryHtml = galleryImages.length > 0
        ? `<div style="display:flex;gap:4px;margin-bottom:8px;overflow-x:auto;padding-bottom:4px;">
            ${galleryImages.map((img: string) =>
              `<img src="${img}" style="width:70px;height:50px;object-fit:cover;border-radius:6px;flex-shrink:0;" />`
            ).join('')}
          </div>`
        : '';

      const googleMapsLink = property.location?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      const popupContent = `
        <div style="font-family:system-ui,sans-serif;max-width:260px;">
          ${property.propertyImages?.[0]
            ? `<div style="position:relative;margin-bottom:8px;">
                <img src="${property.propertyImages[0]}" style="width:100%;height:120px;object-fit:cover;border-radius:10px;" />
                <div style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.6);color:white;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;">${property.propertyFor || ''}</div>
              </div>`
            : ''
          }
          ${galleryHtml}
          <div style="font-size:16px;font-weight:700;color:#111;margin-bottom:2px;text-transform:capitalize;">
            ${property.bhk || ''} ${property.propertyType || 'Property'}
          </div>
          <div style="font-size:12px;color:#555;margin-bottom:2px;">${property.propertyName || ''}</div>
          <div style="font-size:12px;color:#777;margin-bottom:6px;display:flex;align-items:center;gap:4px;">
            📍 ${property.city || ''} ${property.distance ? `• <span style="color:#2563eb;">${property.distance.toFixed(1)} km</span>` : ''}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px;">
            <div style="background:#f3f4f6;padding:4px;border-radius:6px;text-align:center;font-size:11px;">
              <div style="font-weight:700;color:#111;">${property.bhk || '-'}</div>
              <div style="color:#888;">Beds</div>
            </div>
            <div style="background:#f3f4f6;padding:4px;border-radius:6px;text-align:center;font-size:11px;">
              <div style="font-weight:700;color:#111;">${property.sqft || '-'}</div>
              <div style="color:#888;">Sqft</div>
            </div>
            <div style="background:#f3f4f6;padding:4px;border-radius:6px;text-align:center;font-size:11px;">
              <div style="font-weight:700;color:#111;">${property.distance ? property.distance.toFixed(1) + 'k' : '-'}</div>
              <div style="color:#888;">Dist</div>
            </div>
          </div>
          <div style="font-size:18px;font-weight:700;color:#2e7d54;margin-bottom:8px;">
            ₹${Number(property.price).toLocaleString('en-IN')}
            ${property.propertyFor === 'rent' ? '<span style="font-size:12px;color:#888;font-weight:400;">/mo</span>' : ''}
          </div>
          <div style="margin-bottom:8px;">
            <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:8px 0;background:#f0f9ff;color:#0369a1;border:1px solid #bae6fd;border-radius:10px;font-weight:700;font-size:12px;text-decoration:none;transition:all 0.2s;">🗺️ View on Google Maps</a>
          </div>
          ${showInquiry
            ? `<button onclick="window.__mapInquiry('${property._id}','${safeTitle}')" style="width:100%;padding:10px;background:#2e7d54;color:white;border:none;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;transition:background 0.2s;">📩 Send Inquiry</button>`
            : ''
          }
        </div>
      `;

      const marker = L.marker([lat, lng], {
        icon: createPropertyIcon(isSelected),
        zIndexOffset: isSelected ? 500 : 0,
      }).addTo(map);

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup',
        closeButton: true,
      });

      marker.on('click', () => {
        onPropertyClick?.(property);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (allPoints.length === 1) {
      map.setView(allPoints[0], 14);
    } else if (allPoints.length > 1) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [properties, userCoords, showInquiry, onPropertyClick, selectedProperty]);

  return (
    <div className="relative w-full" style={{ height }}>
      <div
        ref={mapRef}
        className="w-full h-full rounded-xl border border-gray-200 shadow-lg"
      />
      <button
        type="button"
        onClick={() => {
          const map = mapInstanceRef.current;
          if (map) {
            const center = map.getCenter();
            const zoom = map.getZoom();
            window.open(`https://www.google.com/maps/@${center.lat},${center.lng},${zoom}z`, '_blank');
          } else {
            window.open('https://maps.google.com', '_blank');
          }
        }}
        className="absolute top-3 right-3 bg-white hover:bg-slate-100 text-gray-800 font-bold py-2 px-3 rounded-lg shadow-md border border-gray-300 text-xs flex items-center gap-1.5 z-[1000] transition"
      >
        <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Open in Google Maps
      </button>
    </div>
  );
}
