import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIncidents();

    // Real-time subscription to keep dashboard in sync with governance actions
    const sub1 = supabase
      .channel('civic_issues_dashboard')
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

    let sub2 = null;
    import('../lib/supabase_helpers').then(({ tableExists }) => {
      tableExists('incidents').then(available => {
        if (!available) return
        sub2 = supabase
          .channel('incidents_dashboard')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
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

    return () => { sub1.unsubscribe(); if (sub2) sub2.unsubscribe(); };
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const total = incidents.length;
  const statusCounts = useMemo(() => incidents.reduce((acc, i) => {
    const s = i.status || 'unknown'; acc[s] = (acc[s] || 0) + 1; return acc;
  }, {}), [incidents]);

  const categoryCounts = useMemo(() => incidents.reduce((acc, i) => {
    const c = (i.category || 'other').toLowerCase(); acc[c] = (acc[c] || 0) + 1; return acc;
  }, {}), [incidents]);

  const severityCounts = useMemo(() => incidents.reduce((acc, i) => {
    const sev = i.severity || 3; 
    acc[sev] = (acc[sev] || 0) + 1; 
    return acc;
  }, {}), [incidents]);

  const recent = incidents.slice().sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,6);

  // Data for charts
  const last7 = useMemo(() => {
    const days = Array.from({length:7}).map((_,i) => {
      const d = new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0); return {date:d, key:d.toISOString().slice(0,10), count:0, label: new Date(d).toLocaleDateString(undefined, {month:'short', day:'numeric'})};
    }).reverse();
    incidents.forEach(i => {
      const k = (new Date(i.created_at)).toISOString().slice(0,10);
      const day = days.find(dd => dd.key === k);
      if (day) day.count++;
    });
    return days;
  }, [incidents]);

  const categoryData = useMemo(() => 
    Object.entries(categoryCounts)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,6)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })),
    [categoryCounts]
  );

  const severityData = useMemo(() => {
    const labels = ['Low', 'Minor', 'Medium', 'High', 'Critical'];
    return Array.from({length:5}).map((_, i) => ({
      name: labels[i],
      value: severityCounts[i+1] || 0
    }));
  }, [severityCounts]);

  const statusData = useMemo(() => 
    Object.entries(statusCounts)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })),
    [statusCounts]
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const statusOrder = ['reported','processing','assigned','verified','resolved'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">High level summary for all users. Detailed views are in Governance (officials).</p>
        </div>
        <div>
          <button onClick={fetchIncidents} className="inline-flex items-center px-3 py-1.5 bg-water text-white rounded-md shadow-sm text-sm">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg border p-6 shadow-sm space-y-6">
          <div>
            <h2 className="font-semibold mb-4 text-lg">Summary</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">Total Reports</div>
                <div className="text-3xl font-bold text-blue-900">{total}</div>
              </div>

              {statusOrder.map((s) => (
                <div key={s} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">{s.charAt(0).toUpperCase()+s.slice(1)}</div>
                  <div className="text-2xl font-bold text-gray-900">{statusCounts[s] || 0}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Chart - Last 7 Days */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Reports Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 6 }} name="Reports" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Issues by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" name="Count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Distribution */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Issues by Severity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" name="Count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Recent Reports</h2>

          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-sm text-red-500">{error}</div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-gray-500">No recent reports.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recent.map(it => (
                <div key={it.id} className="p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{(it.category || 'Issue').charAt(0).toUpperCase() + (it.category || 'Issue').slice(1)}</div>
                      <div className="text-xs text-gray-500">{it.description ? (it.description.length > 100 ? it.description.slice(0,100)+'...' : it.description) : 'No description'}</div>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(it.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 text-right">
            <Link href="/governance" className="text-sm text-water font-medium">View detailed reports</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
