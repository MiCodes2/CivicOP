import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { supabase, dbHelpers } from '../lib/supabase';

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
  const [activeNav, setActiveNav] = useState('dashboard');
  
  // Shared State
  const [filters, setFilters] = useState({
    category: 'All Categories',
    severity: 1
  });

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
            <nav className="flex space-x-1 ml-4">
               <NavTab label="Dashboard" icon="📊" active={activeNav === 'dashboard'} onClick={() => setActiveNav('dashboard')} />
               <NavTab label="Map View" icon="🗺️" active={activeNav === 'map'} onClick={() => setActiveNav('map')} />
               <NavTab label="Workflow Triage" icon="🎫" active={activeNav === 'tickets' || activeNav === 'ai'} onClick={() => setActiveNav('tickets')} />
               <NavTab label="Predictive & IoT" icon="📡" active={activeNav === 'iot'} onClick={() => setActiveNav('iot')} />
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
                  <div className="text-sm font-bold text-gray-800">Admin User</div>
                  <div className="text-[10px] text-gray-500 uppercase">Commissioner Office</div>
               </div>
               <div className="w-9 h-9 bg-blue-100 rounded-full border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                  AU
               </div>
            </div>
         </div>
      </header>

      {/* B. MAIN CONTENT CANVAS (Full Width) */}
      <main className="flex-1 w-full bg-gray-50 overflow-hidden relative p-2">
          {/* Internal Container maintains 100% height */}
          <div className="h-full w-full flex flex-col">
            {activeNav === 'dashboard' && <DashboardView />}
            {activeNav === 'map' && <MapView />}
            {(activeNav === 'tickets' || activeNav === 'ai') && <KanbanView filters={filters} setFilters={setFilters} />}
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
// 3. NAVIGATION TAB (Top Bar)
// ----------------------------------------------------------------------
function NavTab({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
        active 
          ? 'bg-gray-100 text-blue-700 shadow-inner' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ----------------------------------------------------------------------
// 4. DASHBOARD VIEW (Full Width Map + Fixed Sidebar)
// ----------------------------------------------------------------------
function DashboardView() {
  const [layerToggles, setLayerToggles] = useState({ traffic: true, infra: true, predictiveFlood: false });
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allIncidents, setAllIncidents] = useState([]);
  const [incidentsTableAvailable, setIncidentsTableAvailable] = useState(false);

  useEffect(() => {
    fetchIncidents();

    // Check if the legacy 'incidents' table exists in DB (some deployments use 'civic_issues' only)
    let mounted = true
    import('../lib/supabase_helpers').then(({ tableExists }) => {
      tableExists('incidents').then(v => { if (mounted) setIncidentsTableAvailable(v) })
    })

    return () => { mounted = false }
  }, []);

  const fetchIncidents = async () => {
    try {
      let { data, error } = await supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;

      if (!(Array.isArray(data) && data.length > 0)) {
        const res2 = await supabase
          .from('incidents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        data = (res2 && res2.data) || data;
      }

      const allData = (Array.isArray(data) ? data : []).map(d => ({
        ...d,
        latitude: d.latitude != null ? parseFloat(d.latitude) : null,
        longitude: d.longitude != null ? parseFloat(d.longitude) : null,
      }));
      console.debug('DashboardView fetched incidents:', allData.length);
      setAllIncidents(allData);
      setIncidents(allData);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

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

            {/* Indicate whether legacy 'incidents' table exists */}
            <div className={`text-xs px-2 py-1 rounded border ${incidentsTableAvailable ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
              {incidentsTableAvailable ? 'Legacy table: incidents available' : 'Legacy table: incidents missing'}
            </div>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 relative bg-gray-100 min-h-0">
          <DynamicMap incidents={allIncidents} userLocation={null} fillHeight />
          
          {/* Floating Overlays */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-gray-100 p-3 min-w-[140px]">
             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Active Cluster</div>
             <div className="text-lg font-bold text-gray-800">Ward 15</div>
          </div>
          
          <div className="absolute bottom-4 left-4 bg-green-50/95 backdrop-blur rounded-lg shadow-sm border border-green-200 p-2 px-3 flex items-center space-x-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <div className="text-xs font-bold text-green-800">SENSOR: AQI NORMAL (45)</div>
          </div>
        </div>
      </div>

      {/* LIVE FEED (Fixed Width 360px) */}
      <div className="w-[360px] flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0">
        <div className="px-4 py-2.5 border-b border-gray-200 shrink-0 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800 text-sm">Live Ingestion ({incidents.length})</h2>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold animate-pulse">LIVE</span>
        </div>
        <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-200">
           {loading ? (
             <div className="p-4 text-center text-gray-500 text-sm">Loading incidents...</div>
           ) : latestIncidents.length === 0 ? (
             <div className="p-4 text-center text-gray-500 text-sm">No incidents found</div>
           ) : (
             latestIncidents.map((incident, idx) => {
               const severity = incident.severity || 3;
               const getColors = () => {
                 if (severity >= 4) return { border: 'border-l-red-500', bg: 'bg-red-50/10', color: 'text-red-700' };
                 if (severity === 3) return { border: 'border-l-yellow-500', bg: 'bg-yellow-50/10', color: 'text-yellow-700' };
                 return { border: 'border-l-blue-500', bg: 'bg-blue-50/10', color: 'text-blue-700' };
               };
               const colors = getColors();
               const timeAgo = Math.floor((new Date() - new Date(incident.created_at)) / 60000);
               const timeStr = timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo / 60)}h ago`;
               
               return (
                 <div key={incident.id} className={`p-3 border-b border-gray-100 hover:bg-blue-50/30 transition-colors border-l-4 ${colors.border} ${colors.bg} cursor-pointer group`}>
                    <div className="flex justify-between items-start">
                        <div className={`font-bold text-sm ${colors.color} group-hover:underline`}>
                          {severity >= 4 ? '🔴' : severity === 3 ? '🟡' : '🔵'} #{incident.id.toString().slice(-4)} {incident.category || 'Issue'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">{timeStr}</div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">📍 {incident.address || `${incident.latitude?.toFixed(4)}, ${incident.longitude?.toFixed(4)}`}</div>
                    <div className="mt-2 flex justify-between items-center">
                        <span className={`text-[10px] ${incident.status === 'OPEN' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'} px-1.5 py-0.5 rounded font-bold`}>
                          {incident.status || 'OPEN'}
                        </span>
                        {incident.severity && <span className="text-[10px] text-gray-600">Severity: {incident.severity}/5</span>}
                    </div>
                 </div>
               );
             })
           )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. KANBAN VIEW (Full Height Columns)
// ----------------------------------------------------------------------
function KanbanView({ filters, setFilters }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchIncidents();
  }, [filters.category, filters.severity]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      // Primary table: civic_issues. Fallback to 'incidents' if empty.
      let query = supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false });

      // If civic_issues returns no rows, attempt to check for legacy 'incidents' table
      const { data: sample, error: sampleErr } = await query.limit(1);
      if (sampleErr) {
        console.warn('civic_issues sample query failed:', sampleErr.message || sampleErr);
      }

      if (!Array.isArray(sample) || sample.length === 0) {
        // Check if incidents table exists before trying
        const { tableExists } = await import('../lib/supabase_helpers')
        const incidentsExists = await tableExists('incidents')
        if (incidentsExists) {
          query = supabase
            .from('incidents')
            .select('*')
            .order('created_at', { ascending: false });
        } else {
          // nothing to do — both are empty or missing
        }
      }

      if (filters.category && filters.category !== 'All Categories') {
        query = query.eq('category', filters.category);
      }

      if (filters.severity && filters.severity > 0) {
        query = query.gte('severity', filters.severity);
      }

      const { data, error } = await query.limit(200);
      if (error) throw error;
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (id, newStatus) => {
    // Optimistic UI update
    const prevIncidents = incidents;
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));

    try {
      // Use dbHelpers.updateIncident which tries both tables and throws if both fail
      const updated = await dbHelpers.updateIncident(String(id), { status: newStatus });

      // Validate the response - Supabase returns an array of updated rows
      if (!updated || (Array.isArray(updated) && updated.length === 0)) {
        throw new Error('No rows were updated on the server')
      }

      // Refresh canonical server state
      await fetchIncidents();
      setMessage(`Status updated to ${newStatus}`);
      setTimeout(() => setMessage(null), 3000);
      return true;
    } catch (err) {
      console.error('Failed to update status:', err);
      // Revert optimistic update
      setIncidents(prevIncidents);
      setMessage(`Failed to update status: ${err.message || err}`);
      setTimeout(() => setMessage(null), 4000);
      return false;
    }
  };

  // Group incidents by status
  const openIncidents = incidents.filter(i => i.status === 'OPEN' || !i.status);
  const inProgressIncidents = incidents.filter(i => i.status === 'IN_PROGRESS');
  const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED');

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
           <div className="p-2 space-y-2 overflow-y-auto flex-1 bg-gray-50/50" onDragOver={(e) => e.preventDefault()} onDrop={async (e) => {
                e.preventDefault();
                try {
                  const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
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
           <div className="p-2 space-y-2 overflow-y-auto flex-1 bg-gray-50/50" onDragOver={(e) => e.preventDefault()} onDrop={async (e) => {
                e.preventDefault();
                try {
                  const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
                  console.debug('Dropped payload on IN_PROGRESS:', payload);
                  if (payload && payload.id) {
                    const ok = await updateIncidentStatus(payload.id, 'IN_PROGRESS')
                    if (!ok) {
                      console.error('Update failed for', payload.id);
                      setMessage && setMessage('Failed to move item to IN_PROGRESS')
                      setTimeout(() => setMessage && setMessage(null), 3500)
                    }
                  }
                  e.dataTransfer.clearData();
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
           <div className="p-2 space-y-2 overflow-y-auto flex-1 bg-gray-50/50" onDragOver={(e) => e.preventDefault()} onDrop={async (e) => {
                e.preventDefault();
                try {
                  const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
                  console.debug('Dropped payload on RESOLVED:', payload);
                  if (payload && payload.id) {
                    const ok = await updateIncidentStatus(payload.id, 'RESOLVED')
                    if (!ok) {
                      console.error('Update failed for', payload.id);
                      setMessage && setMessage('Failed to move item to RESOLVED')
                      setTimeout(() => setMessage && setMessage(null), 3500)
                    }
                  }
                  e.dataTransfer.clearData();
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
    <div draggable={true} onDragStart={(e) => { e.dataTransfer.setData('text/plain', JSON.stringify({ id: incidentId, from: status })); }} className={`bg-white border border-gray-200 rounded p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-l-4 ${colors.border} ${colors.bg}`}>
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
// 7. IoT & ANALYTICS VIEW (Includes Gauge)
// ----------------------------------------------------------------------
function IoTView() {
  const [timeHorizon, setTimeHorizon] = useState('forecast');

  return (
    <div className="h-full overflow-y-auto p-1 space-y-4">
      {/* Time Horizon Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <span className="font-bold text-gray-700 text-sm flex items-center">
             <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             PREDICTIVE HORIZON:
           </span>
           <div className="flex bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setTimeHorizon('past')} className={`px-3 py-1 text-xs rounded font-medium transition-all ${timeHorizon === 'past' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Past 24h</button>
              <button onClick={() => setTimeHorizon('forecast')} className={`px-3 py-1 text-xs rounded font-medium transition-all ${timeHorizon === 'forecast' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Next 48h</button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* A. Predictive Model */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
           <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Predictive Infra Failure Model</h2>
           <div className="relative h-48 bg-gray-50 rounded-lg p-4 border border-dashed border-gray-200 flex items-end justify-around group">
               {/* Bar Chart Viz */}
               <div className="flex flex-col items-center w-full">
                  <div className="w-12 bg-red-400 rounded-t h-[80%] relative hover:bg-red-500 transition-colors shadow-sm">
                     <div className="absolute -top-5 w-full text-center text-[10px] font-bold text-red-600">85%</div>
                  </div>
                  <div className="text-[10px] font-bold text-gray-600 mt-1">Today</div>
               </div>
               <div className="flex flex-col items-center w-full">
                  <div className="w-12 bg-yellow-400 rounded-t h-[60%] hover:bg-yellow-500 transition-colors shadow-sm">
                     <div className="absolute -top-5 w-full text-center text-[10px] font-bold text-yellow-600">60%</div>
                  </div>
                  <div className="text-[10px] font-bold text-gray-600 mt-1">Tomorrow</div>
               </div>
               <div className="flex flex-col items-center w-full">
                  <div className="w-12 bg-green-400 rounded-t h-[30%] hover:bg-green-500 transition-colors shadow-sm">
                     <div className="absolute -top-5 w-full text-center text-[10px] font-bold text-green-600">30%</div>
                  </div>
                  <div className="text-[10px] font-bold text-gray-600 mt-1">Friday</div>
               </div>
           </div>
           
           <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded flex items-start space-x-2">
              <span className="text-lg">⚠️</span>
              <div>
                 <div className="text-xs font-bold text-red-800">ALERT: Zone D Risk Critical</div>
                 <div className="text-[10px] text-red-600 mt-0.5">85% probability of road failure due to heavy rain.</div>
              </div>
           </div>
        </div>

        {/* B. Sensor Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
           <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Real-Time Sensor Grid</h2>
           <div className="space-y-3 flex-1">
              <SensorRow name="Water Level (Drain 44-A)" time="1m ago" status="NORMAL" color="green" icon="💧" />
              <SensorRow name="Water Level (Drain 44-B)" time="30s ago" status="RISING" color="yellow" icon="💧" isPulse />
              <SensorRow name="Air Quality (Junction X)" time="Live" status="POOR (210)" color="red" icon="💨" />
           </div>
        </div>

        {/* C. GAUGE CHART (Restored) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:col-span-2">
           <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4 flex justify-between">
             <span>Civic Performance Index (SLA)</span>
             <span className="text-[10px] font-normal text-gray-500">Weekly Aggregate</span>
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4">
              {/* Gauge */}
              <div className="flex flex-col items-center justify-center">
                 <div className="relative w-32 h-32">
                   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                     <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                     <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="72, 100" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-gray-800">72%</span>
                      <span className="text-[10px] font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Fair</span>
                   </div>
                 </div>
                 <div className="w-full flex justify-between text-[10px] text-gray-400 mt-2 px-6">
                    <span>Poor</span>
                    <span>Good</span>
                 </div>
              </div>
              
              {/* Metrics */}
              <div className="space-y-3">
                 <MetricRow label="Avg Resolution Time" value="2.4 Days" sub="↓ 15%" color="green" />
                 <MetricRow label="AI Automation Rate" value="72% of tickets" color="blue" />
                 <MetricRow label="Worst Performing Ward" value="Ward 12 (Lagging)" color="red" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function SensorRow({ name, time, status, color, icon, isPulse }) {
    const bg = color === 'green' ? 'bg-green-100 text-green-700' : color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
    return (
        <div className="border border-gray-100 rounded p-2.5 flex justify-between items-center bg-gray-50 hover:bg-white transition-colors">
            <div className="flex items-center space-x-3">
            <div className={`p-1.5 rounded bg-gray-200 text-gray-600`}>{icon}</div>
            <div>
                <div className="font-semibold text-gray-800 text-xs">{name}</div>
                <div className="text-[10px] text-gray-500">{time}</div>
            </div>
            </div>
            <span className={`${bg} text-[10px] px-2 py-0.5 rounded font-bold border border-opacity-20 ${isPulse ? 'animate-pulse' : ''}`}>{status}</span>
        </div>
    )
}

function MetricRow({ label, value, sub, color }) {
    const textColor = color === 'green' ? 'text-green-600' : color === 'blue' ? 'text-blue-600' : 'text-red-600';
    return (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-xs font-medium text-gray-600">{label}</span>
            <span className={`text-xs font-bold ${textColor} flex items-center`}>
                {value} {sub && <span className="text-[10px] ml-1 bg-gray-200 px-1 rounded text-gray-600">{sub}</span>}
            </span>
        </div>
    )
}

// 8. MAP VIEW WRAPPER
// ----------------------------------------------------------------------
function MapView() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      let { data, error } = await supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fallback to 'incidents' table if civic_issues is empty
      if (!(Array.isArray(data) && data.length > 0)) {
        const { tableExists } = await import('../lib/supabase_helpers')
        const incidentsExists = await tableExists('incidents')
        if (incidentsExists) {
          const res2 = await supabase
            .from('incidents')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
          data = (res2 && res2.data) || data;
        } else {
          console.debug('MapView: no civic_issues rows and incidents table missing')
        }
      }

      const normalized = (Array.isArray(data) ? data : []).map(d => ({
        ...d,
        latitude: d.latitude != null ? parseFloat(d.latitude) : null,
        longitude: d.longitude != null ? parseFloat(d.longitude) : null,
      }));
      console.debug('MapView fetched incidents:', normalized.length);
      setIncidents(normalized);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
       <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-gray-800 text-sm">Full Intelligence Map</h2>
          <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 shadow-sm">Export GIS Data</button>
       </div>
       <div className="flex-1 bg-gray-50 relative min-h-0 flex items-center justify-center">
          {loading ? (
            <div className="text-gray-500 text-sm">Loading map data...</div>
          ) : incidents.length === 0 ? (
            <div className="text-gray-500 text-sm">No incidents with valid coordinates to display on map.</div>
          ) : (
            <div className="absolute inset-0">
              <DynamicMap incidents={incidents} userLocation={null} fillHeight />
            </div>
          )}
       </div>
    </div>
  )
}