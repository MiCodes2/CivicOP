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

// Bengaluru bounds
const BENGALURU_BOUNDS = {
  minLat: 12.7,
  maxLat: 13.2,
  minLng: 77.3,
  maxLng: 77.9,
};

const isWithinBengaluru = (lat, lon) => {
  return (
    lat >= BENGALURU_BOUNDS.minLat &&
    lat <= BENGALURU_BOUNDS.maxLat &&
    lon >= BENGALURU_BOUNDS.minLng &&
    lon <= BENGALURU_BOUNDS.maxLng
  );
};

const MapComponent = ({ onLocationSelect, selectedLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    if (isWithinBengaluru(lat, lng)) {
      onLocationSelect(lat, lng);
    } else {
      setError('Please select a location within Bengaluru city limits');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError('');
    try {
      // Use Photon API for better OSM geocoding (faster than Nominatim)
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=10&lon=77.5946&lat=12.9716&zoom=12&lang=en`,
        { signal: AbortSignal.timeout(10000) }
      );
      const data = await response.json();

      // Filter to only Bengaluru locations
      const bengaluruResults = data.features?.filter((result) => {
        const coords = result.geometry.coordinates;
        const lon = coords[0], lat = coords[1];
        return isWithinBengaluru(lat, lon);
      }) || [];

      if (bengaluruResults.length === 0) {
        setError('No locations found in Bengaluru. Please try a different search.');
        setSearchResults([]);
      } else {
        setSearchResults(bengaluruResults);
      }
    } catch (err) {
      setError('Could not search locations. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const coords = result.geometry.coordinates;
    const lon = coords[0], lat = coords[1];
    onLocationSelect(lat, lon);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 bg-white border-b z-10">
        <form onSubmit={handleSearch} className="space-y-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for location in Bengaluru..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={searching}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSearchResult(result)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 text-sm"
              >
                <div className="font-medium text-gray-900">{result.properties.name}</div>
                <div className="text-xs text-gray-500 truncate">{result.properties.locality || result.properties.county || result.properties.city}</div>
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-600 mt-2">📍 Click on the map or search to select a location in Bengaluru</p>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={[12.9716, 77.5946]} zoom={11} style={{ height: '100%', width: '100%' }} onClick={handleMapClick}>
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
      </div>
    </div>
  );
};

export default MapComponent;