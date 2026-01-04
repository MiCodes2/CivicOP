import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

// Dynamically import map to avoid SSR issues
const DynamicMap = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="h-[411px] md:h-[694px] bg-gray-200 rounded-lg flex items-center justify-center">Loading map...</div>
});

// Dynamic import for report form
const ReportIssueForm = dynamic(() => import('../components/ReportIssueForm'), {
  ssr: false,
});

import CameraOverlay from '../components/CameraOverlay';

export default function Home() {
  const [incidents, setIncidents] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Fetch incidents from Supabase
  useEffect(() => {
    fetchIncidents();
    
    // Set up real-time subscription
    const sub1 = supabase
      .channel('civic_issues_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'civic_issues' 
      }, (payload) => {
        console.log('Real-time update (civic_issues):', payload);
        if (payload.eventType === 'INSERT') {
          setIncidents(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setIncidents(prev => prev.map(inc => inc.id === payload.new.id ? payload.new : inc));
        } else if (payload.eventType === 'DELETE') {
          setIncidents(prev => prev.filter(inc => inc.id !== payload.old.id));
        }
      })
      .subscribe();

    let sub2 = null;
    import('../lib/supabase_helpers').then(({ tableExists }) => {
      tableExists('incidents').then(available => {
        if (!available) return
        sub2 = supabase
          .channel('incidents_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
            console.log('Real-time update (incidents):', payload);
            if (payload.eventType === 'INSERT') {
              setIncidents(prev => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setIncidents(prev => prev.map(inc => inc.id === payload.new.id ? payload.new : inc));
            } else if (payload.eventType === 'DELETE') {
              setIncidents(prev => prev.filter(inc => inc.id !== payload.old.id));
            }
          })
          .subscribe()
      })
    })

    return () => {
      sub1.unsubscribe();
      if (sub2) sub2.unsubscribe();
    };
  }, []);

  const fetchIncidents = async () => {
    try {
      // Force fresh data - add timestamp to bypass any caching
      const timestamp = new Date().getTime();
      const { data, error } = await supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
        .throwOnError();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched incidents:', data?.length, 'at', new Date().toISOString());
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidents([]);
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
    setShowReportForm(true);
  };

  const handleReportSuccess = (newIssue) => {
    console.log('Issue reported successfully:', newIssue);
    // The real-time subscription will handle adding it to the list
    setShowReportForm(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <main className="flex flex-1 overflow-hidden h-full w-full">
        <section className="flex-1 pb-0 min-h-0 h-full w-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full w-full px-3 py-3 md:px-4 md:py-3">
          {/* Map Section - Takes full width on mobile, 2.5 cols on desktop */}
          <div className="bg-white rounded-lg shadow-sm border flex flex-col lg:col-span-3 w-full h-full min-h-0">
            <div className="px-4 pt-3 pb-2 border-b flex-shrink-0 bg-gradient-to-r from-blue-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base md:text-lg font-bold text-gray-900 m-0 flex items-center gap-2">
                    📍 Bengaluru City Overview
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      🟢 {incidents.length}
                    </span>
                  </h2>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
              <DynamicMap incidents={incidents} userLocation={userLocation} fillHeight pulseColor="#10B981" />
            </div>
          </div>

          {/* Recent Incidents List - Hidden on mobile */}
          <div className="hidden lg:flex bg-white rounded-lg shadow-sm border flex-col w-full h-full min-h-0">
            {/* Bengaluru Pilot Banner - Above Recent Reports */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-medium">
              <span>🧪 Bengaluru Pilot</span>
            </div>
            <div className="px-4 py-2 border-b flex-shrink-0">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 m-0">Recent Reports</h3>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="divide-y divide-gray-200">
                {incidents.length === 0 ? (
                  <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-600 font-medium">No issues reported yet</p>
                    <p className="text-xs text-gray-500 mt-1">Click the red button to report an issue</p>
                  </div>
                ) : (
                  incidents.map((incident) => (
                    <div key={incident.id} className="p-4 hover:bg-gray-50 transition border-b last:border-b-0">
                      <div className="flex justify-between items-start gap-3">
                        {incident.image_url && (
                          <img 
                            src={incident.image_url} 
                            alt={incident.category}
                            className="w-16 h-16 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {incident.category || 'Issue'}
                            </h4>
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                              incident.severity >= 4 ? 'bg-red-100 text-red-800' :
                              incident.severity === 3 ? 'bg-orange-100 text-orange-800' :
                              incident.severity === 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {incident.severity ? `${incident.severity}/5` : '3/5'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {incident.description || 'No description provided'}
                          </p>
                          {/* Location and Ward */}
                          {(incident.address || incident.ward_number || incident.latitude) && (
                            <div className="mt-1 text-xs text-gray-500 flex flex-col gap-0.5">
                              {incident.address && (
                                <span className="truncate" title={incident.address}>
                                  📍 {incident.address}
                                </span>
                              )}
                              {!incident.address && incident.latitude && (
                                <span>
                                  📍 {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                                </span>
                              )}
                              {incident.ward_number && (
                                <span>🏛️ {incident.ward_number}</span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              incident.status === 'OPEN' ? 'bg-orange-50 text-orange-700' :
                              incident.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                              incident.status === 'RESOLVED' ? 'bg-green-50 text-green-700' :
                              incident.status === 'CLOSED' ? 'bg-gray-50 text-gray-700' :
                              'bg-orange-50 text-orange-700'
                            }`}>
                              {incident.status || 'OPEN'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(incident.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* Report Issue Form Modal */}
      {showReportForm && (
        <ReportIssueForm
          onClose={() => setShowReportForm(false)}
          onSuccess={handleReportSuccess}
          initialLocation={userLocation}
        />
      )}

      {/* Floating Report Button */}
      <button
        onClick={handleReportIssue}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-[9999]"
        title="Report an Issue"
        style={{ pointerEvents: 'auto' }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </button>
    </div>
  );
}