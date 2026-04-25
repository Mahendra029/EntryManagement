import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Loader2, User } from 'lucide-react';

const CameraCapture = ({ onCapture, image }) => {
  const webcamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc);
  }, [webcamRef, onCapture]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative aspect-square sm:aspect-video lg:aspect-square bg-slate-950 rounded-3xl overflow-hidden border-4 border-white/5 shadow-inner">
        {!image ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              onUserMedia={() => setIsReady(true)}
              className="w-full h-full object-cover grayscale opacity-80"
            />
            {/* HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none p-8 flex items-center justify-center">
              <div className="w-full h-full border-2 border-dashed border-white/10 rounded-2xl relative">
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary" />
              </div>
            </div>
            
            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-slate-400 text-sm font-medium">Calibrating Camera...</p>
              </div>
            )}
          </>
        ) : (
          <img 
            src={image} 
            alt="Captured selfie" 
            className="w-full h-full object-cover animate-fade-in" 
          />
        )}
      </div>

      <div className="flex gap-4">
        {!image ? (
          <button 
            className="btn-primary flex-1 flex items-center justify-center gap-2 group" 
            onClick={capture} 
            disabled={!isReady}
          >
            <div className="p-1 px-1 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
              <Camera size={18} />
            </div>
            <span>Capture Verification</span>
          </button>
        ) : (
          <button 
            className="btn-outline flex-1 flex items-center justify-center gap-2 group" 
            onClick={() => onCapture(null)}
          >
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>Retake Photo</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
