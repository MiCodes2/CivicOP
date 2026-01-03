import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabase';

const DynamicMap = dynamic(() => import('../components/Map'), { ssr: false });

export default function MapView() {
  const [incidents, setIncidents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch incidents from Supabase
  useEffect(() => {
    fetchIncidents();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('civic_issues_mapview')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'civic_issues' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIncidents(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setIncidents(prev => prev.map(inc => inc.id === payload.new.id ? payload.new : inc));
        } else if (payload.eventType === 'DELETE') {
          setIncidents(prev => prev.filter(inc => inc.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 w-full relative">
      {/* Full-screen map */}
      <div className="flex-1 min-h-0 w-full" style={{ margin: 0, marginTop: `calc(-1 * var(--app-header-height))` }}>
        <div className="h-full w-full overflow-hidden relative">
          {loading ? (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">🗺️</div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : (
            <DynamicMap incidents={incidents} userLocation={userLocation} fillHeight />
          )}
        </div>
      </div>

      {/* Stats Panel - Floating bottom-left */}
      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 max-w-xs z-40">
        <div className="text-sm font-semibold text-gray-900 mb-3">Map Summary</div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Issues:</span>
            <span className="font-bold text-gray-900">{incidents.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Open:</span>
            <span className="font-bold text-orange-600">{incidents.filter(i => i.status === 'OPEN').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">In Progress:</span>
            <span className="font-bold text-blue-600">{incidents.filter(i => i.status === 'IN_PROGRESS').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Resolved:</span>
            <span className="font-bold text-green-600">{incidents.filter(i => i.status === 'RESOLVED').length}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
            <span className="text-gray-600">Critical Issues:</span>
            <span className="font-bold text-red-600">{incidents.filter(i => i.severity >= 4).length}</span>
          </div>
        </div>
      </div>

      {/* Legend - Floating top-right */}
      <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg p-4 max-w-xs z-40">
        <div className="text-sm font-semibold text-gray-900 mb-3">Severity Legend</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Critical (4-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-400"></div>
            <span className="text-gray-600">Medium (3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-300"></div>
            <span className="text-gray-600">Minor (2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Low (1)</span>
          </div>
          <div className="flex items-center gap-2 border-t border-gray-200 pt-2 mt-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" style={{boxShadow: '0 0 0 2px white'}}></div>
            <span className="text-gray-600">Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
}
