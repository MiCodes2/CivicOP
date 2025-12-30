import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Create a separate map component that will be dynamically imported
const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false });

const ModalMap = ({ onLocationSelect, selectedLocation }) => {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapComponent onLocationSelect={onLocationSelect} selectedLocation={selectedLocation} />
    </div>
  );
};

export default ModalMap;