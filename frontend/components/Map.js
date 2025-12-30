import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Next.js
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = ({ incidents, userLocation }) => {
  const [center, setCenter] = useState([12.9716, 77.5946]); // Default to Bengaluru, India

  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation]);

  const THEME_CITY = process.env.NEXT_PUBLIC_THEME_CITY || '#F9A825';
  const THEME_WATER = process.env.NEXT_PUBLIC_THEME_WATER || '#3B99D9';
  const THEME_TRANSPORT = process.env.NEXT_PUBLIC_THEME_TRANSPORT || '#D32F2F';
  const THEME_GREENSPACE = process.env.NEXT_PUBLIC_THEME_GREEN || '#388E3C';

  const getMarkerColor = (status) => {
    switch (status) {
      case 'reported':
        return THEME_CITY; // city / saffron
      case 'processing':
        return THEME_WATER; // water / blue
      case 'verified':
        return THEME_GREENSPACE; // verified -> green space
      case 'assigned':
        return THEME_TRANSPORT; // assigned -> transport (red)
      case 'resolved':
        return THEME_GREENSPACE; // resolved -> green
      case 'rejected':
        return THEME_TRANSPORT; // rejected -> transport (red)
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <div className="relative h-96 w-full rounded-lg">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
        {incidents.filter(i => Number.isFinite(i.latitude) && Number.isFinite(i.longitude)).map((incident) => {
          const markerColor = getMarkerColor(incident.status);
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          return (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
              icon={customIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm">{incident.category.charAt(0).toUpperCase() + incident.category.slice(1)} Issue</h3>
                  <p className="text-xs text-gray-600 mt-1">{incident.description || 'No description provided'}</p>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      incident.status === 'reported' ? 'bg-city/10 text-city' :
                      incident.status === 'processing' ? 'bg-water/10 text-water' :
                      incident.status === 'verified' ? 'bg-greenspace/10 text-greenspace' :
                      incident.status === 'assigned' ? 'bg-transport/10 text-transport' :
                      incident.status === 'resolved' ? 'bg-greenspace/10 text-greenspace' :
                      'bg-transport/10 text-transport'
                    }`}>
                      {incident.status}
                    </span>
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
      `}</style>
    </div>
  );
};

export default Map;