import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ onLocationSelect, selectedLocation }) => {
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    onLocationSelect(lat, lng);
  };

  return (
    <MapContainer center={[12.9716, 77.5946]} zoom={10} style={{ height: '100%', width: '100%' }} onClick={handleMapClick}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap contributors'
      />
      {selectedLocation && (
        <Marker position={selectedLocation}>
          <Popup>Selected Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapComponent;