import { useMemo } from 'react';

const DEMO_JOBS = [
  { id: 'job-321', task: 'Image analysis', status: 'success', duration: '12s', accuracy: 0.87, time: '2025-12-31T09:12:00Z' },
  { id: 'job-320', task: 'Classification', status: 'running', duration: '—', accuracy: null, time: '2025-12-31T08:55:00Z' },
  { id: 'job-319', task: 'Image analysis', status: 'failed', duration: '8s', accuracy: 0.0, time: '2025-12-30T21:40:00Z' },
  { id: 'job-318', task: 'Segmentation', status: 'success', duration: '45s', accuracy: 0.92, time: '2025-12-30T12:10:00Z' },
];

export default function AIHub() {
  const counts = useMemo(() => DEMO_JOBS.reduce((acc, j) => { acc[j.status] = (acc[j.status]||0)+1; return acc }, {}), []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">AI Hub</h1>
          <p className="text-sm text-gray-600">Processing metrics and recent job history (demo).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg border p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Jobs Overview</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Running</div>
              <div className="text-2xl font-bold">{counts.running || 0}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Success</div>
              <div className="text-2xl font-bold">{counts.success || 0}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Failed</div>
              <div className="text-2xl font-bold">{counts.failed || 0}</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Recent Jobs</h3>
            <div className="divide-y divide-gray-200">
              {DEMO_JOBS.map(j => (
                <div key={j.id} className="p-3 flex justify-between items-start hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{j.task} <span className="text-xs text-gray-400">{j.id}</span></div>
                    <div className="text-xs text-gray-500">{new Date(j.time).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${j.status === 'success' ? 'bg-green-50 text-green-700' : j.status === 'running' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>{j.status}</div>
                    <div className="text-xs text-gray-500 mt-1">{j.duration} • {j.accuracy ? `${Math.round(j.accuracy*100)}%` : '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Capabilities</h2>

          <div className="flex items-center justify-between space-x-2 mb-4">
            <div className="flex-1 text-center p-2 bg-gray-50 rounded">Upload</div>
            <div className="text-2xl">→</div>
            <div className="flex-1 text-center p-2 bg-gray-50 rounded">AI Analysis</div>
            <div className="text-2xl">→</div>
            <div className="flex-1 text-center p-2 bg-gray-50 rounded">Verification</div>
          </div>

          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Object detection & localization for civic issues</li>
            <li>• Scene classification and automated tagging</li>
            <li>• Automated quality checks and anomaly detection</li>
            <li>• Privacy-preserving processing — PII is not retained</li>
            <li>• Integration-ready outputs for governance workflows</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
