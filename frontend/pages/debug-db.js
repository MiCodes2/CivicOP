import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function DebugDB() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  const checkDB = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('civic_issues')
        .select('id, address, latitude, longitude, status, updated_at')
        .order('updated_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setIncidents(data || []);
      // eslint-disable-next-line no-console
      console.log('Direct DB query result:', data);
    } catch (err) {
      console.error('DB query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug: Direct Database Query</h1>
      
      <button 
        onClick={checkDB}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
        disabled={loading}
      >
        {loading ? 'Querying...' : 'Query Database'}
      </button>

      <div className="bg-gray-50 border rounded p-4">
        <h2 className="font-bold mb-2">Last 30 incidents (ordered by updated_at DESC):</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Address</th>
                <th className="border p-2 text-left">Lat</th>
                <th className="border p-2 text-left">Lon</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(i => (
                <tr key={i.id} className="hover:bg-gray-100">
                  <td className="border p-2 font-mono">{String(i.id).slice(0, 8)}</td>
                  <td className="border p-2">{i.address || '(none)'}</td>
                  <td className="border p-2 text-right">{i.latitude?.toFixed(4)}</td>
                  <td className="border p-2 text-right">{i.longitude?.toFixed(4)}</td>
                  <td className="border p-2"><span className="px-1 py-0.5 bg-blue-100 rounded text-xs">{i.status}</span></td>
                  <td className="border p-2 text-xs text-gray-600">{new Date(i.updated_at).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {incidents.length === 0 && !loading && (
          <p className="text-gray-500 text-sm">Click "Query Database" to see results</p>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <p className="font-bold mb-2">🔧 Instructions:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Query Database" to fetch all incidents with their addresses</li>
          <li>Look for resolved incidents and check if their addresses match what you saw in the UI</li>
          <li>If addresses are different in the DB vs. UI, the update never persisted</li>
          <li>If addresses match the old values, the "Set to Tonique" update didn't save</li>
          <li>If addresses are fresh, then the issue is purely a frontend caching problem</li>
        </ol>
      </div>
    </div>
  );
}
