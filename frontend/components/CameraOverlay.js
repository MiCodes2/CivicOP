import { useState, useRef } from 'react';

export default function CameraOverlay({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('Initializing camera...');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      videoRef.current.srcObject = stream;
      setIsStreaming(true);
      setAiFeedback('Scanning for road surface...');

      // Simulate AI feedback
      setTimeout(() => setAiFeedback('Road surface detected!'), 2000);
      setTimeout(() => setAiFeedback('Ready to capture'), 4000);
    } catch (error) {
      console.error('Camera error:', error);
      setAiFeedback('Camera access denied');
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      onCapture(blob);
      // Stop camera
      const stream = video.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black bg-opacity-50 text-white">
        <h2 className="text-lg font-semibold">Report Issue</h2>
        <button onClick={onClose} className="text-white text-2xl">×</button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          onLoadedMetadata={startCamera}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* AI Feedback Overlay */}
        <div className="absolute bottom-20 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
          <p className="text-center font-medium">{aiFeedback}</p>
        </div>

        {/* Capture Button */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            onClick={capturePhoto}
            disabled={!isStreaming}
            className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-16 h-16 bg-transport rounded-full mx-auto"></div>
          </button>
        </div>
      </div>
    </div>
  );
}