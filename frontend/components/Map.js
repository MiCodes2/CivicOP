import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Next.js
import L from 'leaflet';

// Only run this on client side to avoid build errors
if (typeof window !== 'undefined') {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

const Map = ({ incidents, userLocation, fillHeight = false, small = false }) => {
  const [center, setCenter] = useState([12.9716, 77.5946]); // Default to Bengaluru
  const [detectedLocation, setDetectedLocation] = useState(null);

  // === HEIGHT LOGIC ===
  // 1. If fillHeight is true (passed from App.js), use 'h-full' to fill the flex container exactly.
  // 2. If small is true, use fixed widget sizes (increased slightly).
  // 3. Otherwise default to a larger fixed height (increased slightly).
  const sizeClass = fillHeight 
    ? 'h-full' 
    : (small ? "h-[411px] md:h-[771px]" : 'h-[643px] md:h-[1004px]');

  // If a userLocation prop is passed, prefer it. Otherwise attempt to detect via browser geolocation.
  useEffect(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      const loc = [userLocation.latitude, userLocation.longitude];
      setCenter(loc);
      setDetectedLocation(loc);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.latitude, pos.coords.longitude];
          setCenter(loc);
          setDetectedLocation(loc);
        },
        (err) => {
          // permission denied or error — keep default center
          console.warn('Geolocation error:', err);
        },
        { enableHighAccuracy: true, maximumAge: 60 * 1000 }
      );
    }
  }, [userLocation]);

  // Small helper to programmatically recenter the map when the center state updates
  function Recenter({ position }) {
    const map = useMap();
    useEffect(() => {
      if (position && map) {
        map.setView(position, map.getZoom());
      }
    }, [position]);
    return null;
  }

  const THEME_CITY = process.env.NEXT_PUBLIC_THEME_CITY || '#F9A825';
  const THEME_WATER = process.env.NEXT_PUBLIC_THEME_WATER || '#3B99D9';
  const THEME_TRANSPORT = process.env.NEXT_PUBLIC_THEME_TRANSPORT || '#D32F2F';
  const THEME_GREENSPACE = process.env.NEXT_PUBLIC_THEME_GREEN || '#388E3C';

  // Get marker color based on severity (1-5)
  const getMarkerColor = (severity) => {
    if (severity >= 4) return '#DC2626'; // Red for high severity (4-5)
    if (severity === 3) return '#F59E0B'; // Orange for medium (3)
    if (severity === 2) return '#FCD34D'; // Yellow for minor (2)
    return '#10B981'; // Green for low (1)
  };

  // Create custom icon based on severity with enhanced styling and animation
  const createSeverityIcon = (severity) => {
    const color = getMarkerColor(severity)
    const severityLabels = ['', 'Low', 'Minor', 'Medium', 'High', 'Critical']
    const severityLabel = severityLabels[severity] || 'Medium'
    const emoji = severity >= 4 ? '🚨' : severity === 3 ? '⚠️' : severity === 2 ? '⚡' : '✓'
    
    return L.divIcon({
      className: 'severity-marker-wrapper',
      html: `<div class="severity-marker-bounce" style="
        background: linear-gradient(135deg, ${color}dd 0%, ${color} 100%);
        width: 44px;
        height: 44px;
        border-radius: 50% 50% 50% 0;
        border: 4px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 4px 16px rgba(0,0,0,0.3), inset 0 -2px 6px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 20px;
        color: white;
        text-shadow: 0 2px 4px rgba(0,0,0,0.4);
        position: relative;
      " title="${severityLabel}">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">${emoji}</div>
      </div>
      <div class="severity-pulse" style="position: absolute; width: 48px; height: 48px; border-radius: 50%; border: 2px solid ${color}; opacity: 0; left: 50%; top: 50%; transform: translate(-50%, -50%); animation: pulse 2s infinite;"></div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
      className: 'severity-marker-container'
    });
  };

  return (
    <div className={`relative ${sizeClass} w-full rounded-lg shadow-sm border border-gray-200 overflow-hidden`}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />
        <Recenter position={center} />
        {center && (
          <Marker
            position={center}
            icon={L.divIcon({
              className: 'user-location',
              html: `<div class="user-location-pin"></div>`,
              iconSize: [24, 36],
              iconAnchor: [12, 36],
            })}
            zIndexOffset={2000}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}
        {incidents && incidents.filter(i => Number.isFinite(i.latitude) && Number.isFinite(i.longitude)).map((incident) => {
          const customIcon = createSeverityIcon(incident.severity || 3);

          return (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
              icon={customIcon}
            >
              <Popup maxWidth={300}>
                <div className="p-3 min-w-[240px]">
                  {/* Header with category and status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-gray-900 flex-1">
                      {incident.category ? incident.category.charAt(0).toUpperCase() + incident.category.slice(1) : 'Issue'}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      incident.status === 'OPEN' ? 'bg-orange-100 text-orange-800' :
                      incident.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      incident.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                      incident.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {incident.status || 'OPEN'}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-gray-700 mb-2 leading-relaxed line-clamp-3">
                    {incident.description || 'No description provided'}
                  </p>
                  
                  {/* Address and Ward */}
                  <div className="space-y-1 mb-2 text-xs text-gray-600">
                    {incident.address && (
                      <div className="flex items-start gap-1">
                        <span className="text-base mt-0.5">📍</span>
                        <span className="line-clamp-2">{incident.address}</span>
                      </div>
                    )}
                    {incident.ward_number && (
                      <div className="flex items-center gap-1">
                        <span>🏛️</span>
                        <span className="font-medium">{incident.ward_number}</span>
                      </div>
                    )}
                    {!incident.address && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <span>📍</span>
                        <span className="text-xs">{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Image if available */}
                  {incident.image_url && (
                    <div className="mb-2">
                      <img 
                        src={incident.image_url} 
                        alt={incident.category}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  
                  {/* Severity and timestamp */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-gray-600">Severity:</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i < incident.severity ? 'bg-red-500' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 ml-1">{incident.severity || 3}/5</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(incident.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(-45deg); }
          50% { transform: translateY(-8px) rotate(-45deg); }
        }
        
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        
        .severity-marker-bounce {
          animation: bounce 2s infinite ease-in-out;
        }
        
        .severity-marker-container {
          filter: drop-shadow(0 3px 8px rgba(0,0,0,0.2));
        }
        
        .severity-marker-wrapper:hover {
          filter: drop-shadow(0 6px 16px rgba(0,0,0,0.3)) brightness(1.1);
          z-index: 1000 !important;
        }

        /* Enhanced popup styling */
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.05);
          background: linear-gradient(to bottom, #ffffff, #f9fafb);
          padding: 2px;
        }
        
        .leaflet-popup-content {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .leaflet-popup-content h3 {
          margin-top: 0;
          color: #111827;
          font-size: 15px;
        }
        
        .leaflet-popup-content p {
          color: #6b7280;
          font-size: 13px;
          line-height: 1.5;
        }
        
        .leaflet-popup-tip-container {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        /* Floating blue pin for user location */
        .user-location-pin {
          position: relative;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #3B99D9, #2563eb);
          transform: rotate(-45deg);
          border-radius: 50% 50% 50% 0;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(59,153,217,0.4);
          animation: pulse 2s infinite;
        }
        
        .user-location-pin::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 42%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 6px;
          height: 6px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: inset 0 0 3px rgba(0,0,0,0.2);
        }
        
        /* Leaflet marker hover effect */
        .leaflet-marker-pane .leaflet-marker-icon:hover {
          z-index: 1001 !important;
        }
      `}</style>
    </div>
  );
};

export default Map;