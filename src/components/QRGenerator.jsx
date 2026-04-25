import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';

const QRGenerator = () => {
  const [guests, setGuests] = useState([]);
  const [activeGuest, setActiveGuest] = useState(null);
  
  const [userName, setUserName] = useState('');
  const [selfie, setSelfie] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const SCRIPT_ID = 'AKfycbxk5pQWKxzYfriWb-8j8orLWe8rcz5gyX4_S6GkQWeuYKcBOhBjpNCWLCjxdANCGj3C';
  const baseURL = `https://script.google.com/macros/s/${SCRIPT_ID}/exec`;

  useEffect(() => {
    const savedGuests = JSON.parse(localStorage.getItem('guest_wallet') || '[]');
    setGuests(savedGuests);
    if (savedGuests.length > 0) {
      setActiveGuest(savedGuests[0]);
    } else {
      setIsRegistering(true);
    }
  }, []);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera.");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const size = Math.min(video.videoWidth, video.videoHeight);
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      canvas.width = 400;
      canvas.height = 400;
      canvas.getContext('2d').drawImage(video, startX, startY, size, size, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setSelfie(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !selfie) return;

    setUploading(true);
    const newId = uuidv4();

    try {
      await fetch(baseURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upload_selfie', id: newId, name: userName, image: selfie })
      });

      const newGuest = { id: newId, name: userName, selfie: selfie };
      const updatedWallet = [...guests, newGuest];
      
      setGuests(updatedWallet);
      setActiveGuest(newGuest);
      setIsRegistering(false);
      setUserName('');
      setSelfie(null);
      
      localStorage.setItem('guest_wallet', JSON.stringify(updatedWallet));
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // Auto-Polling to check if the ACTIVE guest has scanned out
  useEffect(() => {
    if (!activeGuest) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${baseURL}?id=${activeGuest.id}&action=check_status`);
        const data = await res.json();
        if (data.status === 'Out') {
          // Remove this guest from wallet upon exit
          const updatedWallet = guests.filter(g => g.id !== activeGuest.id);
          setGuests(updatedWallet);
          localStorage.setItem('guest_wallet', JSON.stringify(updatedWallet));
          
          if (updatedWallet.length > 0) {
            setActiveGuest(updatedWallet[0]);
          } else {
            setActiveGuest(null);
            setIsRegistering(true);
          }
        }
      } catch (err) { console.error("Poll error", err); }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeGuest, guests]);

  if (isRegistering) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-6 animate-in slide-in-from-bottom duration-500 h-full overflow-hidden">
        <div className="text-center px-4 mb-10">
          <h2 className="text-3xl font-bold text-white tracking-tight">Add New Guest</h2>
          <p className="text-sm text-gray-400 mt-2">Register a person to generate their pass</p>
        </div>

        <form onSubmit={handleGenerate} className="w-full max-w-[320px] space-y-8 px-4 flex flex-col items-center">
          <div className="relative w-full aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center max-h-[260px] shadow-2xl">
            {isCameraOpen ? (
              <div className="relative w-full h-full">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <button type="button" onClick={capturePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full border-4 border-primary shadow-2xl active:scale-90 transition-transform" />
              </div>
            ) : selfie ? (
              <div className="relative w-full h-full">
                <img src={selfie} className="w-full h-full object-cover" alt="Selfie" />
                <button type="button" onClick={() => setSelfie(null)} className="absolute top-4 right-4 p-2 bg-red-500 rounded-full text-white shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ) : (
              <button type="button" onClick={startCamera} className="flex flex-col items-center space-y-3 text-gray-400 hover:text-white transition-all group">
                <div className="p-5 bg-white/5 rounded-full group-hover:bg-primary/20 transition-all transform group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                <span className="text-xs uppercase font-black tracking-widest">Take Selfie</span>
              </button>
            )}
          </div>

          <div className="w-full space-y-4">
            <input 
              type="text" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
              placeholder="Full Name" 
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 text-base focus:ring-2 focus:ring-primary/50 transition-all outline-none" 
              required 
            />
            
            <div className="flex gap-3">
              {guests.length > 0 && (
                <button type="button" onClick={() => setIsRegistering(false)} className="flex-1 py-4 bg-white/5 text-gray-400 font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
              )}
              <button type="submit" disabled={uploading || !selfie} className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all">
                {uploading ? 'Uploading...' : 'Generate Pass'}
              </button>
            </div>
          </div>
        </form>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden py-2 animate-in fade-in duration-500">
      {/* GUEST WALLET SCROLLER */}
      <div className="w-full overflow-x-auto hide-scrollbar flex items-center gap-3 px-6 py-2">
        {guests.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGuest(g)}
            className={`flex-shrink-0 w-14 h-14 rounded-2xl p-0.5 transition-all duration-300 ${activeGuest?.id === g.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg' : 'opacity-40 scale-90'}`}
          >
            <img src={g.selfie} className="w-full h-full object-cover rounded-xl" alt={g.name} />
          </button>
        ))}
        <button 
          onClick={() => setIsRegistering(true)}
          className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      {/* ACTIVE PASS */}
      {activeGuest && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-300">
          <div className="w-full max-w-[320px] bg-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent"></div>
            
            <div className="relative">
              <QRCodeSVG 
                value={`${baseURL}?id=${activeGuest.id}&name=${encodeURIComponent(activeGuest.name)}`} 
                size={200} 
                level="H" 
                imageSettings={{ src: activeGuest.selfie, height: 50, width: 50, excavate: true }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] pointer-events-none">
                <div className="w-full h-full rounded-full border-[2.5px] border-white overflow-hidden shadow-sm">
                  <img src={activeGuest.selfie} className="w-full h-full object-cover" alt="logo" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-tight">{activeGuest.name}</h3>
              <p className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Guest Pass Active</p>
            </div>
            
            <div className="w-full pt-3 border-t border-gray-100 flex justify-center">
               <span className="text-[9px] font-bold text-gray-200 uppercase tracking-widest">Digital Entry Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;
