const DEMO_SENSORS = [
  { id: 'S-101', type: 'Air Quality', location: 'Ward 12', status: 'online', value: 42, unit: 'AQI', last_seen: '2025-12-31T09:00:00Z' },
  { id: 'S-102', type: 'Flood Sensor', location: 'Ward 02', status: 'offline', value: null, unit: '', last_seen: '2025-12-29T20:12:00Z' },
  { id: 'S-103', type: 'Noise', location: 'Ward 07', status: 'online', value: 58, unit: 'dB', last_seen: '2025-12-31T08:55:00Z' },
  { id: 'S-104', type: 'Temperature', location: 'Ward 19', status: 'online', value: 30, unit: '°C', last_seen: '2025-12-31T08:30:00Z' },
  { id: 'S-105', type: 'Water Level', location: 'Ward 02', status: 'online', value: 1.2, unit: 'm', last_seen: '2025-12-31T08:05:00Z' },
];

export default function IoTSensors() {
  const onlineCount = DEMO_SENSORS.filter(s => s.status === 'online').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">IoT Sensors</h1>
          <p className="text-sm text-gray-600">Public sensors overview (demo-ready).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded border">
          <div className="text-sm text-gray-500">Total Sensors</div>
          <div className="text-2xl font-bold">{DEMO_SENSORS.length}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded border">
          <div className="text-sm text-gray-500">Online</div>
          <div className="text-2xl font-bold">{onlineCount}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded border">
          <div className="text-sm text-gray-500">Offline</div>
          <div className="text-2xl font-bold">{DEMO_SENSORS.length - onlineCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <h2 className="font-semibold mb-3">Sensor Grid</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEMO_SENSORS.map(s => (
            <div key={s.id} className="border rounded p-3 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.id} • {s.type}</div>
                  <div className="text-xs text-gray-500">{s.location}</div>
                </div>
                <div>
                  <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${s.status === 'online' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{s.status}</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm text-gray-600">Value</div>
                <div className="text-lg font-bold">{s.value !== null ? `${s.value} ${s.unit}` : '—'}</div>
                <div className="text-xs text-gray-400 mt-1">Last seen: {new Date(s.last_seen).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
