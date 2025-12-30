import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

// Dynamically import map to avoid SSR issues
const DynamicMap = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="h-[240px] md:h-[420px] bg-gray-200 rounded-lg flex items-center justify-center">Loading map...</div>
});

// Dynamic import for modal map
const ModalMap = dynamic(() => import('./ModalMap'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-200 rounded-md flex items-center justify-center">Loading map...</div>
});

import CameraOverlay from '../components/CameraOverlay';

export default function Home() {
  const [incidents, setIncidents] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Fetch incidents from API
  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('http://localhost:8040/api/v1/incidents/');
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      } else {
        console.error('Failed to fetch incidents');
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleReportIssue = () => {
    setShowCamera(true);
  };

  const handlePhotoCapture = (blob) => {
    // Placeholder: Handle photo capture
    console.log('Photo captured:', blob);
    setShowCamera(false);
    setShowReportForm(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <main className="flex flex-1 gap-6 overflow-hidden h-full">
        <section className="flex-1 px-6 pb-4 min-h-0 h-full">
          <div className="px-4 py-0 sm:px-0 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-screen-2xl mx-auto h-full min-h-0">
          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-sm border mb-6 md:col-span-2 w-full self-start">
            <div className="px-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Nearby Issues</h2>
              <p className="text-sm text-gray-600">Click on markers to view details</p>
            </div>
            <div className="p-4">
              {/* Fixed rectangular map container (smaller rectangle) */}
              <div className="h-[240px] md:h-[420px] rounded-md overflow-hidden">
                <DynamicMap incidents={incidents} userLocation={userLocation} fillHeight />
              </div>
            </div>
          </div>

          {/* Recent Incidents List */}
          <div className="bg-white rounded-lg shadow-sm border md:col-span-1 w-full max-h-[70vh] overflow-auto self-start">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {incidents.length === 0 ? (
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-medium text-sm">#1001 Pothole</div>
                      <div className="text-xs text-gray-500">Ward 44 • 10m ago • Status: reported</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-medium text-sm">#1000 Garbage Dump</div>
                      <div className="text-xs text-gray-500">Ward 45 • 30m ago • Status: processing</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-medium text-sm">#999 Streetlight Out</div>
                      <div className="text-xs text-gray-500">Ward 43 • 1h ago • Status: verified</div>
                    </div>
                  </div>
                </div>
              ) : (
                incidents.map((incident) => (
                  <div key={incident.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{incident.category.charAt(0).toUpperCase() + incident.category.slice(1)} Issue</h4>
                      <p className="text-sm text-gray-600 mt-1">{incident.description || 'No description provided'}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          incident.status === 'reported' ? 'bg-city/10 text-city' :
                          incident.status === 'processing' ? 'bg-water/10 text-water' :
                          incident.status === 'verified' ? 'bg-greenspace/10 text-greenspace' :
                          incident.status === 'assigned' ? 'bg-transport/10 text-transport' :
                          incident.status === 'resolved' ? 'bg-greenspace/10 text-greenspace' :
                          'bg-transport/10 text-transport'
                        }`}>
                          {incident.status}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(incident.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))) }
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* Global footer rendered via <Footer /> component */}

      {/* Camera Overlay */}
      {showCamera && (
        <CameraOverlay onCapture={handlePhotoCapture} onClose={() => setShowCamera(false)} />
      )}

      {/* Report Issue Modal */}
      {showReportForm && (
        <ReportModal onClose={() => setShowReportForm(false)} userLocation={userLocation} />
      )}
    </div>
  );
}

// Report Modal Component
function ReportModal({ onClose, userLocation }) {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    latitude: userLocation?.latitude || '',
    longitude: userLocation?.longitude || '',
    address: ''
  });
  const [selectedLocation, setSelectedLocation] = useState(null);

  const geocodeAddress = async () => {
    if (!formData.address.trim()) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`);
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setFormData({
          ...formData,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        });
        setSelectedLocation([parseFloat(lat), parseFloat(lon)]);
      } else {
        alert('Address not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error geocoding address. Please try again.');
    }
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng
    });
    setSelectedLocation([lat, lng]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8040/api/v1/incidents/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          description: formData.description,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Incident reported successfully! ID: ${result.id}`);
        onClose();
        // Refresh incidents list
        fetchIncidents();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Failed to submit incident'}`);
      }
    } catch (error) {
      console.error('Error submitting incident:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 border border-water/20 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Report an Issue</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-water focus:border-water"
            >
              <option value="">Select category</option>
              <option value="pothole">Pothole</option>
              <option value="garbage">Garbage</option>
              <option value="streetlight">Streetlight</option>
              <option value="drainage">Drainage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-water focus:border-water" placeholder="Describe the issue..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address (optional)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-water focus:border-water"
                placeholder="Enter address to find location"
              />
              <button
                type="button"
                onClick={geocodeAddress}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Find
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location (click on map or enter coordinates)
            </label>
            <div className="h-48 w-full border border-gray-300 rounded-md mb-2">
              <ModalMap onLocationSelect={handleMapClick} selectedLocation={selectedLocation} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="any"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-water focus:border-water"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="any"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-water focus:border-water"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-water hover:bg-water/90 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}