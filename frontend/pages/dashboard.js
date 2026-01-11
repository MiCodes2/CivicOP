import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIncidents();

    // Real-time subscription
    const sub = supabase
      .channel('civic_issues_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'civic_issues' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIncidents(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          // Ensure ID comparison is robust to string/number types
          setIncidents(prev => prev.map(inc => String(inc.id) === String(payload.new.id) ? payload.new : inc));
        } else if (payload.eventType === 'DELETE') {
          setIncidents(prev => prev.filter(inc => inc.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { sub.unsubscribe(); };
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const openCount = incidents.filter(i => i.status === 'OPEN' || !i.status).length;
    const inProgressCount = incidents.filter(i => i.status === 'IN_PROGRESS').length;
    const resolvedCount = incidents.filter(i => { const s = (i.status || '').toUpperCase(); return s === 'RESOLVED' || s === 'CLOSED'; }).length;
    const resolutionRate = incidents.length > 0 ? Math.round((resolvedCount / incidents.length) * 100) : 0;
    
    // Calculate average resolution time (in hours)
    const resolvedWithTime = incidents.filter(i => {
      const s = (i.status || '').toUpperCase();
      return (s === 'RESOLVED' || s === 'CLOSED') && i.resolved_at && i.created_at;
    });
    const avgResolutionTime = resolvedWithTime.length > 0
      ? Math.round(resolvedWithTime.reduce((sum, i) => 
          sum + (new Date(i.resolved_at) - new Date(i.created_at)) / (1000 * 60 * 60), 0
        ) / resolvedWithTime.length)
      : 0;
    
    const categories = incidents.reduce((acc, i) => {
      const cat = i.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    const today = new Date().toDateString();
    const todayCount = incidents.filter(i => new Date(i.created_at).toDateString() === today).length;
    
    // Calculate weekly trend (last 7 days)
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toDateString();
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      const count = incidents.filter(inc => new Date(inc.created_at).toDateString() === dateStr).length;
      return { day: dayLabel, count, date: date.getDate() };
    });
    const maxWeeklyCount = Math.max(...weeklyTrend.map(d => d.count), 1);
    
    return { openCount, inProgressCount, resolvedCount, resolutionRate, categories, todayCount, weeklyTrend, maxWeeklyCount, avgResolutionTime };
  }, [incidents]);

  const recentIncidents = incidents.slice(0, 5);
  const statusColors = { 'OPEN': 'bg-orange-100 text-orange-700', 'IN_PROGRESS': 'bg-blue-100 text-blue-700', 'RESOLVED': 'bg-green-100 text-green-700', 'CLOSED': 'bg-gray-100 text-gray-700' };

  // Resolve category to an inline SVG icon (case-insensitive, substring matching)
  function getCatIcon(category) {
    const cat = (category || '').toString().trim();
    if (!cat) {
      return (
        <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z" />
          <circle cx="12" cy="9" r="2" />
        </svg>
      );
    }

    const key = cat.toLowerCase();

    if (key.includes('pothole') || key.includes('poth')) {
      return (
        <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    }
    if (key.includes('garbage') || key.includes('dustbin') || key.includes('trash')) {
      return (
        <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6" />
          <path d="M10 6V4a2 2 0 012-2h0a2 2 0 012 2v2" />
        </svg>
      );
    }
    if (key.includes('streetlight') || key.includes('street light') || key.includes('light')) {
      return (
        <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a4 4 0 00-4 4c0 1.657 1.343 3 3 3h2c1.657 0 3-1.343 3-3a4 4 0 00-4-4z" />
          <path d="M12 13v6" />
          <path d="M10 21h4" />
        </svg>
      );
    }
    if (key.includes('water') || key.includes('leak') || key.includes('supply')) {
      return (
        <svg className="w-6 h-6 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3s4 4 4 7a4 4 0 11-8 0c0-3 4-7 4-7z" />
        </svg>
      );
    }
    if (key.includes('road') || key.includes('damage') || key.includes('carriage')) {
      return (
        <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 13l4-8 4 8 4-8 4 8" />
          <path d="M2 20h20" />
        </svg>
      );
    }
    if (key.includes('drain') || key.includes('drainage')) {
      return (
        <svg className="w-6 h-6 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20h16" />
          <path d="M8 16v-6a4 4 0 018 0v6" />
        </svg>
      );
    }
    if (key.includes('foot') || key.includes('path')) {
      return (
        <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18" />
          <path d="M6 12v6a2 2 0 002 2h8a2 2 0 002-2v-6" />
        </svg>
      );
    }
    if (key.includes('sanitation') || key.includes('toilet') || key.includes('sewer')) {
      return (
        <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a5 5 0 00-5 5v7a5 5 0 0010 0V7a5 5 0 00-5-5z" />
          <path d="M9 21h6" />
        </svg>
      );
    }
    if (key.includes('traffic') || key.includes('signal')) {
      return (
        <svg className="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="3" width="8" height="14" rx="2" />
          <circle cx="12" cy="7" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="17" r="1" />
        </svg>
      );
    }

    // Default pin marker
    return (
      <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z" />
        <circle cx="12" cy="9" r="2" />
      </svg>
    );
  }

  // Donut chart calculations with enhanced colors
  const total = incidents.length || 1;
  const donutSegments = [
    { label: 'Open', count: stats.openCount, color: '#f97316', gradient: 'from-orange-500 to-orange-600', percent: (stats.openCount / total) * 100, icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M8 9h8" />
      </svg>
    ) },
    { label: 'In Progress', count: stats.inProgressCount, color: '#3b82f6', gradient: 'from-blue-500 to-blue-600', percent: (stats.inProgressCount / total) * 100, icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3v4" />
        <path d="M10 3v4" />
        <path d="M5 13l4 4 10-10" />
      </svg>
    ) },
    { label: 'Resolved', count: stats.resolvedCount, color: '#22c55e', gradient: 'from-green-500 to-green-600', percent: (stats.resolvedCount / total) * 100, icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ) },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-600 mt-0.5">Visualize civic issue trends for Bengaluru</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                LIVE
              </span>
              <button onClick={fetchIncidents} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition" title="Refresh">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="mb-3">
              <svg className="animate-spin w-10 h-10 text-gray-400 mx-auto" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">
              <svg className="w-10 h-10 text-red-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Issues</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{incidents.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"> 
                    <svg className="w-6 h-6 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18" />
                      <rect x="7" y="12" width="3" height="6" />
                      <rect x="12" y="8" width="3" height="10" />
                      <rect x="17" y="4" width="3" height="14" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">+{stats.todayCount} today</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Open</p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-600 mt-1">{stats.openCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="2" width="6" height="4" rx="1" />
                      <path d="M9 6v14a2 2 0 002 2h2a2 2 0 002-2V6" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Awaiting action</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-1">{stats.inProgressCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.7 9.3a6 6 0 11-5.4 5.4" />
                      <path d="M21 15v4h-4" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Being resolved</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1">{stats.resolvedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{stats.resolutionRate}% resolution rate</p>
              </div>
            </div>

            {/* Average Resolution Time Card */}
            {stats.avgResolutionTime > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-sm border-2 border-purple-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider flex items-center gap-2">
                      <span className="inline-flex">
                        <svg className="w-4 h-4 text-purple-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      </span>
                      <span>Avg Resolution Time</span>
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        {stats.avgResolutionTime}
                      </p>
                      <span className="text-lg font-semibold text-purple-600">hours</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-2 font-medium flex items-center gap-2">
                      <svg className="w-3 h-3 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18" />
                        <rect x="7" y="12" width="3" height="6" />
                      </svg>
                      <span>Based on {incidents.filter(i => i.resolved_at).length} resolved issues</span>
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" />
                      <path d="M12 8v5l3 2" stroke="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Weekly Trend Chart */}
              <div className="bg-white rounded-xl shadow-sm border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">📈 Weekly Trend</h3>
                  <span className="text-[10px] text-gray-500">Last 7 days</span>
                </div>
                <div className="h-48 flex items-end gap-2">
                  {stats.weeklyTrend.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-gray-700">{day.count}</span>
                      <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '140px' }}>
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500"
                          style={{ height: `${(day.count / stats.maxWeeklyCount) * 100}%`, minHeight: day.count > 0 ? '8px' : '0' }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium">{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Distribution Donut */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span>
                      <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </span>
                    <span>Status Distribution</span>
                  </h3>
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-semibold">{incidents.length} total</span>
                </div>
                <div className="flex items-center gap-6">
                  {/* SVG Donut Chart with Glow Effect */}
                  <div className="relative w-36 h-36 flex-shrink-0">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-200 via-blue-200 to-green-200 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 relative z-10">
                      {/* Background circle */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                      
                      {/* Segments with enhanced styling */}
                      {(() => {
                        let cumulativePercent = 0;
                        return donutSegments.map((seg, idx) => {
                          const strokeDasharray = `${seg.percent} ${100 - seg.percent}`;
                          const strokeDashoffset = -cumulativePercent;
                          cumulativePercent += seg.percent;
                          return (
                            <circle
                              key={idx}
                              cx="18" cy="18" r="15.915"
                              fill="none"
                              stroke={seg.color}
                              strokeWidth="4"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              className="transition-all duration-700 ease-out hover:stroke-width-5"
                              style={{
                                filter: `drop-shadow(0 0 3px ${seg.color}40)`,
                              }}
                            />
                          );
                        });
                      })()}
                    </svg>
                    
                    {/* Center content with gradient background */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-center">
                        <span className="text-3xl font-black bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent">
                          {stats.resolutionRate}%
                        </span>
                        <span className="block text-[10px] text-gray-500 font-semibold mt-0.5">Resolved</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Legend with icons */}
                  <div className="flex-1 space-y-3">
                    {donutSegments.map((seg, idx) => (
                      <div key={idx} className="group hover:scale-105 transition-transform duration-200">
                        <div className="flex items-center gap-3 mb-1.5">
                          <div 
                            className="w-4 h-4 rounded-full shadow-md transition-all duration-300 group-hover:scale-125" 
                            style={{ 
                              backgroundColor: seg.color,
                              boxShadow: `0 0 8px ${seg.color}60`
                            }}
                          ></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-700 font-semibold flex items-center gap-1">
                                <span>{seg.icon}</span>
                                <span>{seg.label}</span>
                              </span>
                              <span className="text-sm font-bold text-gray-900">{seg.count}</span>
                            </div>
                          </div>
                        </div>
                        {/* Progress bar with gradient */}
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${seg.gradient} transition-all duration-700 ease-out shadow-sm`}
                            style={{ 
                              width: `${seg.percent}%`,
                              boxShadow: `0 0 6px ${seg.color}60`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Category Breakdown with horizontal bars */}
                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    <svg className="inline w-4 h-4 mr-2 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18" />
                      <rect x="7" y="12" width="3" height="6" />
                    </svg>
                    Issues by Category
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.categories).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([cat, count], idx) => {
                      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">{getCatIcon(cat)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{cat}</span>
                              <span className="text-sm font-bold text-gray-900">{count} <span className="text-gray-400 font-normal">({Math.round((count / incidents.length) * 100)}%)</span></span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className={`${colors[idx % colors.length]} h-2 rounded-full transition-all duration-500`} style={{width: `${Math.min((count / incidents.length) * 100, 100)}%`}}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 text-white">
                  <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link href="/" className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
                      <svg className="w-6 h-6 mb-1 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 10l9-7 9 7" />
                        <path d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" />
                      </svg>
                      <span className="text-xs font-medium">Home</span>
                    </Link>
                    <Link href="/tickets" className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
                      <svg className="w-6 h-6 mb-1 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="10" rx="2" />
                        <path d="M7 7v10" />
                      </svg>
                      <span className="text-xs font-medium">All Tickets</span>
                    </Link>
                    <Link href="/map-view" className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
                      <svg className="w-6 h-6 mb-1 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6l7-3 7 3 7-3v13l-7 3-7-3-7 3V6z" />
                      </svg>
                      <span className="text-xs font-medium">Full Map</span>
                    </Link>
                    <Link href="/governance" className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
                      <svg className="w-6 h-6 mb-1 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 11h18" />
                        <path d="M5 11v6" />
                        <path d="M19 11v6" />
                        <path d="M12 3v8" />
                      </svg>
                      <span className="text-xs font-medium">Governance</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Recent Reports</h3>
                    <Link href="/tickets" className="text-xs text-blue-600 hover:text-blue-800 font-medium">View all →</Link>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {recentIncidents.length === 0 ? (
                      <div className="p-6 text-center"><span className="text-3xl">📭</span><p className="text-sm text-gray-500 mt-2">No reports yet</p></div>
                    ) : recentIncidents.map((incident) => {
                      const status = (incident.status || 'OPEN').toUpperCase();
                      return (
                        <div key={incident.id} className="p-4 hover:bg-gray-50 transition">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">{getCatIcon(incident.category)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-medium text-gray-900 truncate">{incident.category || 'Issue'}</h4>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${statusColors[status] || statusColors['OPEN']}`}>{status}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{incident.description || 'No description'}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{new Date(incident.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">About This Dashboard</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">This analytics dashboard visualizes civic issue trends with interactive charts. Track resolution progress, category distribution, and weekly patterns.</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Data refreshes in real-time</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-center text-white">
                  <div className="mb-1">
                    <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 2v6" />
                      <path d="M16 2v6" />
                      <path d="M6 8h12l-1 6a4 4 0 01-4 4H11a4 4 0 01-4-4L6 8z" />
                    </svg>
                  </div>
                  <div className="text-sm font-bold">Bengaluru Pilot</div>
                  <div className="text-[10px] opacity-80 mt-0.5">Currently serving Bengaluru city</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
