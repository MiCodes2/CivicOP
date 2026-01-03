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

  // Create custom icon based on severity
  const createSeverityIcon = (severity) => {
    const color = getMarkerColor(severity);
    return L.divIcon({
      className: 'custom-severity-marker',
      html: `<div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
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
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-sm">{incident.category ? incident.category.charAt(0).toUpperCase() + incident.category.slice(1) : 'Issue'}</h3>
                  <p className="text-xs text-gray-600 mt-1">{incident.description || 'No description provided'}</p>
                  
                  {incident.image_url && (
                    <img 
                      src={incident.image_url} 
                      alt="Issue" 
                      className="w-full h-24 object-cover rounded mt-2"
                    />
                  )}
                  
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full border ${
                      incident.status === 'OPEN' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      incident.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      incident.status === 'RESOLVED' ? 'bg-green-50 text-green-700 border-green-200' :
                      incident.status === 'CLOSED' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {incident.status || 'OPEN'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Severity: {incident.severity || 3}/5
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(incident.created_at).toLocaleString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style jsx>{`
        .custom-marker {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-content {
          margin: 0;
        }

        /* Floating blue pin for user location */
        .user-location-pin {
          position: relative;
          width: 18px;
          height: 18px;
          background: var(--theme-water);
          transform: rotate(-45deg);
          border-radius: 50% 50% 50% 0;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(59,153,217,0.35);
        }
        .user-location-pin::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 42%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default Map;