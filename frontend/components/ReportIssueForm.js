import { useState, useEffect } from 'react'
import { supabase, storageHelpers } from '../lib/supabase'
import MapComponent from './MapComponent'
import { BENGALURU_WARDS, getZones } from '../lib/bengaluru_wards'

const CATEGORIES = [
  { value: 'Pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'Garbage', label: 'Garbage', icon: '🗑️' },
  { value: 'Streetlight', label: 'Streetlight', icon: '💡' },
  { value: 'Water Leak', label: 'Water Leak', icon: '💧' },
  { value: 'Road Damage', label: 'Road Damage', icon: '🚧' },
  { value: 'Other', label: 'Other', icon: '📝' },
]

export default function ReportIssueForm({ onClose, onSuccess, initialLocation }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Pothole',
    severity: 3,
    latitude: initialLocation?.latitude || null,
    longitude: initialLocation?.longitude || null,
    address: '',
    ward_number: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [geocodingLoading, setGeocodingLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // Get user location
  useEffect(() => {
    if (!formData.latitude && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }))
        },
        (error) => console.error('Error getting location:', error)
      )
    }
  }, [])

  // Check if a location is within Bengaluru bounds
  const isWithinBengaluru = (lat, lon) => {
    // Bengaluru approximate bounds
    const minLat = 12.7
    const maxLat = 13.2
    const minLng = 77.3
    const maxLng = 77.9
    return lat >= minLat && lat <= maxLat && lon >= minLng && lon <= maxLng
  }

  // Geocode address to lat/lng using OpenStreetMap Nominatim - Bengaluru only
  const handleAddressGeocode = async () => {
    if (!formData.address.trim()) {
      setError('Please enter an address')
      return
    }
    
    setGeocodingLoading(true)
    setError(null)
    
    try {
      // Search using Photon API (faster & better OSM-based geocoding than Nominatim)
      const searchQuery = `${formData.address}`
      let response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=10&lon=77.5946&lat=12.9716&zoom=12&lang=en`,
        { signal: AbortSignal.timeout(10000) }
      )
      let data = await response.json()
      
      if (data && data.features && data.features.length > 0) {
        // Photon API returns features with geometry (GeoJSON format)
        const features = data.features
        const bengaluruResults = features.filter(result => {
          const coords = result.geometry.coordinates
          const lon = coords[0], lat = coords[1]
          return isWithinBengaluru(lat, lon)
        })
        
        if (bengaluruResults.length > 0) {
          // Success: Found location in Bengaluru
          const feature = bengaluruResults[0]
          const coords = feature.geometry.coordinates
          const lon = coords[0], lat = coords[1]
          const displayName = feature.properties.name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon,
            address: displayName
          }))
          setError(null)
        } else {
          // No results in Bengaluru
          setError('❌ Location must be within Bengaluru city limits. Please enter a valid Bengaluru address or use the map to select your location.')
        }
      } else {
        // No results found
        setError('❌ Address not found. Please enter a valid Bengaluru address or use the map to select your location.')
      }
    } catch (err) {
      console.error('Geocoding error:', err)
      setError('⚠️ Could not reach location service. Please use the map to select your location in Bengaluru.')
    } finally {
      setGeocodingLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          
          if (isWithinBengaluru(lat, lon)) {
            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lon,
            }))
            setError(null)
          } else {
            setError('❌ Your location is outside Bengaluru. Please move to Bengaluru or use the address search to find a valid location.')
          }
          setLoading(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setError('Could not get your location. Please use the address search or map to select a location in Bengaluru.')
          setLoading(false)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser. Please use the address search or map to select your location in Bengaluru.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Please provide a title')
      }
      if (!formData.description.trim()) {
        throw new Error('Please provide a description')
      }
      if (!formData.latitude || !formData.longitude) {
        throw new Error('Please set your location')
      }
      
      // Validate location is in Bengaluru
      if (!isWithinBengaluru(formData.latitude, formData.longitude)) {
        throw new Error('\u274c Location must be within Bengaluru city limits. Please select a valid location using the map or address search.')
      }

      let imageUrl = null

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `public/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('civic-issue-images')
          .upload(filePath, imageFile, {
            cacheControl: '0',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('civic-issue-images')
          .getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      // Insert into database
      const { data, error: insertError } = await supabase
        .from('civic_issues')
        .insert([{
          title: formData.title,
          description: formData.description,
          category: formData.category,
          severity: formData.severity,
          latitude: formData.latitude,
          longitude: formData.longitude,
          image_url: imageUrl,
          address: formData.address || null,
          ward_number: formData.ward_number || null,
          status: 'OPEN'
        }])
        .select()

      if (insertError) throw insertError

      // Success!
      if (onSuccess) {
        onSuccess(data[0])
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Pothole',
        severity: 3,
        latitude: null,
        longitude: null,
        address: '',
        ward_number: '',
      })
      setImageFile(null)
      setImagePreview(null)
      
      if (onClose) onClose()

    } catch (err) {
      console.error('Error submitting issue:', err)
      setError(err.message || 'Failed to submit issue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-4 max-h-[calc(100vh-5rem)] overflow-y-auto" role="dialog" aria-modal="true">
        {/* Header with Pilot Badge */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                🧪 Bengaluru Pilot
              </span>
            </div>
            <p className="text-xs text-blue-700 font-medium mt-2">📍 Bengaluru City Only - This is a pilot program currently live in Bengaluru</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-10">
          {/* Bengaluru Restriction Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-xl mt-0.5">🔵</span>
            <div>
              <p className="text-sm font-medium text-blue-900">Report Issues in Bengaluru Only</p>
              <p className="text-xs text-blue-700 mt-1">Please note: This platform is currently available only for reporting civic issues within Bengaluru city limits. If your location is outside Bengaluru, please try again from within the city.</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo (Optional)
            </label>
            {imagePreview ? (
              <div className="relative border-2 border-gray-300 rounded-lg p-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto h-64 w-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Camera Capture */}
                <label className="flex flex-col items-center justify-center px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-400 transition">
                  <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Take Photo</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                  />
                </label>
                
                {/* Browse File */}
                <label className="flex flex-col items-center justify-center px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-400 transition">
                  <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Browse</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 text-center">PNG, JPG, WEBP up to 5MB</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`p-3 rounded-lg border-2 transition ${
                    formData.category === cat.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-sm font-medium">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief title for the issue (e.g., Large pothole on Main Street)"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the issue in detail..."
              required
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity: {formData.severity}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>Critical</span>
            </div>
          </div>

          {/* Address & Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address (e.g., MG Road, Whitefield, Indiranagar)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddressGeocode}
                disabled={geocodingLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
              >
                {geocodingLoading ? 'Locating...' : 'Find Location'}
              </button>
            </div>
            
            {/* Location Selection Options */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              {/* Current Location Button */}
              <button
                type="button"
                onClick={handleLocationClick}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                My Location
              </button>
              
              {/* Select on Map Button */}
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 003 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6.553 3.276A1 1 0 0021 19.382V8.618a1 1 0 00-1.447-.894L15 10m0 0V5m0 8v8m6-6V5m0 8v8" />
                </svg>
                Select on Map
              </button>
            </div>
            
            {formData.latitude && formData.longitude && (
              <p className="mt-2 text-sm text-green-600 text-center">
                ✓ Location set: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </p>
            )}
          </div>
          
          {/* Ward Selection (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ward Number <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.ward_number}
              onChange={(e) => setFormData({ ...formData, ward_number: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Your Ward</option>
              {getZones().map(zone => (
                <optgroup key={zone} label={`${zone} Zone`}>
                  {BENGALURU_WARDS.filter(w => w.zone === zone).map(ward => (
                    <option key={ward.number} value={`Ward ${ward.number}`}>
                      Ward {ward.number} - {ward.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the ward where the issue is located. 
              <a 
                href="https://bbmp.gov.in/ward-details" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Find your ward →
              </a>
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !formData.latitude || !formData.ward_number}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>

      {/* Map Selection Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Select Location on Map</h3>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content with Map */}
            <div className="flex-1 overflow-y-auto">
              <MapComponent
                onLocationSelect={(lat, lon) => {
                  setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lon,
                    address: `${lat.toFixed(6)}, ${lon.toFixed(6)}`
                  }))
                  setShowMap(false)
                  setError(null)
                }}
                selectedLocation={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : null}
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
