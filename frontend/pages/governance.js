import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase, dbHelpers, authHelpers } from '../lib/supabase';

// ----------------------------------------------------------------------
// 1. DYNAMIC MAP LOADING
// ----------------------------------------------------------------------
const DynamicMap = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm font-medium">
      <div className="flex flex-col items-center space-y-2">
        <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading GIS Layers...</span>
      </div>
    </div>
  )
});

// ----------------------------------------------------------------------
// 2. MAIN LAYOUT (FULL SCREEN OVERLAY)
// ----------------------------------------------------------------------
export default function GovernanceDashboard() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Shared State
  const [filters, setFilters] = useState({
    category: 'All Categories',
    severity: 1
  });

  // Shared incidents state - lifted up for all views to use
  const [sharedIncidents, setSharedIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);

  // Fetch incidents function - shared across all views
  const fetchSharedIncidents = async () => {
    try {
      setIncidentsLoading(true);
      const { data, error } = await supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) throw error;
      
      const incidents = (Array.isArray(data) ? data : []).map(d => ({
        ...d,
        latitude: d.latitude != null ? parseFloat(d.latitude) : null,
        longitude: d.longitude != null ? parseFloat(d.longitude) : null,
      }));
      
      setSharedIncidents(incidents);
      console.log('Shared incidents loaded:', incidents.length);
    } catch (err) {
      console.error('Error fetching shared incidents:', err);
    } finally {
      setIncidentsLoading(false);
    }
  };

  // Subscribe to real-time changes
  useEffect(() => {
    if (!authChecked) return;

    // Initial fetch
    fetchSharedIncidents();

    // Set up real-time subscription
    const subscription = supabase
      .channel('civic_issues_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'civic_issues' }, (payload) => {
        console.log('Real-time update:', payload);
        // Refresh data on any change
        fetchSharedIncidents();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [authChecked]);
  // Check authentication on mount
  useEffect(() => {
    let isMounted = true
    
    const checkAuth = async () => {
      try {
        const user = await authHelpers.getUser()
        
        if (!user) {
          console.log('No user found, redirecting to login')
          if (isMounted) {
            router.push('/login')
          }
          return
        }
        
        console.log('User authenticated:', user.id)
        
        // Fetch user profile to verify admin role
        const { data, error } = await dbHelpers.getUserById(user.id)
        
        if (!isMounted) return
        
        if (error) {
          console.error('Error fetching user profile:', error)
          router.push('/login')
          return
        }
        
        console.log('User profile:', data)
        
        if (!data || data.role !== 'admin') {
          console.log('User is not admin, redirecting to home')
          router.push('/')
          return
        }
        
        console.log('Admin user verified, showing governance page')
        setCurrentUser(user)
        setAuthChecked(true)
      } catch (err) {
        console.error('Auth check failed:', err)
        if (isMounted) {
          router.push('/login')
        }
      }
    }
    
    checkAuth()
    
    return () => {
      isMounted = false
    }
  }, [router])

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!currentUser) {
    return null;
  }

  return (
    // FIX APPLIED HERE: 
    // 'fixed inset-0 z-50' forces this component to cover the ENTIRE viewport, 
    // hiding any sidebar/header coming from your _app.js or parent layout.
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 overflow-hidden font-sans text-gray-900">
      
      {/* A. GLOBAL HEADER (Replaces Sidebar) */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center pl-2 pr-4 justify-between shrink-0 z-30 shadow-sm relative">
         {/* Left: Brand & Navigation */}
         <div className="flex items-center space-x-6">
            {/* Brand */}
            <div className="flex items-center space-x-3 pl-2">
               <Image src="/CivicOP_logo.png" alt="CivicOP Logo" width={36} height={36} className="rounded object-contain" />
               <div className="flex items-center space-x-2">
                 <span className="block font-bold text-gray-800 text-lg leading-tight tracking-tight">CivicOP</span>
                 <Link href="/" legacyBehavior><a className="ml-2 text-gray-500 hover:text-gray-700" title="Home" aria-label="Home">
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z"/></svg>
                 </a></Link>
               
               {/* space reserved for page title to the right of tabs */}
               </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 mx-4"></div>

            {/* Top Navigation Tabs */}
            <nav className="flex space-x-1 ml-2 md:ml-4">
               <NavTab label="Dashboard" icon="📊" active={activeNav === 'dashboard'} onClick={() => setActiveNav('dashboard')} />
               <NavTab label="Map View" icon="🗺️" active={activeNav === 'map'} onClick={() => setActiveNav('map')} />
               <NavTab label="Workflow Triage" icon="🎫" active={activeNav === 'tickets' || activeNav === 'ai'} onClick={() => setActiveNav('tickets')} />
               <NavTab label="IoT" icon="📡" active={activeNav === 'iot'} onClick={() => setActiveNav('iot')} />
            </nav>

            {/* Prominent page title placed to the right of the tabs */}
            <div className="ml-8 md:ml-12 hidden sm:flex items-center">
              <h1 className="text-blue-700 font-extrabold text-lg md:text-xl tracking-tight">Civic Governance Hub</h1>
            </div>
         </div>
         
         {/* Right: Context & User */}
         <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <span>Bengaluru / South Zone</span>
            </div>
            <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
               <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-gray-800">{currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Admin'}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Governance Access</div>
               </div>
               <div className="w-9 h-9 bg-blue-100 rounded-full border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                  {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
               </div>
               <button 
                 onClick={() => {
                   authHelpers.signOut().then(() => router.push('/login'));
                 }}
                 className="ml-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50"
               >
                 Sign Out
               </button>
            </div>
         </div>
      </header>

      {/* B. MAIN CONTENT CANVAS (Full Width) */}
      <main className="flex-1 w-full bg-gray-50 overflow-hidden relative p-2">
          {/* Internal Container maintains 100% height */}
          <div className="h-full w-full flex flex-col">
            {activeNav === 'dashboard' && <DashboardView incidents={sharedIncidents} loading={incidentsLoading} />}
            {activeNav === 'map' && <MapView incidents={sharedIncidents} />}
            {(activeNav === 'tickets' || activeNav === 'ai') && <KanbanView incidents={sharedIncidents} setIncidents={setSharedIncidents} filters={filters} setFilters={setFilters} refreshIncidents={fetchSharedIncidents} loading={incidentsLoading} />}
            {activeNav === 'iot' && <IoTView />}
          </div>
      </main>

      {/* C. SYSTEM FOOTER (Sticky Bottom) */}
      <div className="h-9 bg-white border-t border-gray-200 flex items-center px-4 shrink-0 justify-between text-[11px] text-gray-600 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center space-x-6">
           <span className="font-bold text-gray-700 flex items-center">
             <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             SYSTEM HEALTH:
           </span>
           <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="font-mono">Ingestion API: OK</span>
           </div>
           <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span className="font-mono">GenAI Worker: PROCESSING (3 Jobs)</span>
           </div>
           <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="font-mono">DB Latency: 45ms</span>
           </div>
        </div>
        <div className="text-gray-400 font-mono">Build: v2.5.1-civic-ops</div>
      </div>

    </div>
  );
}

// ----------------------------------------------------------------------
// 3. NAVIGATION TAB (Top Bar - Mobile: Icons Only)
// ----------------------------------------------------------------------
function NavTab({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`px-2 md:px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
        active 
          ? 'bg-gray-100 text-blue-700 shadow-inner' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

// ----------------------------------------------------------------------
// 4. DASHBOARD VIEW (Full Width Map + Fixed Sidebar)
// ----------------------------------------------------------------------
function DashboardView({ incidents = [], loading = false }) {
  const [layerToggles, setLayerToggles] = useState({ traffic: true, infra: true, predictiveFlood: false });

  // Derive comprehensive stats from shared incidents
  const openCount = incidents.filter(i => i.status === 'OPEN' || !i.status).length;
  const inProgressCount = incidents.filter(i => i.status === 'IN_PROGRESS').length;
  const resolvedCount = incidents.filter(i => { const s = (i.status || '').toUpperCase(); return s === 'RESOLVED' || s === 'CLOSED'; }).length;
  
  // Additional admin-only insights
  const criticalCount = incidents.filter(i => i.severity >= 4).length;
  const highPriorityCount = incidents.filter(i => i.severity >= 3).length;
  const todayCount = incidents.filter(i => {
    const created = new Date(i.created_at);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length;
  
  // Category breakdown
  const categoryBreakdown = incidents.reduce((acc, i) => {
    const cat = i.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Resolution rate
  const resolutionRate = incidents.length > 0 
    ? Math.round((resolvedCount / incidents.length) * 100) 
    : 0;
  
  // Average response time (mock calculation based on status)
  const avgResponseTime = inProgressCount > 0 ? '2.4h' : 'N/A';

  // Get critical incidents
  const criticalIncidents = incidents.filter(i => i.severity >= 4).slice(0, 3);
  const latestIncidents = incidents.slice(0, 5);

  return (
    <div className="flex h-full gap-3">
      
      {/* MAP INTELLIGENCE (Takes remaining width) */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm relative overflow-hidden group flex flex-col">
        {/* Map Header */}
        <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center bg-white shrink-0 z-10">
          <h2 className="font-semibold text-gray-800 text-sm flex items-center">
             Geospatial Intelligence Hub
          </h2>
          <div className="flex items-center space-x-3">
            {/* Layer toggles */}
            <div className="flex space-x-2">
              {Object.keys(layerToggles).map(key => (
                <label key={key} className={`flex items-center space-x-2 cursor-pointer px-2 py-1 rounded border transition-all select-none text-xs ${
                  layerToggles[key] ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                   <input 
                     type="checkbox" 
                     checked={layerToggles[key]} 
                     onChange={(e) => setLayerToggles({...layerToggles, [key]: e.target.checked})} 
                     className="rounded text-blue-600 focus:ring-0 w-3 h-3"
                   /> 
                   <span className="capitalize font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 relative bg-gray-100 min-h-0">
          <DynamicMap incidents={incidents} userLocation={null} fillHeight />
          
          {/* Floating Overlays - Admin-only detailed info */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-gray-100 p-3 min-w-[160px]">
             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">🎯 Hotspot Cluster</div>
             <div className="text-lg font-bold text-gray-800">Ward 15</div>
             <div className="text-[10px] text-gray-500 mt-1">{criticalCount} critical issues</div>
          </div>
          
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-gray-100 p-3 min-w-[140px]">
             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">📊 Resolution Rate</div>
             <div className="text-lg font-bold text-green-600">{resolutionRate}%</div>
             <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
               <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{width: `${resolutionRate}%`}}></div>
             </div>
          </div>
          
          <div className="absolute bottom-4 left-4 bg-green-50/95 backdrop-blur rounded-lg shadow-sm border border-green-200 p-2 px-3 flex items-center space-x-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <div className="text-xs font-bold text-green-800">SENSOR: AQI NORMAL (45)</div>
          </div>
          
          <div className="absolute bottom-4 right-4 bg-blue-50/95 backdrop-blur rounded-lg shadow-sm border border-blue-200 p-2 px-3 flex items-center space-x-2">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
             <div className="text-xs font-bold text-blue-800">AVG RESPONSE: {avgResponseTime}</div>
          </div>
        </div>
      </div>

      {/* ADMIN INSIGHTS PANEL (Fixed Width 380px) - Hidden on mobile to prevent blocking map view */}
      <div className="hidden lg:flex w-[380px] flex-col gap-3 shrink-0 overflow-y-auto">
        {/* Quick Stats Grid */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
          <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
            📈 Quick Stats
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold animate-pulse">LIVE</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">{openCount}</div>
              <div className="text-[10px] text-orange-700 font-semibold uppercase">Open</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
              <div className="text-[10px] text-blue-700 font-semibold uppercase">In Progress</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
              <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
              <div className="text-[10px] text-green-700 font-semibold uppercase">Resolved</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
              <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
              <div className="text-[10px] text-red-700 font-semibold uppercase">Critical</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">Today's Reports:</span>
            <span className="font-bold text-gray-800">{todayCount}</span>
          </div>
        </div>
        
        {/* Category Breakdown - Admin Only */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">🏷️ Category Breakdown</h3>
          <div className="space-y-2">
            {topCategories.map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 capitalize">{cat}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full" 
                      style={{width: `${Math.min((count / incidents.length) * 100, 100)}%`}}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Feed */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[200px]">
          <div className="px-3 py-2 border-b border-gray-200 shrink-0 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 text-sm">🔴 Live Feed</h3>
            <span className="text-[10px] text-gray-500">{latestIncidents.length} recent</span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
             {loading ? (
               <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
             ) : latestIncidents.length === 0 ? (
               <div className="p-4 text-center text-gray-500 text-sm">No incidents</div>
             ) : (
               latestIncidents.map((incident) => {
                 const severity = incident.severity || 3;
                 // Normalize status for consistent, case-insensitive checks
                 const status = (incident.status || 'OPEN').toUpperCase();
                 const getColors = () => {
                   if (status === 'RESOLVED') return { border: 'border-l-green-500', bg: 'bg-green-50/20', color: 'text-green-700' };
                   if (severity >= 4) return { border: 'border-l-red-500', bg: 'bg-red-50/10', color: 'text-red-700' };
                   if (severity === 3) return { border: 'border-l-yellow-500', bg: 'bg-yellow-50/10', color: 'text-yellow-700' };
                   return { border: 'border-l-blue-500', bg: 'bg-blue-50/10', color: 'text-blue-700' };
                 };
                 const colors = getColors();
                 const timeAgo = Math.floor((new Date() - new Date(incident.created_at)) / 60000);
                 const timeStr = timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo / 60)}h ago`;
                 
                 return (
                   <div key={incident.id} className={`p-2.5 border-b border-gray-100 hover:bg-blue-50/30 transition-colors border-l-4 ${colors.border} ${colors.bg} cursor-pointer`}>
                      <div className="flex justify-between items-start">
                          <div className={`font-bold text-xs ${colors.color}`}>
                            {status === 'RESOLVED' ? '✅' : severity >= 4 ? '🔴' : severity === 3 ? '🟡' : '🔵'} #{incident.id.toString().slice(-4)} {incident.category || 'Issue'}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">{timeStr}</div>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate">📍 {incident.address || `${incident.latitude?.toFixed(4)}, ${incident.longitude?.toFixed(4)}`}</div>
                      <div className="mt-1.5 flex items-center gap-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                            status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {status || 'OPEN'}
                          </span>
                          <span className="text-[9px] text-gray-500">Sev: {severity}/5</span>
                          {incident.assigned_to && <span className="text-[9px] text-purple-600">👤 Assigned</span>}
                      </div>
                   </div>
                 );
               })
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. KANBAN VIEW (Full Height Columns)
// ----------------------------------------------------------------------
function KanbanView({ incidents, setIncidents, filters, setFilters, refreshIncidents, loading }) {
  const [message, setMessage] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // Filter incidents based on current filters
  const filteredIncidents = useMemo(() => {
    let result = [...incidents];
    
    if (filters.category && filters.category !== 'All Categories') {
      result = result.filter(i => i.category === filters.category);
    }
    
    if (filters.severity && filters.severity > 0) {
      result = result.filter(i => (i.severity || 0) >= filters.severity);
    }
    
    return result;
  }, [incidents, filters.category, filters.severity]);

  const updateIncidentStatus = async (id, newStatus) => {
    // Optimistic UI update
    const prevIncidents = [...incidents];
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));

    try {
      // Check user is authenticated via Supabase session
      const user = await authHelpers.getUser();
      if (!user) {
        throw new Error('Not authenticated. Please sign in first.');
      }

      console.log('Updating incident status:', { id, newStatus, userId: user.id });

      // Use dbHelpers.updateIncident which tries civic_issues table
      const updated = await dbHelpers.updateIncident(String(id), { status: newStatus });

      console.log('Update response:', updated);

      // Validate the response - Supabase returns an array of updated rows
      if (!updated || (Array.isArray(updated) && updated.length === 0)) {
        throw new Error('No rows were updated. Check database permissions.');
      }

      // Show success message
      setMessage(`✓ Moved to ${newStatus}`);
      setTimeout(() => setMessage(null), 2000);
      
      // Refresh data in background - this updates all views via shared state
      if (refreshIncidents) {
        refreshIncidents().catch(err => console.error('Refresh after update failed:', err));
      }
      
      return true;
    } catch (err) {
      console.error('Failed to update status:', err);
      // Revert optimistic update
      setIncidents(prevIncidents);
      const errorMsg = err.message || 'Update failed';
      setMessage(`✗ ${errorMsg}`);
      setTimeout(() => setMessage(null), 3500);
      return false;
    }
  };

  // Group filtered incidents by status (counts update automatically when incidents change)
  const openIncidents = filteredIncidents.filter(i => i.status === 'OPEN' || !i.status);
  const inProgressIncidents = filteredIncidents.filter(i => i.status === 'IN_PROGRESS');
  const resolvedIncidents = filteredIncidents.filter(i => { const s = (i.status || '').toUpperCase(); return s === 'RESOLVED' || s === 'CLOSED'; });

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Compact Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 flex items-center space-x-4 shrink-0">
        <span className="font-bold text-gray-700 text-xs uppercase ml-2">Filters:</span>
        <select 
          value={filters.category} 
          onChange={(e) => setFilters({...filters, category: e.target.value})}
          className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 bg-gray-50"
        >
          <option>All Categories</option>
          <option>Pothole</option>
          <option>Garbage</option>
          <option>Streetlight</option>
          <option>Water Leak</option>
          <option>Road Damage</option>
          <option>Other</option>
        </select>
        
        <div className="h-4 w-px bg-gray-300"></div>
        
        <div className="flex items-center space-x-2">
           <span className="text-xs text-gray-500 font-bold">Min Severity</span>
           <input 
             type="number" 
             min="1"
             max="5"
             value={filters.severity || 1}
             onChange={(e) => setFilters({...filters, severity: parseInt(e.target.value)})} 
             className="w-10 text-xs border border-gray-300 rounded p-1 text-center" 
           />
        </div>
        
        <div className="flex-1"></div>
        <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 shadow-sm font-medium">
          Generate Report
        </button>
      </div>

      {/* Full Height Columns Grid */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Column 1: OPEN */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
           <div className="p-3 bg-red-50 border-b border-red-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">📋 OPEN REPORTS</h3>
              <span className="bg-white text-red-600 text-xs px-2 py-0.5 rounded border border-red-100 font-bold">{openIncidents.length}</span>
           </div>
           <div 
             className="p-2 space-y-2 overflow-y-auto flex-1 bg-gray-50/50 transition-colors" 
             onDragOver={(e) => { 
               e.preventDefault(); 
               e.currentTarget.classList.add('bg-red-100/50');
             }}
             onDragLeave={(e) => {
               e.currentTarget.classList.remove('bg-red-100/50');
             }}
             onDrop={async (e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-red-100/50');
                try {
                  const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
                  console.log('Dropped on OPEN:', payload);
                  if (payload && payload.id) {
                    const ok = await updateIncidentStatus(payload.id, 'OPEN')
                    if (!ok) {
                      setMessage && setMessage('Failed to move item to OPEN')
                      setTimeout(() => setMessage && setMessage(null), 3500)
                    }
                  }
                } catch (err) { console.error('drop error', err); }
              }}>
              {loading ? (
                <div className="text-xs text-gray-500 text-center py-4">Loading...</div>
              ) : openIncidents.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4">No open reports</div>
              ) : (
                openIncidents.slice(0, 8).map(incident => (
                  <KanbanCard 
                    key={incident.id}
                    id={`#${incident.id.toString().slice(-4)}`}
                    title={incident.category || 'Issue'}
                    severity={incident.severity || 3}
                    location={incident.address || `${incident.latitude?.toFixed(3)}, ${incident.longitude?.toFixed(3)}`}
                    createdAt={incident.created_at}
                    status={incident.status || 'OPEN'}
                    incidentId={incident.id}
                    onStatusChange={updateIncidentStatus}
                    setMessage={setMessage}
                  />
                ))
              )}
           </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
           <div className="p-3 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">⚙️ IN PROGRESS</h3>
              <span className="bg-white text-yellow-600 text-xs px-2 py-0.5 rounded border border-yellow-100 font-bold">{inProgressIncidents.length}</span>
           </div>
           <div 
             className="p-2 space-y-2 overflow-y-auto flex-1 bg-gray-50/50 transition-colors" 
             onDragOver={(e) => { 
               e.preventDefault(); 
               e.currentTarget.classList.add('bg-yellow-100/50');
             }}
             onDragLeave={(e) => {
               e.currentTarget.classList.remove('bg-yellow-100/50');
             }}
             onDrop={async (e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-yellow-100/50');
                try {
                  const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
                  console.log('Dropped on IN_PROGRESS:', payload);
                  if (payload && payload.id) {
                    const ok = await updateIncidentStatus(payload.id, 'IN_PROGRESS')
                    if (!ok) {
                      console.error('Update failed for', payload.id);
                      setMessage && setMessage('Failed to move item to IN_PROGRESS')
                      setTimeout(() => setMessage && setMessage(null), 3500)
                    }
                  }
                } catch (err) { console.error('drop error', err); }
              }}>
              {message && <div className="p-2 mb-2 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs">{message}</div>}
              {loading ? (
                <div className="text-xs text-gray-500 text-center py-4">Loading...</div>
              ) : inProgressIncidents.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4">No in-progress reports</div>
              ) : (
                inProgressIncidents.slice(0, 8).map(incident => (
                  <KanbanCard 
                    key={incident.id}
                    id={`#${incident.id.toString().slice(-4)}`}
                    title={incident.category || 'Issue'}
                    severity={incident.severity || 3}
                    location={incident.address || `${incident.latitude?.toFixed(3)}, ${incident.longitude?.toFixed(3)}`}
                    createdAt={incident.created_at}
                    status={incident.status || 'IN_PROGRESS'}
                    incidentId={incident.id}
                    onStatusChange={updateIncidentStatus}
                    setMessage={setMessage}
                  />
                ))
              )}
           </div>
        </div>

        {/* Column 3: RESOLVED */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
           <div className="p-3 bg-green-50 border-b border-green-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">✅ RESOLVED</h3>
              <span className="bg-white text-green-600 text-xs px-2 py-0.5 rounded border border-green-100 font-bold">{resolvedIncidents.length}</span>
           </div>
           <div 
             className="p-2 space-y-2 overflow-y-auto flex-1 bg-gray-50/50 transition-colors" 
             onDragOver={(e) => { 
               e.preventDefault(); 
               e.currentTarget.classList.add('bg-green-100/50');
             }}
             onDragLeave={(e) => {
               e.currentTarget.classList.remove('bg-green-100/50');
             }}
             onDrop={async (e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-green-100/50');
                try {
                  const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
                  console.log('Dropped on RESOLVED:', payload);
                  if (payload && payload.id) {
                    const ok = await updateIncidentStatus(payload.id, 'RESOLVED')
                    if (!ok) {
                      console.error('Update failed for', payload.id);
                      setMessage && setMessage('Failed to move item to RESOLVED')
                      setTimeout(() => setMessage && setMessage(null), 3500)
                    }
                  }
                } catch (err) { console.error('drop error', err); }
              }}>
              {loading ? (
                <div className="text-xs text-gray-500 text-center py-4">Loading...</div>
              ) : resolvedIncidents.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4">No resolved reports</div>
              ) : (
                resolvedIncidents.slice(0, 8).map(incident => (
                  <KanbanCard 
                    key={incident.id}
                    id={`#${incident.id.toString().slice(-4)}`}
                    title={incident.category || 'Issue'}
                    severity={incident.severity || 3}
                    location={incident.address || `${incident.latitude?.toFixed(3)}, ${incident.longitude?.toFixed(3)}`}
                    createdAt={incident.created_at}
                    status={incident.status || 'RESOLVED'}
                    incidentId={incident.id}
                    onStatusChange={updateIncidentStatus}
                    setMessage={setMessage}
                  />
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. KANBAN CARD (Updated for Real Data with AI Analysis Preview)
// ----------------------------------------------------------------------
function KanbanCard({ id, title, severity, location, createdAt, status, incidentId, onStatusChange, setMessage }) {
  const [expanded, setExpanded] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const getSeverityColor = (sev) => {
    if (sev >= 4) return { border: 'border-l-red-500', bg: 'bg-red-50/10', color: 'text-red-700', emoji: '🔴' };
    if (sev === 3) return { border: 'border-l-yellow-500', bg: 'bg-yellow-50/10', color: 'text-yellow-700', emoji: '🟡' };
    return { border: 'border-l-blue-500', bg: 'bg-blue-50/10', color: 'text-blue-700', emoji: '🔵' };
  };

  const getStatusTransitions = (currentStatus) => {
    const transitions = {
      'OPEN': ['IN_PROGRESS', 'RESOLVED'],
      'IN_PROGRESS': ['OPEN', 'RESOLVED'],
      'RESOLVED': ['OPEN', 'IN_PROGRESS'],
    };
    return transitions[currentStatus] || [];
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    let result = false;
    try {
      // Delegate status updates to parent handler for consistent behavior & permissions
      if (onStatusChange) {
        result = await onStatusChange(incidentId, newStatus);
      } else {
        console.warn('No onStatusChange handler provided');
      }
    } catch (err) {
      console.error('Failed to update status via parent handler:', err);
      result = false;
    } finally {
      setUpdatingStatus(false);
    }
    return result;
  };

  const colors = getSeverityColor(severity);
  const timeAgo = Math.floor((new Date() - new Date(createdAt)) / 60000);
  const timeStr = timeAgo < 60 ? `${timeAgo}m` : timeAgo < 1440 ? `${Math.floor(timeAgo / 60)}h` : `${Math.floor(timeAgo / 1440)}d`;

  const loadAIAnalysis = async () => {
    if (aiAnalysis || loadingAI) return;
    
    setLoadingAI(true);
    try {
      const response = await fetch('/api/v1/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || '',
          description: location || '',
          severity: severity || 2,
          category: title || '',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  const possibleTransitions = getStatusTransitions(status);

  return (
    <div 
      draggable={true} 
      onDragStart={(e) => { 
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: incidentId, from: status }));
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.5';
      }}
      onDragEnd={(e) => {
        e.target.style.opacity = '1';
      }}
      className={`bg-white border border-gray-200 rounded p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-l-4 ${colors.border} ${colors.bg}`}
    >
      <div className="flex justify-between items-start">
         <span className="font-bold text-sm text-gray-800 hover:text-blue-600 transition-colors flex items-center gap-1">
           <span>{colors.emoji}</span>
           <span>{id} {title}</span>
         </span>
         <div className="text-[10px] text-gray-500 font-mono font-semibold">{timeStr} ago</div>
      </div>
      
      <div className="text-xs text-gray-600 mt-2 truncate">📍 {location}</div>
      
      <div className="mt-2 flex justify-between items-center gap-1">
         <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
           severity >= 4 ? 'bg-red-100 text-red-700' :
           severity === 3 ? 'bg-yellow-100 text-yellow-700' :
           'bg-blue-100 text-blue-700'
         }`}>
           Severity: {severity}/5
         </span>
         <div className="flex gap-1">
           <button
             onClick={() => {
               setExpanded(!expanded);
               if (!expanded && !aiAnalysis) loadAIAnalysis();
             }}
             className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-200 transition-colors font-medium"
           >
             {expanded ? '▼' : '▶'} AI
           </button>
         </div>
      </div>

      {/* Status Change Dropdown */}
      {possibleTransitions.length > 0 && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {possibleTransitions.map(newStatus => (
            <button
              key={newStatus}
              onClick={async () => {
                const ok = await handleStatusChange(newStatus)
                if (ok && setMessage) {
                  // brief success feedback
                  setMessage(`Status changed to ${newStatus}`)
                  setTimeout(() => setMessage(null), 1500)
                }
              }}
              disabled={updatingStatus}
              className={`text-[9px] px-2 py-1 rounded font-medium transition-colors ${
                newStatus === 'RESOLVED' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                newStatus === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                'bg-orange-100 text-orange-700 hover:bg-orange-200'
              } disabled:opacity-50`}
            >
              {updatingStatus ? '⟳' : '→'} {newStatus.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* AI Analysis Expanded View */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {loadingAI ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-[10px] text-gray-600">Analyzing...</span>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-2">
              <div className="text-[10px]">
                <span className="font-bold text-gray-700">Category:</span>
                <span className="ml-1 bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-[9px]">
                  {aiAnalysis.category} ({(aiAnalysis.category_confidence * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="text-[10px]">
                <span className="font-bold text-gray-700">Priority:</span>
                <span className={`ml-1 px-1 py-0.5 rounded text-[9px] font-bold ${
                  aiAnalysis.priority === 'high' ? 'bg-red-100 text-red-700' :
                  aiAnalysis.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {aiAnalysis.priority.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px]">
                <span className="font-bold text-gray-700">AI Score:</span>
                <span className="ml-1 font-bold text-indigo-600">
                  {(aiAnalysis.overall_ai_score * 100).toFixed(0)}/100
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-gray-500">Could not load analysis</p>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 7. IoT & ANALYTICS VIEW - Coming Soon
// ----------------------------------------------------------------------
function IoTView() {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 text-center max-w-md">
        <div className="text-5xl mb-4">📡</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Predictive & IoT</h2>
        <p className="text-gray-600 mb-6">Real-time sensor integration and predictive analytics platform coming soon.</p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          <span className="animate-pulse">●</span>
          Coming Soon
        </div>
      </div>
    </div>
  );
}

// 8. MAP VIEW - Enhanced Admin Map with More Data
// -----------------------------------------------------------------------
function MapView({ incidents = [], refreshIncidents }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Ensure the parent data is fresh when filters change (fixes stale addresses in 'All' view)
  useEffect(() => {
    if (typeof refreshIncidents === 'function' && statusFilter === 'all') {
      refreshIncidents();
    }
  }, [statusFilter, refreshIncidents]);

  // Filter incidents based on admin selections
  const filteredIncidents = useMemo(() => {
    let result = [...incidents];
    if (statusFilter !== 'all') {
      if (statusFilter === 'open') result = result.filter(i => (i.status || 'OPEN').toUpperCase() === 'OPEN');
      else if (statusFilter === 'in_progress') result = result.filter(i => (i.status || '').toUpperCase() === 'IN_PROGRESS');
      else if (statusFilter === 'resolved') result = result.filter(i => ['RESOLVED', 'CLOSED'].includes((i.status || '').toUpperCase()));
    }
    if (severityFilter > 0) {
      result = result.filter(i => (i.severity || 1) >= severityFilter);
    }
    if (selectedCategory !== 'all') {
      result = result.filter(i => (i.category || 'Other') === selectedCategory);
    }
    return result;
  }, [incidents, statusFilter, severityFilter, selectedCategory]);

  // Calculate admin-only stats
  const openCount = incidents.filter(i => i.status === 'OPEN' || !i.status).length;
  const inProgressCount = incidents.filter(i => i.status === 'IN_PROGRESS').length;
  const resolvedCount = incidents.filter(i => { const s = (i.status || '').toUpperCase(); return s === 'RESOLVED' || s === 'CLOSED'; }).length;
  const criticalCount = incidents.filter(i => i.severity >= 4).length;
  const resolutionRate = incidents.length > 0 ? Math.round((resolvedCount / incidents.length) * 100) : 0;
  
  // Category breakdown
  const categoryBreakdown = incidents.reduce((acc, i) => {
    const cat = i.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const categories = Object.keys(categoryBreakdown);
  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Ward breakdown for admin
  const wardBreakdown = incidents.reduce((acc, i) => {
    const ward = i.ward_number || 'Unknown';
    acc[ward] = (acc[ward] || 0) + 1;
    return acc;
  }, {});
  const topWards = Object.entries(wardBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
       {/* Admin Control Bar */}
       <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex items-center justify-between lg:mb-3">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                🗺️ Command Center Map
              </h2>
              <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded font-bold">ADMIN ONLY</span>
              <span className="hidden lg:flex text-[10px] bg-green-500 text-white px-2 py-0.5 rounded font-bold items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                LIVE
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-[10px] text-gray-300">Showing {filteredIncidents.length} of {incidents.length}</span>
              <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 shadow-sm font-medium">📥 Export GIS</button>
              <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 shadow-sm font-medium">📊 Report</button>
            </div>
          </div>
          
          {/* Filter Controls - Hidden on mobile */}
          <div className="hidden lg:flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-medium">STATUS:</span>
              <div className="flex gap-1">
                {[{key: 'all', label: 'All', color: 'bg-gray-600'}, {key: 'open', label: 'Open', color: 'bg-orange-500'}, {key: 'in_progress', label: 'WIP', color: 'bg-blue-500'}, {key: 'resolved', label: 'Done', color: 'bg-green-500'}].map(s => (
                  <button key={s.key} onClick={() => setStatusFilter(s.key)} className={`text-[10px] px-2 py-1 rounded font-medium transition ${statusFilter === s.key ? `${s.color} text-white` : 'bg-slate-600 text-gray-300 hover:bg-slate-500'}`}>{s.label}</button>
                ))}
              </div>
            </div>
            
            {/* Severity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-medium">MIN SEV:</span>
              <select value={severityFilter} onChange={(e) => setSeverityFilter(parseInt(e.target.value))} className="text-[10px] bg-slate-600 text-white border-0 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500">
                <option value="0">Any</option>
                <option value="3">≥3 (Medium+)</option>
                <option value="4">≥4 (High+)</option>
                <option value="5">5 (Critical)</option>
              </select>
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-medium">CATEGORY:</span>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="text-[10px] bg-slate-600 text-white border-0 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500">
                <option value="all">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            {/* View Toggles */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[10px] text-gray-400 font-medium">VIEW:</span>
              <button onClick={() => setShowHeatmap(!showHeatmap)} className={`text-[10px] px-2 py-1 rounded font-medium transition ${showHeatmap ? 'bg-red-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'}`}>🔥 Heatmap</button>
              <button onClick={() => setShowClusters(!showClusters)} className={`text-[10px] px-2 py-1 rounded font-medium transition ${showClusters ? 'bg-blue-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'}`}>🔘 Clusters</button>
            </div>
          </div>
       </div>
       
       <div className="flex-1 bg-gray-100 relative min-h-0">
          {incidents.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">Loading map data...</div>
          ) : (
            <DynamicMap incidents={filteredIncidents} userLocation={null} fillHeight />
          )}
          
          {/* Admin Stats Panel - Left - Hidden on mobile */}
          <div className="hidden lg:block absolute top-4 left-4 bg-slate-800/95 backdrop-blur rounded-lg shadow-lg border border-slate-700 p-3 min-w-[200px] z-40">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>📊 Live Statistics</span>
              <span className="text-green-400">● Online</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded"></span>
                  <span className="text-xs text-gray-300">Open</span>
                </div>
                <span className="text-sm font-bold text-orange-400">{openCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded"></span>
                  <span className="text-xs text-gray-300">In Progress</span>
                </div>
                <span className="text-sm font-bold text-blue-400">{inProgressCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded"></span>
                  <span className="text-xs text-gray-300">Resolved</span>
                </div>
                <span className="text-sm font-bold text-green-400">{resolvedCount}</span>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Resolution Rate</span>
                  <span className="text-xs font-bold text-green-400">{resolutionRate}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-1.5 rounded-full" style={{width: `${resolutionRate}%`}}></div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded animate-pulse"></span>
                  <span className="text-xs text-gray-300 font-medium">Critical</span>
                </div>
                <span className="text-sm font-bold text-red-400">{criticalCount}</span>
              </div>
            </div>
          </div>
          
          {/* Ward Hotspots - Top Right - Hidden on mobile */}
          <div className="hidden lg:block absolute top-4 right-4 bg-slate-800/95 backdrop-blur rounded-lg shadow-lg border border-slate-700 p-3 min-w-[180px] z-40">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">🎯 Hotspot Wards</div>
            <div className="space-y-2">
              {topWards.map(([ward, count], idx) => (
                <div key={ward} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${idx === 0 ? 'text-red-400' : idx === 1 ? 'text-orange-400' : 'text-yellow-400'}`}>#{idx + 1}</span>
                    <span className="text-xs text-gray-300">Ward {ward}</span>
                  </div>
                  <span className="text-xs font-bold text-white bg-slate-600 px-1.5 py-0.5 rounded">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Category Distribution - Bottom Right - Hidden on mobile */}
          <div className="hidden lg:block absolute bottom-4 right-4 bg-slate-800/95 backdrop-blur rounded-lg shadow-lg border border-slate-700 p-3 min-w-[200px] z-40">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">🏷️ By Category</div>
            <div className="space-y-1.5">
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-gray-300 capitalize truncate">{cat}</span>
                      <span className="text-white font-bold">{count}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1">
                      <div className="bg-blue-500 h-1 rounded-full" style={{width: `${Math.min((count / incidents.length) * 100, 100)}%`}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Admin Actions Panel - Bottom Left - Hidden on mobile */}
          <div className="hidden lg:flex absolute bottom-4 left-4 items-center gap-2 z-40">
            <div className="bg-green-600/95 backdrop-blur rounded-lg shadow-sm border border-green-500 p-2 px-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="text-xs font-bold text-white">LIVE SYNC</div>
            </div>
            <div className="bg-slate-800/95 backdrop-blur rounded-lg shadow-lg border border-slate-700 p-2 flex gap-2">
              <button className="text-[10px] bg-slate-700 text-white px-2.5 py-1.5 rounded hover:bg-slate-600 font-medium transition">🔔 Alerts</button>
              <button className="text-[10px] bg-slate-700 text-white px-2.5 py-1.5 rounded hover:bg-slate-600 font-medium transition">👥 Assign</button>
              <button className="text-[10px] bg-red-600 text-white px-2.5 py-1.5 rounded hover:bg-red-700 font-medium transition">🚨 Emergency</button>
            </div>
          </div>
       </div>
    </div>
  );
}