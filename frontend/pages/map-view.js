import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const DynamicMap = dynamic(() => import('../components/Map'), { ssr: false });

export default function MapView() {
  const [incidents, setIncidents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    fetchIncidents();
    
    const subscription = supabase
      .channel('civic_issues_mapview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'civic_issues' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIncidents(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setIncidents(prev => prev.map(inc => inc.id === payload.new.id ? payload.new : inc));
        } else if (payload.eventType === 'DELETE') {
          setIncidents(prev => prev.filter(inc => inc.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { subscription.unsubscribe(); };
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        },
        () => {}
      );
    }
  }, []);

  const stats = useMemo(() => {
    const openCount = incidents.filter(i => (i.status || 'OPEN').toUpperCase() === 'OPEN').length;
    const inProgressCount = incidents.filter(i => (i.status || '').toUpperCase() === 'IN_PROGRESS').length;
    const resolvedCount = incidents.filter(i => ['RESOLVED', 'CLOSED'].includes((i.status || '').toUpperCase())).length;
    const criticalCount = incidents.filter(i => i.severity >= 4).length;
    return { openCount, inProgressCount, resolvedCount, criticalCount };
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    if (statusFilter === 'all') return incidents;
    if (statusFilter === 'open') return incidents.filter(i => (i.status || 'OPEN').toUpperCase() === 'OPEN');
    if (statusFilter === 'in_progress') return incidents.filter(i => (i.status || '').toUpperCase() === 'IN_PROGRESS');
    if (statusFilter === 'resolved') return incidents.filter(i => ['RESOLVED', 'CLOSED'].includes((i.status || '').toUpperCase()));
    return incidents;
  }, [incidents, statusFilter]);

  const filterButtons = [
    { key: 'all', label: 'All', count: incidents.length, color: 'bg-gray-600' },
    { key: 'open', label: 'Open', count: stats.openCount, color: 'bg-orange-500' },
    { key: 'in_progress', label: 'In Progress', count: stats.inProgressCount, color: 'bg-blue-500' },
    { key: 'resolved', label: 'Resolved', count: stats.resolvedCount, color: 'bg-green-500' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 w-full relative">
      {/* Full-screen map */}
      <div className="flex-1 min-h-0 w-full" style={{ margin: 0, marginTop: `calc(-1 * var(--app-header-height))` }}>
        <div className="h-full w-full overflow-hidden relative">
          {loading ? (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">🗺️</div>
                <p className="text-gray-600 font-medium">Loading map...</p>
                <p className="text-sm text-gray-500 mt-1">Fetching civic issues data</p>
              </div>
            </div>
          ) : (
            <DynamicMap incidents={filteredIncidents} userLocation={userLocation} fillHeight />
          )}
        </div>
      </div>

      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2 pointer-events-auto flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-700 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="h-6 w-px bg-gray-200"></div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Bengaluru Map View</h1>
            <p className="text-[10px] text-gray-500">Live civic issues tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-100/95 backdrop-blur-sm text-green-700 text-xs font-bold rounded-full shadow">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            LIVE
          </span>
          <button onClick={fetchIncidents} className="p-2 bg-white/95 backdrop-blur-sm text-gray-600 hover:text-gray-800 rounded-lg shadow transition" title="Refresh">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="absolute top-20 left-4 right-4 z-40 flex justify-center pointer-events-none">
        <div className="inline-flex bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-1 gap-1 pointer-events-auto overflow-x-auto max-w-full">
          {filterButtons.map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${statusFilter === f.key ? `${f.color} text-white` : 'text-gray-600 hover:bg-gray-100'}`}>
              <span>{f.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusFilter === f.key ? 'bg-white/20' : 'bg-gray-100'}`}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Panel - Bottom Left */}
      <div className="hidden md:block absolute bottom-6 left-6 z-40">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden w-64">
          <div className="px-4 py-3 border-b bg-gray-50/50 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Map Summary</span>
            <span className="text-[10px] text-gray-500">{filteredIncidents.length} shown</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📊</div>
                <span className="text-xs text-gray-600">Total Issues</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{incidents.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="text-sm font-bold text-orange-600">{stats.openCount}</div>
                <div className="text-[9px] text-orange-700">Open</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-sm font-bold text-blue-600">{stats.inProgressCount}</div>
                <div className="text-[9px] text-blue-700">Progress</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-sm font-bold text-green-600">{stats.resolvedCount}</div>
                <div className="text-[9px] text-green-700">Resolved</div>
              </div>
            </div>
            {stats.criticalCount > 0 && (
              <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <span className="text-xs text-red-700">⚠️ Critical Issues</span>
                <span className="text-sm font-bold text-red-600">{stats.criticalCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend - Bottom Right */}
      <div className="hidden md:block absolute bottom-6 right-6 z-40">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
          <button onClick={() => setShowLegend(!showLegend)} className="w-full px-4 py-2 border-b bg-gray-50/50 flex items-center justify-between text-sm font-semibold text-gray-900">
            <span>Legend</span>
            <svg className={`w-4 h-4 text-gray-500 transition ${showLegend ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showLegend && (
            <div className="p-4 space-y-3">
              <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-600">Open</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Resolved</span>
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">Severity</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">Critical (4-5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                    <span className="text-gray-600">Medium (3)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-gray-600">Low (1-2)</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-white shadow"></div>
                  <span className="text-gray-600">Your Location</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden absolute bottom-4 left-4 right-4 z-40">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2">
              <div className="text-lg font-bold text-gray-900">{incidents.length}</div>
              <div className="text-[9px] text-gray-500">Total</div>
            </div>
            <div className="p-2">
              <div className="text-lg font-bold text-orange-600">{stats.openCount}</div>
              <div className="text-[9px] text-gray-500">Open</div>
            </div>
            <div className="p-2">
              <div className="text-lg font-bold text-blue-600">{stats.inProgressCount}</div>
              <div className="text-[9px] text-gray-500">Progress</div>
            </div>
            <div className="p-2">
              <div className="text-lg font-bold text-green-600">{stats.resolvedCount}</div>
              <div className="text-[9px] text-gray-500">Resolved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
