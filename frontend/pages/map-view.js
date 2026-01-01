import dynamic from 'next/dynamic';
const DynamicMap = dynamic(() => import('../components/Map'), { ssr: false });

export default function MapView() {
  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Map wrapper — bleed to all edges */}
      <div className="flex-1 min-h-0" style={{ margin: 0, marginTop: `calc(-1 * var(--app-header-height))` }}>
        <div className="bg-white rounded-none border-0 p-0 shadow-none h-full min-h-0 overflow-hidden">
          <div className="h-full w-full">
            <DynamicMap fillHeight />
          </div>
        </div>
      </div>
    </div>
  );
}
