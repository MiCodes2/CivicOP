import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Tickets() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState(null);
  const highlightedRef = useRef(null);

  // Handle highlight query parameter from search
  useEffect(() => {
    if (router.query.highlight) {
      setHighlightedId(router.query.highlight);
      // Clear highlight after 5 seconds
      const timer = setTimeout(() => setHighlightedId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [router.query.highlight]);

  // Scroll to highlighted ticket
  useEffect(() => {
    if (highlightedId && highlightedRef.current && !loading) {
      highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedId, loading]);

  useEffect(() => {
    fetchTickets();
    
    const subscription = supabase
      .channel('civic_issues_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'civic_issues' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTickets(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTickets(prev => prev.map(t => String(t.id) === String(payload.new.id) ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTickets(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTickets(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    return tickets.reduce((acc, t) => { 
      const status = (t.status || 'OPEN').toUpperCase();
      acc[status] = (acc[status] || 0) + 1; 
      return acc; 
    }, {});
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (activeFilter !== 'all') {
      result = result.filter(t => (t.status || 'OPEN').toUpperCase() === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        (t.category || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.address || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [tickets, activeFilter, searchQuery]);

  const getCatIcon = (cat) => {
    if (!cat) return (
      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z" /><circle cx="12" cy="9" r="2" fill="currentColor" /></svg>
    );
    const key = String(cat).trim().toLowerCase();
    if (key.includes('pothole') || key.includes('poth')) return <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>;
    if (key.includes('garbage') || key.includes('trash')) return <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6" /><path d="M10 6V4a2 2 0 012-2h0a2 2 0 012 2v2" /></svg>;
    if (key.includes('streetlight') || key.includes('light')) return <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a4 4 0 00-4 4c0 1.657 1.343 3 3 3h2c1.657 0 3-1.343 3-3a4 4 0 00-4-4z" /><path d="M12 13v6" /><path d="M10 21h4" /></svg>;
    if (key.includes('water') || key.includes('leak') || key.includes('supply')) return <svg className="w-5 h-5 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3s4 4 4 7a4 4 0 11-8 0c0-3 4-7 4-7z" /></svg>;
    if (key.includes('road') || key.includes('damage')) return <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 13l4-8 4 8 4-8 4 8" /><path d="M2 20h20" /></svg>;
    if (key.includes('drain')) return <svg className="w-5 h-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16" /><path d="M8 16v-6a4 4 0 018 0v6" /></svg>;
    if (key.includes('foot') || key.includes('path')) return <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18" /><path d="M6 12v6a2 2 0 002 2h8a2 2 0 002-2v-6" /></svg>;
    if (key.includes('sanitation') || key.includes('sewer')) return <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 00-5 5v7a5 5 0 0010 0V7a5 5 0 00-5-5z" /><path d="M9 21h6" /></svg>;
    if (key.includes('traffic') || key.includes('signal')) return <svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="3" width="8" height="14" rx="2" /><circle cx="12" cy="7" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="17" r="1" /></svg>;
    return (
      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z" /><circle cx="12" cy="9" r="2" fill="currentColor" /></svg>
    );
  };
  const statusColors = { 'OPEN': 'bg-orange-100 text-orange-700 border-orange-200', 'IN_PROGRESS': 'bg-blue-100 text-blue-700 border-blue-200', 'RESOLVED': 'bg-green-100 text-green-700 border-green-200', 'CLOSED': 'bg-gray-100 text-gray-600 border-gray-200' };
  const severityColors = ['bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700', 'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700', 'bg-red-200 text-red-800'];

  const filters = [
    { key: 'all', label: 'All', icon: '📋', count: tickets.length },
    { key: 'OPEN', label: 'Open', icon: '📌', count: counts.OPEN || 0 },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: '🔧', count: counts.IN_PROGRESS || 0 },
    { key: 'RESOLVED', label: 'Resolved', icon: '✅', count: counts.RESOLVED || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Public Tickets</h1>
              <p className="text-sm text-gray-600 mt-0.5">Browse all reported civic issues in Bengaluru</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                LIVE
              </span>
              <button onClick={fetchTickets} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition" title="Refresh">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.map(f => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${activeFilter === f.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>
              <span>{f.icon}</span>
              <span className="hidden sm:inline">{f.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${activeFilter === f.key ? 'bg-blue-500' : 'bg-gray-100'}`}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by category, description, or location..." className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">📊</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                <p className="text-xs text-gray-500">Total Issues</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-xl">📌</div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{counts.OPEN || 0}</p>
                <p className="text-xs text-gray-500">Open</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">🔧</div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{counts.IN_PROGRESS || 0}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">✅</div>
              <div>
                <p className="text-2xl font-bold text-green-600">{counts.RESOLVED || 0}</p>
                <p className="text-xs text-gray-500">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredTickets.length}</span> {filteredTickets.length === 1 ? 'issue' : 'issues'}
            {activeFilter !== 'all' && <span className="text-gray-400"> • Filtered by {activeFilter.replace('_', ' ')}</span>}
          </p>
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="text-center py-16"><div className="text-4xl mb-3">⏳</div><p className="text-gray-600">Loading tickets...</p></div>
        ) : error ? (
          <div className="text-center py-16"><div className="text-4xl mb-3">⚠️</div><p className="text-red-600">{error}</p></div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-600 font-medium">No tickets found</p>
            <p className="text-sm text-gray-500 mt-1">{searchQuery ? 'Try a different search term' : 'No issues match your filter'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map(ticket => {
              const status = (ticket.status || 'OPEN').toUpperCase();
              const severity = ticket.severity || 3;
              const isHighlighted = ticket.id === highlightedId;
              return (
                <div 
                  key={ticket.id} 
                  ref={isHighlighted ? highlightedRef : null}
                  className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden ${isHighlighted ? 'ring-2 ring-blue-500 ring-offset-2 animate-pulse' : ''}`}
                >
                  {ticket.image_url && (
                    <div className="h-32 bg-gray-100 relative">
                      <img src={ticket.image_url} alt={ticket.category} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[status] || statusColors['OPEN']}`}>{status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">{getCatIcon(ticket.category)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1 text-[11px] text-gray-500">
                          <div className="truncate">🕐 {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                          {ticket.resolved_at && (
                            <div className="text-green-600 font-medium">✅ {new Date(ticket.resolved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{ticket.category || 'Issue'}</h3>
                          {!ticket.image_url && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${statusColors[status] || statusColors['OPEN']}`}>{status.replace('_', ' ')}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ticket.description || 'No description provided'}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                      {ticket.address && (
                        <span className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px]">
                          <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z" /><circle cx="12" cy="9" r="2" fill="currentColor" /></svg>
                          <span className="truncate">{ticket.address.split(',')[0]}</span>
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium ${severityColors[severity - 1] || severityColors[2]}`}>
                        ⚡ Severity {severity}/5
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {ticket.ward_number && <div className="text-xs text-purple-600">Ward {ticket.ward_number}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Nav */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <h3 className="text-sm font-semibold mb-3">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/" className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
              <span className="text-2xl mb-1">🏠</span><span className="text-xs font-medium">Home</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
              <span className="text-2xl mb-1">📊</span><span className="text-xs font-medium">Dashboard</span>
            </Link>
            <Link href="/map-view" className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
              <span className="text-2xl mb-1">🗺️</span><span className="text-xs font-medium">Full Map</span>
            </Link>
            <Link href="/governance" className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
              <span className="text-2xl mb-1">🏛️</span><span className="text-xs font-medium">Governance</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
