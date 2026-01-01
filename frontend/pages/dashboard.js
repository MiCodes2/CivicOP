import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8040/api/v1/incidents/');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
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

  const recent = incidents.slice().sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,6);

  const last7 = useMemo(() => {
    const days = Array.from({length:7}).map((_,i) => {
      const d = new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0); return {date:d, key:d.toISOString().slice(0,10), count:0};
    }).reverse();
    incidents.forEach(i => {
      const k = (new Date(i.created_at)).toISOString().slice(0,10);
      const day = days.find(dd => dd.key === k);
      if (day) day.count++;
    });
    return days;
  }, [incidents]);

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
        <div className="col-span-2 bg-white rounded-lg border p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Summary</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Total Reports</div>
              <div className="text-2xl font-bold">{total}</div>
            </div>

            {statusOrder.map((s) => (
              <div key={s} className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">{s.charAt(0).toUpperCase()+s.slice(1)}</div>
                <div className="text-2xl font-bold">{statusCounts[s] || 0}</div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Last 7 days</h3>
            <div className="w-full h-20 flex items-end space-x-2">
              {last7.map(d => (
                <div key={d.key} className="flex-1">
                  <div style={{height: `${Math.max(6, (d.count / (Math.max(1, Math.max(...last7.map(x => x.count))))||1) * 100)}%`}} className="bg-water rounded-t" />
                  <div className="text-[10px] text-gray-500 text-center mt-1">{new Date(d.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">By Category</h3>
            <div className="space-y-2">
              {Object.entries(categoryCounts).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([cat, cnt]) => {
                const pct = Math.round((cnt / (total || 1)) * 100);
                return (
                  <div key={cat} className="flex items-center space-x-3">
                    <div className="w-36 text-sm text-gray-700 capitalize">{cat}</div>
                    <div className="flex-1 bg-gray-100 h-3 rounded overflow-hidden">
                      <div className="h-full bg-water" style={{width: `${pct}%`}} />
                    </div>
                    <div className="w-12 text-right text-sm text-gray-700">{cnt}</div>
                  </div>
                );
              })}
            </div>
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
