import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
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

const catIcons = (cat) => {
  const key = (cat || 'other').toString().trim().toLowerCase();

  if (key.includes('foot') || key.includes('path')) {
    return (
      <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18" />
        <path d="M6 12v6a2 2 0 002 2h8a2 2 0 002-2v-6" />
      </svg>
    );
  }

  if (key.includes('drain')) {
    return (
      <svg className="w-5 h-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16" />
        <path d="M8 16v-6a4 4 0 018 0v6" />
      </svg>
    );
  }

  if (key.includes('water') || key.includes('leak') || key.includes('supply')) {
    return (
      <svg className="w-5 h-5 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3s4 4 4 7a4 4 0 11-8 0c0-3 4-7 4-7z" />
      </svg>
    );
  }

  if (key.includes('road') || key.includes('damage') || key.includes('carriage')) {
    return (
      <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 13l4-8 4 8 4-8 4 8" />
        <path d="M2 20h20" />
      </svg>
    );
  }

  if (key.includes('streetlight') || key.includes('light')) {
    return (
      <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a4 4 0 00-4 4c0 1.657 1.343 3 3 3h2c1.657 0 3-1.343 3-3a4 4 0 00-4-4z" />
        <path d="M12 13v6" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  if (key.includes('pothole') || key.includes('poth')) {
    return (
      <svg className="w-5 h-5 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    );
  }

  if (key.includes('garbage') || key.includes('trash') || key.includes('dustbin')) {
    return (
      <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6" />
        <path d="M10 6V4a2 2 0 012-2h0a2 2 0 012 2v2" />
      </svg>
    );
  }

  if (key.includes('sanitation') || key.includes('toilet') || key.includes('sewer')) {
    return (
      <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 00-5 5v7a5 5 0 0010 0V7a5 5 0 00-5-5z" />
        <path d="M9 21h6" />
      </svg>
    );
  }

  if (key.includes('traffic') || key.includes('signal')) {
    return (
      <svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="3" width="8" height="14" rx="2" />
        <circle cx="12" cy="7" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="17" r="1" />
      </svg>
    );
  }

  if (key.includes('infrastructure')) {
    return (
      <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <rect x="7" y="12" width="3" height="6" />
        <rect x="12" y="8" width="3" height="10" />
        <rect x="17" y="4" width="3" height="14" />
      </svg>
    );
  }

  // Default / Other
  return (
    <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z" />
      <circle cx="12" cy="9" r="2" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('recent'); // recent, stats, info

  // Check for report query param (from external link or /citizens-issue redirect)
  // This handles: https://app.civicopindia.com/?report=true
  useEffect(() => {
    // Check URL params on initial load (works even before router is ready)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('report') === 'true') {
        setShowReportForm(true);
        // Clean up the URL without triggering a page reload
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  // Also check router query (for client-side navigation)
  useEffect(() => {
    if (router.isReady && router.query.report === 'true') {
      setShowReportForm(true);
      router.replace('/', undefined, { shallow: true });
    }
  }, [router.isReady, router.query.report]);

  // Fetch incidents from Supabase
  useEffect(() => {
    fetchIncidents();
    
    // DISABLED: Realtime subscriptions were causing stale data issues
    // Old cached data from the subscription would overwrite fresh fetches
    // Using polling instead (see below)
    
    return () => {
      // No cleanup needed without subscription
    };
  }, []);

  // Poll for updates every 30 seconds instead of using realtime subscriptions
  // This prevents stale cached data from overwriting fresh fetches
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchIncidents();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  const fetchIncidents = async () => {
    try {
      // Force fresh data with cache-busting headers to get latest from primary DB
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/civic_issues?select=*&order=created_at.desc&limit=100&apikey=${supabaseKey}`,
        {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Parse lat/lng as floats to ensure proper filtering in Map component
      const parsedData = (Array.isArray(data) ? data : []).map(d => ({
        ...d,
        latitude: d.latitude != null ? parseFloat(d.latitude) : null,
        longitude: d.longitude != null ? parseFloat(d.longitude) : null,
      }));
      // Ensure incidents are sorted by created_at descending (server requests already do this, but keep client-side safeguard)
      parsedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setIncidents(parsedData);
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

  // Calculate stats
  const openCount = incidents.filter(i => i.status === 'OPEN' || !i.status).length;
  const inProgressCount = incidents.filter(i => i.status === 'IN_PROGRESS').length;
  const resolvedCount = incidents.filter(i => { const s = (i.status || '').toUpperCase(); return s === 'RESOLVED' || s === 'CLOSED'; }).length;
  const criticalCount = incidents.filter(i => i.severity >= 4).length;

  return (
    <div className="flex-1 flex flex-col h-full" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <main className="flex flex-1 overflow-hidden h-full w-full">
        <section className="flex-1 pb-0 min-h-0 h-full w-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full w-full px-3 py-3 md:px-4 md:py-3">
          {/* Map Section - Takes full width on mobile, 3 cols on desktop */}
          <div className="bg-white rounded-lg shadow-sm border flex flex-col lg:col-span-3 w-full h-full min-h-0 relative">
            <div className="px-4 pt-3 pb-2 border-b flex-shrink-0 bg-gradient-to-r from-blue-50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-base md:text-lg font-bold text-gray-900 m-0">
                    📍 Bengaluru City Overview
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                </div>
                {/* Live Stats - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded text-xs">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="font-semibold text-orange-700">{openCount}</span>
                    <span className="text-orange-600">Open</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="font-semibold text-blue-700">{inProgressCount}</span>
                    <span className="text-blue-600">WIP</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-xs">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-semibold text-green-700">{resolvedCount}</span>
                    <span className="text-green-600">Done</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden min-h-0 relative">
              <DynamicMap incidents={incidents} userLocation={userLocation} fillHeight />
              
              {/* Live Stats Overlay - Mobile only (bottom of map) */}
              <div className="md:hidden absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-lg shadow-lg p-2 z-40">
                <div className="flex items-center justify-around text-xs">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-orange-600 text-sm">{openCount}</span>
                    <span className="text-gray-500">Open</span>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-blue-600 text-sm">{inProgressCount}</span>
                    <span className="text-gray-500">In Progress</span>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-green-600 text-sm">{resolvedCount}</span>
                    <span className="text-gray-500">Resolved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:flex bg-white rounded-lg shadow-sm border flex-col w-full h-full min-h-0 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b bg-gray-50 shrink-0">
              <button 
                onClick={() => setActiveTab('recent')}
                className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === 'recent' 
                    ? 'text-blue-700 border-b-2 border-blue-600 bg-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                📋 Recent
              </button>
              <button 
                onClick={() => setActiveTab('stats')}
                className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === 'stats' 
                    ? 'text-blue-700 border-b-2 border-blue-600 bg-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                📊 Stats
              </button>
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === 'info' 
                    ? 'text-blue-700 border-b-2 border-blue-600 bg-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                ℹ️ Info
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              
              {/* RECENT TAB */}
              {activeTab === 'recent' && (
                <div className="divide-y divide-gray-100">
                  {incidents.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <div className="text-4xl mb-3">📋</div>
                      <p className="text-gray-600 font-medium">No issues reported yet</p>
                      <p className="text-xs text-gray-500 mt-1">Click the red button to report an issue</p>
                    </div>
                  ) : (
                    incidents.slice(0, 10).map((incident) => {
                      const statusColors = {
                        'OPEN': 'bg-orange-100 text-orange-700',
                        'IN_PROGRESS': 'bg-blue-100 text-blue-700',
                        'RESOLVED': 'bg-green-100 text-green-700',
                        'CLOSED': 'bg-gray-100 text-gray-700'
                      };
                      const status = (incident.status || 'OPEN').toUpperCase();
                      return (
                        <div key={incident.id} className="p-3 hover:bg-gray-50 transition">
                          <div className="flex gap-3">
                            {incident.image_url ? (
                              <img 
                                src={incident.image_url} 
                                alt={incident.category}
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-xl">
                                  {catIcons(incident.category)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1 text-[11px] text-gray-500">
                                      <div className="truncate">🕐 {new Date(incident.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                      {incident.resolved_at && (
                                        <span className="text-green-600 font-medium">✅ {Math.round((new Date(incident.resolved_at) - new Date(incident.created_at)) / (1000 * 60 * 60))}h</span>
                                      )}
                                    </div>
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                  {incident.category || 'Issue'}
                                </h4>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${statusColors[status] || statusColors['OPEN']}`}>
                                  {status === 'RESOLVED' ? '✅' : status === 'IN_PROGRESS' ? '🔧' : ''} {status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                                {incident.description || 'No description'}
                              </p>
                                    <div className="flex items-center justify-between mt-1.5">
                                      <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                                        📍 {incident.address || `${incident.latitude?.toFixed(3)}, ${incident.longitude?.toFixed(3)}`}
                                      </span>
                                    </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {incidents.length > 10 && (
                    <div className="p-3 text-center">
                      <Link href="/tickets" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        View all {incidents.length} reports →
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {/* STATS TAB */}
              {activeTab === 'stats' && (
                <div className="p-4 space-y-4">
                  {/* Status Summary */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Issue Status</h4>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="bg-orange-50 rounded-lg p-2 text-center border border-orange-100 flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center mb-1">
                          <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                          </svg>
                        </div>
                        <div className="text-xl font-semibold text-orange-600">{openCount}</div>
                        <div className="text-xs text-orange-700">Open</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100 flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center mb-1">
                          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 3v4" />
                            <path d="M10 3v4" />
                            <path d="M5 13l4 4 10-10" />
                          </svg>
                        </div>
                        <div className="text-xl font-semibold text-blue-600">{inProgressCount}</div>
                        <div className="text-xs text-blue-700">In Progress</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center border border-green-100 flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center mb-1">
                          <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                        <div className="text-xl font-semibold text-green-600">{resolvedCount}</div>
                        <div className="text-xs text-green-700">Resolved</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200 flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center mb-1">
                          <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 3v18h18" />
                            <rect x="7" y="12" width="3" height="6" />
                            <rect x="12" y="8" width="3" height="10" />
                            <rect x="17" y="4" width="3" height="14" />
                          </svg>
                        </div>
                        <div className="text-xl font-semibold text-gray-700">{incidents.length}</div>
                        <div className="text-xs text-gray-600">Total</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">By Category</h4>
                    <div className="space-y-2">
                      {Object.entries(
                        incidents.reduce((acc, i) => {
                          const cat = i.category || 'Other';
                          acc[cat] = (acc[cat] || 0) + 1;
                          return acc;
                        }, {})
                      ).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([cat, count]) => (
                        <div key={cat} className="flex items-center gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
                              <div className="w-4 h-4">
                                {catIcons(cat)}
                              </div>
                            </div>
                            <span className="text-xs text-gray-700 truncate capitalize">{cat}</span>
                          </div>

                          <div className="flex-1 mx-2">
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full"
                                style={{ width: `${Math.min((count / incidents.length) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="w-6 text-right">
                            <span className="text-xs font-semibold text-gray-700">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Resolution Rate */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Resolution Rate</span>
                      <span className="text-lg font-bold text-green-600">
                        {incidents.length > 0 ? Math.round((resolvedCount / incidents.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${incidents.length > 0 ? (resolvedCount / incidents.length) * 100 : 0}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* INFO TAB */}
              {activeTab === 'info' && (
                <div className="p-4 space-y-4">
                  {/* About Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">🏛️ About CivicOP</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      CivicOP is a citizen-powered platform for reporting and tracking civic issues in Bengaluru. 
                      Report potholes, garbage, streetlights, water leaks, and more.
                    </p>
                  </div>
                  
                  {/* How It Works */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">📱 How It Works</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                        <p className="text-xs text-gray-600">Spot a civic issue in your area</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                        <p className="text-xs text-gray-600">Click the red button to report with photo & location</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                        <p className="text-xs text-gray-600">Track status as authorities resolve the issue</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact */}
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <h4 className="text-xs font-bold text-gray-700 mb-2">📞 Contact Us</h4>
                    <div className="space-y-2 text-xs">
                      <a href="https://civicopindia.com/contact" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition">
                        <span>📧</span>
                        <span>Contact Page</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                      <a href="https://civicopindia.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition">
                        <span>🌐</span>
                        <span>civicopindia.com</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                  </div>
                  
                  {/* Quick Links */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 mb-2">🔗 Quick Links</h4>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/tickets" className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">
                        All Tickets
                      </Link>
                      <Link href="/dashboard" className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">
                        Dashboard
                      </Link>
                      <Link href="/map-view" className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">
                        Full Map
                      </Link>
                      <Link href="/governance" className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition">
                        🏛️ Governance
                      </Link>
                    </div>
                  </div>
                  
                  {/* Pilot Badge */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-3 text-center">
                    <div className="text-lg mb-1">🧪</div>
                    <div className="text-xs font-bold">Bengaluru Pilot Program</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Currently serving Bengaluru city</div>
                  </div>
                </div>
              )}
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

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[9999]" style={{ pointerEvents: 'auto' }}>
        {/* Governance Button */}
        <Link
          href="/governance"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center group"
          title="Governance Portal"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            🏛️ Governance Portal
          </span>
        </Link>
        
        {/* Report Issue Button */}
        <button
          onClick={handleReportIssue}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 group"
          title="Report an Issue"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            ⚠️ Report Issue
          </span>
        </button>
      </div>
    </div>
  );
}