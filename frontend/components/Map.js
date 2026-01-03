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
  const BENGALURU_CENTER = [12.9716, 77.5946];
  const DEFAULT_ZOOM = 11;
  
  const [center, setCenter] = useState(BENGALURU_CENTER); // Default to Bengaluru city center
  const [zoom, setZoom] = useState(DEFAULT_ZOOM); // Track zoom level
  const [userLocation_detected, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // === HEIGHT LOGIC ===
  // 1. If fillHeight is true (passed from App.js), use 'h-full' to fill the flex container exactly.
  // 2. If small is true, use fixed widget sizes (increased slightly).
  // 3. Otherwise default to a larger fixed height (increased slightly).
  const sizeClass = fillHeight 
    ? 'h-full' 
    : (small ? "h-[411px] md:h-[771px]" : 'h-[643px] md:h-[1004px]');

  /**
   * Custom function to detect user's current location and create blue marker
   * Like Google Maps: Auto-centers map to user location and zooms in when detected
   */
  const detectUserLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.warn('Geolocation not supported');
      setLocationError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Successfully got user location
        const { latitude, longitude, accuracy } = position.coords;
        const userLoc = [latitude, longitude];
        
        console.log(`📍 User Location Detected: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}], Accuracy: ${accuracy.toFixed(0)}m`);
        setUserLocation(userLoc);
        
        // Auto-recenter map to user location (like Google Maps)
        setCenter(userLoc);
        setZoom(15); // Zoom in to show user location prominently
        setLocationError(null);
      },
      (error) => {
        // Handle geolocation errors gracefully
        let errorMsg = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location permission denied. Enable location access to see your position.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timeout.';
            break;
          default:
            errorMsg = 'Error detecting location.';
        }
        console.warn(`Location Error: ${errorMsg}`);
        setLocationError(errorMsg);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60 * 1000, // Cache location for 1 minute
        timeout: 10 * 1000 // 10 second timeout
      }
    );
  };

  // Detect user location on component mount
  useEffect(() => {
    detectUserLocation();
  }, []);

  // Small helper to programmatically recenter the map when the center state updates
  function Recenter({ position }) {
    const map = useMap();
    useEffect(() => {
      if (position && map && map._container && map._panes) {
        try {
          // Add a small delay to ensure map is fully initialized
          const timer = setTimeout(() => {
            if (map._size && map._size.x > 0 && map._size.y > 0) {
              map.setView(position, map.getZoom(), { animate: false });
            }
          }, 100);
          return () => clearTimeout(timer);
        } catch (error) {
          console.warn('Error recentering map:', error);
        }
      }
    }, [position, map]);
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
    
    // More intense animation for high severity
    const animationDuration = severity >= 4 ? '1.2s' : '2s'
    const pulseOpacity = severity >= 4 ? 0.8 : 0.6
    
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
        animation: markerBounce ${animationDuration} ease-in-out infinite;
      " title="${severityLabel}">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">${emoji}</div>
      </div>
      <style>
        @keyframes markerBounce {
          0%, 100% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(1.15); }
        }
        @keyframes markerPulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 ${color}66;
            opacity: 0.6;
          }
          50% { 
            box-shadow: 0 0 0 12px ${color}00;
            opacity: ${pulseOpacity};
          }
        }
      </style>
      <div class="severity-pulse" style="
        position: absolute; 
        width: 50px; 
        height: 50px; 
        border-radius: 50%; 
        background: ${color}22;
        border: 3px solid ${color}88;
        opacity: 0.8;
        left: 50%; 
        top: 50%; 
        transform: translate(-50%, -50%);
        animation: markerPulse ${animationDuration} infinite;
        pointer-events: none;
      "></div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
      className: 'severity-marker-container'
    });
  };

  return (
    <div className={`relative ${sizeClass} w-full rounded-lg shadow-sm border border-gray-200 overflow-hidden`}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />
        
        {/* User's Current Location - Blue Pulsing Dot (like Google Maps) */}
        {userLocation_detected && (
          <Marker
            position={userLocation_detected}
            icon={L.divIcon({
              className: 'leaflet-zoom-animated leaflet-user-location-marker',
              html: `
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 6px rgba(30, 64, 175, 0.6)); animation: userLocationPulse 2.5s infinite;">
                  <circle cx="16" cy="16" r="12" fill="#1E40AF" opacity="0.2" />
                  <circle cx="16" cy="16" r="10" fill="none" stroke="#1E40AF" stroke-width="1" opacity="0.4" />
                  <circle cx="16" cy="16" r="8" fill="#3B82F6" />
                  <circle cx="16" cy="16" r="8" fill="none" stroke="#ffffff" stroke-width="3" />
                  <circle cx="16" cy="16" r="4" fill="#ffffff" />
                </svg>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
              popupAnchor: [0, -16],
            })}
            zIndexOffset={1000}
          >
            <Popup className="user-location-popup">
              <div className="text-sm font-semibold text-blue-600">📍 Your Location</div>
              <div className="text-xs text-gray-600">
                {userLocation_detected[0].toFixed(4)}, {userLocation_detected[1].toFixed(4)}
              </div>
            </Popup>
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
        
        @keyframes userLocationPulse {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(30, 64, 175, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(30, 64, 175, 0.9)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.5));
          }
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

        /* User location marker - SVG based */
        .leaflet-user-location-marker {
          z-index: 1000 !important;
        }
        
        .user-location-popup {
          border-radius: 8px;
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