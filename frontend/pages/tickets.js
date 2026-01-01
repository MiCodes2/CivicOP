import { useMemo } from 'react';

const DEMO_TICKETS = [
  { id: 1005, title: 'Broken Streetlight', ward: 'Ward 12', status: 'reported', created_at: '2025-12-30T12:34:00Z' , assigned_to: null},
  { id: 1004, title: 'Illegal Dumping', ward: 'Ward 07', status: 'processing', created_at: '2025-12-29T09:12:00Z', assigned_to: 'Sanitation Team'},
  { id: 1003, title: 'Flooded Road', ward: 'Ward 02', status: 'assigned', created_at: '2025-12-28T18:20:00Z', assigned_to: 'Roads Dept'},
  { id: 1002, title: 'Pothole Large', ward: 'Ward 19', status: 'verified', created_at: '2025-12-27T07:05:00Z', assigned_to: 'Roads Dept'},
  { id: 1001, title: 'Garbage Overflow', ward: 'Ward 18', status: 'resolved', created_at: '2025-12-26T16:40:00Z', assigned_to: 'Sanitation Team'},
];

export default function Tickets() {
  const counts = useMemo(() => DEMO_TICKETS.reduce((acc, t) => { acc[t.status] = (acc[t.status]||0)+1; return acc }, {}), []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-sm text-gray-600">Public-facing ticket summary and quick actions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded border">
          <div className="text-sm text-gray-500">Total Tickets</div>
          <div className="text-2xl font-bold">{DEMO_TICKETS.length}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded border">
          <div className="text-sm text-gray-500">Reported</div>
          <div className="text-2xl font-bold">{counts.reported || 0}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded border">
          <div className="text-sm text-gray-500">Processing</div>
          <div className="text-2xl font-bold">{counts.processing || 0}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded border">
          <div className="text-sm text-gray-500">Resolved</div>
          <div className="text-2xl font-bold">{counts.resolved || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <h2 className="font-semibold mb-3">Recent Tickets</h2>
        <div className="divide-y divide-gray-200">
          {DEMO_TICKETS.map(t => (
            <div key={t.id} className="p-3 flex justify-between items-start hover:bg-gray-50">
              <div>
                <div className="font-medium">#{t.id} {t.title}</div>
                <div className="text-xs text-gray-500">{t.ward} • {new Date(t.created_at).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${t.status === 'resolved' ? 'bg-green-50 text-green-700' : t.status === 'processing' ? 'bg-blue-50 text-blue-700' : t.status === 'assigned' ? 'bg-yellow-50 text-yellow-700' : 'bg-orange-50 text-orange-700'}`}>{t.status}</div>
                <div className="text-xs text-gray-500 mt-1">{t.assigned_to || 'Unassigned'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
