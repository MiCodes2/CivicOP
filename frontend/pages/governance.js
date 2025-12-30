import { useState } from 'react';
import dynamic from 'next/dynamic';

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
// 2. MAIN LAYOUT (TOP NAV + FULL WIDTH APP SHELL)
// ----------------------------------------------------------------------
export default function GovernanceDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  
  // Shared State
  const [filters, setFilters] = useState({
    ward: 'Ward 44',
    category: 'Infra',
    aiScore: '80'
  });

  return (
    // ROOT: Full viewport, no window scroll
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans text-gray-900">
      
      {/* A. GLOBAL HEADER (Replaces Sidebar) */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0 z-30 shadow-sm relative">
         {/* Left: Brand & Navigation */}
         <div className="flex items-center space-x-6">
            {/* Brand */}
            <div className="flex items-center space-x-3">
               <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
               </div>
               <div>
                 <span className="block font-bold text-gray-800 text-lg leading-tight tracking-tight">CivicOP</span>
               </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200"></div>

            {/* Top Navigation Tabs */}
            <nav className="flex space-x-1">
               <NavTab label="Dashboard" icon="📊" active={activeNav === 'dashboard'} onClick={() => setActiveNav('dashboard')} />
               <NavTab label="Map View" icon="🗺️" active={activeNav === 'map'} onClick={() => setActiveNav('map')} />
               <NavTab label="Workflow Triage" icon="🎫" active={activeNav === 'tickets' || activeNav === 'ai'} onClick={() => setActiveNav('tickets')} />
               <NavTab label="Predictive & IoT" icon="📡" active={activeNav === 'iot'} onClick={() => setActiveNav('iot')} />
            </nav>
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

  return (
    <div className="flex h-full gap-3">
      
      {/* MAP INTELLIGENCE (Takes remaining width) */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm relative overflow-hidden group flex flex-col">
        {/* Map Header */}
        <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center bg-white shrink-0 z-10">
          <h2 className="font-semibold text-gray-800 text-sm flex items-center">
             Geospatial Intelligence Hub
          </h2>
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

        {/* Map Canvas */}
        <div className="flex-1 relative bg-gray-100">
          <DynamicMap incidents={[]} userLocation={null} />
          
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
          <h2 className="font-semibold text-gray-800 text-sm">Live Ingestion</h2>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold animate-pulse">LIVE</span>
        </div>
        <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-200">
           {/* Critical Item */}
           <div className="p-3 border-b border-gray-100 hover:bg-red-50/30 transition-colors border-l-4 border-l-red-500 bg-red-50/10 cursor-pointer group">
              <div className="flex justify-between items-start">
                  <div className="font-bold text-sm text-red-700 group-hover:underline">🔴 #9942 Pothole</div>
                  <div className="text-[10px] text-gray-400 font-mono">2m ago</div>
              </div>
              <div className="text-xs text-gray-600 mt-1">📍 Ward 44 • Main Rd</div>
              <div className="mt-2 flex justify-between items-center">
                  <span className="text-[10px] bg-white border border-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold shadow-sm">AI: 98%</span>
                  <span className="text-[10px] text-orange-600 font-bold">⚠️ SLA -4h</span>
              </div>
           </div>

           {/* Warning Item */}
           <div className="p-3 border-b border-gray-100 hover:bg-yellow-50/30 transition-colors border-l-4 border-l-yellow-500 bg-yellow-50/10 cursor-pointer">
              <div className="flex justify-between items-start">
                  <div className="font-bold text-sm text-yellow-700">🟡 #9941 Garbage</div>
                  <div className="text-[10px] text-gray-400 font-mono">10m ago</div>
              </div>
              <div className="text-xs text-gray-600 mt-1">📍 Ward 45 • 2nd Cross</div>
              <div className="mt-2">
                  <span className="text-[10px] bg-white border border-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold shadow-sm">AI: 75% (Dup?)</span>
              </div>
           </div>

           {/* Info Item */}
           <div className="p-3 border-b border-gray-100 hover:bg-blue-50/30 transition-colors border-l-4 border-l-blue-500 bg-blue-50/10 cursor-pointer">
              <div className="flex justify-between items-start">
                  <div className="font-bold text-sm text-blue-700">🔵 #9940 Streetlight</div>
                  <div className="text-[10px] text-gray-400 font-mono">25m ago</div>
              </div>
              <div className="text-xs text-gray-600 mt-1">📍 Ward 43 • Park View</div>
              <div className="mt-2">
                  <span className="text-[10px] bg-white border border-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold shadow-sm">AI: 92% Conf</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. KANBAN VIEW (Full Height Columns)
// ----------------------------------------------------------------------
function KanbanView({ filters, setFilters }) {
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
          <option>Infra</option>
          <option>Pothole</option>
          <option>Garbage</option>
        </select>
        
        <div className="h-4 w-px bg-gray-300"></div>
        
        <div className="flex items-center space-x-2">
           <span className="text-xs text-gray-500 font-bold">AI Conf &lt;</span>
           <input 
             type="number" 
             value={filters.aiScore} 
             onChange={(e) => setFilters({...filters, aiScore: e.target.value})} 
             className="w-10 text-xs border border-gray-300 rounded p-1 text-center" 
           />
           <span className="text-xs text-gray-500">%</span>
        </div>
        
        <div className="flex-1"></div>
        <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 shadow-sm font-medium">
          Generate Report
        </button>
      </div>

      {/* Full Height Columns Grid */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Column 1 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
           <div className="p-3 bg-red-50 border-b border-red-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">1. AI INGESTION (RAW)</h3>
              <span className="bg-white text-red-600 text-xs px-2 py-0.5 rounded border border-red-100 font-bold">12</span>
           </div>
           <div className="p-2 space-y-2 overflow-y-auto flex-1 bg-gray-50/50">
              <KanbanCard id="#9955" title="Streetlight" status="red" aiConfidence="99%" action="Auto-Move > Field Ops" />
              <KanbanCard id="#9954" title="Pothole" status="red" aiConfidence="92%" action="Auto-Move > Field Ops" />
              <KanbanCard id="#9952" title="Traffic Signal" status="red" aiConfidence="89%" action="Auto-Move > Field Ops" />
           </div>
        </div>

        {/* Column 2 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
           <div className="p-3 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">2. HUMAN REVIEW</h3>
              <span className="bg-white text-yellow-600 text-xs px-2 py-0.5 rounded border border-yellow-100 font-bold">5</span>
           </div>
           <div className="p-2 space-y-2 overflow-y-auto flex-1 bg-gray-50/50">
              <KanbanCard id="#9951" title="Drainage" status="yellow" aiConfidence="45%" action="Verify?" buttons={['Approve', 'Reject']} />
              <KanbanCard id="#9950" title="Garbage" status="yellow" aiConfidence="Poss Dup" action="Link: #9941" />
           </div>
        </div>

        {/* Column 3 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
           <div className="p-3 bg-green-50 border-b border-green-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">3. FIELD OPS ASSIGNED</h3>
              <span className="bg-white text-green-600 text-xs px-2 py-0.5 rounded border border-green-100 font-bold">8</span>
           </div>
           <div className="p-2 space-y-2 overflow-y-auto flex-1 bg-gray-50/50">
              <KanbanCard id="#9920" title="Road Repair" status="green" assigned="Contractor A" estimate="Today, 5PM" statusDetail="On-Site" />
              <KanbanCard id="#9918" title="Tree Fall" status="green" assigned="BBMP Team C" statusDetail="Resolved (Wait)" action="Final Signoff" />
              <KanbanCard id="#9915" title="Water Leak" status="green" assigned="Water Board" estimate="Tomorrow" />
           </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. KANBAN CARD (Detailed)
// ----------------------------------------------------------------------
function KanbanCard({ id, title, status, aiConfidence, action, buttons, assigned, statusDetail, estimate }) {
  const getColors = () => {
     if(status === 'red') return 'border-l-red-500 hover:shadow-red-100';
     if(status === 'yellow') return 'border-l-yellow-500 hover:shadow-yellow-100';
     return 'border-l-green-500 hover:shadow-green-100';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-l-4 ${getColors()}`}>
      <div className="flex justify-between items-start">
         <span className="font-bold text-sm text-gray-800 hover:text-blue-600 transition-colors">{id} {title}</span>
         {status === 'red' && <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"/>}
      </div>
      
      <div className="mt-2 space-y-1">
        {aiConfidence && (
             <div className="text-[10px] font-bold text-blue-600 bg-blue-50 inline-block px-1.5 py-0.5 rounded border border-blue-100">
               🤖 AI: {aiConfidence}
             </div>
        )}
        {assigned && (
          <div className="text-[10px] text-gray-600 flex items-center bg-gray-50 p-1 rounded w-fit">
             <span className="mr-1">👤</span> {assigned}
          </div>
        )}
        {(statusDetail || estimate) && (
          <div className="flex items-center space-x-2 text-[10px] text-gray-500">
            {statusDetail && <span>ℹ️ {statusDetail}</span>}
            {estimate && <span>🕒 {estimate}</span>}
          </div>
        )}
      </div>

      {(action || buttons) && <div className="mt-2 pt-2 border-t border-gray-100">
         {action && <div className="text-[10px] font-semibold text-gray-800 mb-1 flex items-center">
            <span className="w-1 h-1 bg-gray-400 rounded-full mr-1.5"></span>
            {action}
         </div>}
         
         {buttons && (
           <div className="flex space-x-2 mt-1">
             {buttons.map(btn => (
               <button key={btn} className={`flex-1 text-[10px] py-1 rounded font-bold transition-colors ${
                 btn === 'Approve' 
                   ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' 
                   : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
               }`}>
                 {btn}
               </button>
             ))}
           </div>
         )}
      </div>}
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

// ----------------------------------------------------------------------
// 8. MAP VIEW WRAPPER
// ----------------------------------------------------------------------
function MapView() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
           <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-semibold text-gray-800 text-sm">Full Intelligence Map</h2>
              <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 shadow-sm">Export GIS Data</button>
           </div>
           <div className="flex-1 bg-gray-50 relative">
               <DynamicMap incidents={[]} userLocation={null} />
           </div>
        </div>
    )
}