import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { guestApi } from '../services/api';
import { CheckCircle, XCircle, LogIn, LogOut, Loader2 } from 'lucide-react';

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    });

    scanner.render(onScanSuccess, onScanError);

    async function onScanSuccess(decodedText) {
      if (!loadingRef.current) {
        await processScan(decodedText);
      }
    }

    function onScanError(err) {
      // Ignored
    }

    return () => {
      scanner.clear().catch(e => console.error("Scanner clear error", e));
    };
  }, []);

  const processScan = async (id) => {
    loadingRef.current = true;
    setLoading(true);
    setScanResult(null);
    setError(null);
    
    try {
      const response = await guestApi.handleScan(id);
      if (response && response.status === 'success') {
        setScanResult(response);
        setTimeout(() => setScanResult(null), 3000);
      } else {
        setError(response?.message || 'Invalid QR Code');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Connection failed');
      setTimeout(() => setError(null), 3000);
    } finally {
      setTimeout(() => {
        setLoading(false);
        loadingRef.current = false;
      }, 3000); // Wait 3s before allowing next scan to prevent double scans
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10 max-w-md mx-auto">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white">Gate Scanner</h2>
        <p className="text-slate-500 text-sm">Scan Guest ID to Login/Logout</p>
      </div>

      <div className="relative glass-card !p-0 overflow-hidden rounded-[2.5rem] border-4 border-primary/20 bg-black min-h-[350px]">
        <div id="reader" className="w-full"></div>
        
        {/* Overlay when loading */}
        {loading && !scanResult && !error && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-40">
             <Loader2 className="animate-spin text-primary" size={48} />
             <p className="text-white font-bold">Processing ID...</p>
          </div>
        )}

        {/* Success Overlay */}
        {scanResult && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 z-50 animate-fade-in ${
            scanResult.mode === 'LOGIN' ? 'bg-green-600/90' : 'bg-blue-600/90'
          }`}>
             <div className="bg-white/20 p-4 rounded-full">
                {scanResult.mode === 'LOGIN' ? <LogIn size={64} className="text-white" /> : <LogOut size={64} className="text-white" />}
             </div>
             <div className="text-center px-6">
                <h3 className="text-2xl font-bold text-white mb-1 uppercase tracking-widest">{scanResult.mode}</h3>
                <p className="text-white/90 text-lg font-semibold">{scanResult.name}</p>
                <p className="text-white/70 text-xs mt-2">{scanResult.time}</p>
             </div>
             <CheckCircle size={32} className="text-white mt-4" />
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-red-600/90 flex flex-col items-center justify-center gap-4 z-50 animate-fade-in">
             <XCircle size={64} className="text-white" />
             <div className="text-center px-6">
                <h3 className="text-xl font-bold text-white mb-1 uppercase">Scan Failed</h3>
                <p className="text-white/90 font-medium">{error}</p>
             </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500 font-medium bg-white/5 py-3 rounded-2xl">
           Point camera at the Guest ID QR Code
        </p>
      </div>
    </div>
  );
};

export default Scanner;
