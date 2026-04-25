import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';

const QRGenerator = () => {
  const [guests, setGuests] = useState([]);
  const [activeGuest, setActiveGuest] = useState(null);
  const [activeStatus, setActiveStatus] = useState('Pending');
  
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

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!userName.trim() || !selfie) return;

    const newId = uuidv4();
    const newGuest = { id: newId, name: userName, selfie: selfie };
    const updatedWallet = [...guests, newGuest];

    setGuests(updatedWallet);
    setActiveGuest(newGuest);
    setActiveStatus('Pending');
    setIsRegistering(false);
    setUserName('');
    setSelfie(null);
    localStorage.setItem('guest_wallet', JSON.stringify(updatedWallet));

    fetch(baseURL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upload_selfie', id: newId, name: userName, image: selfie })
    }).catch(err => console.error("Sync failed", err));
  };

  useEffect(() => {
    if (!activeGuest) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${baseURL}?id=${activeGuest.id}&action=check_status`);
        const data = await res.json();
        
        setActiveStatus(data.status);

        if (data.status === 'Out') {
          const updatedWallet = guests.filter(g => g.id !== activeGuest.id);
          setGuests(updatedWallet);
          localStorage.setItem('guest_wallet', JSON.stringify(updatedWallet));
          if (updatedWallet.length > 0) setActiveGuest(updatedWallet[0]);
          else { setActiveGuest(null); setIsRegistering(true); }
        }
      } catch (err) { console.error("Poll error", err); }
    }, 5000); // Polling every 5 seconds for faster response

    return () => clearInterval(interval);
  }, [activeGuest, guests]);

  const qrValue = activeGuest ? `${baseURL}?id=${activeGuest.id}&name=${encodeURIComponent(activeGuest.name)}` : '';

  if (isRegistering) {
    return (
      <div className="flex-1 flex flex-col items-center justify-start pt-10 pb-6 animate-in slide-in-from-bottom duration-500 h-full overflow-hidden">
        <div className="text-center px-4 mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Add New Guest</h2>
          <p className="text-xs text-gray-400 mt-1">Register a person to generate their pass</p>
        </div>

        <form onSubmit={handleGenerate} className="w-full max-w-[320px] space-y-6 px-4 flex flex-col items-center">
          <div className="relative w-[240px] h-[240px] bg-white/5 border-2 border-dashed border-white/10 rounded-full overflow-hidden flex flex-col items-center justify-center shadow-2xl">
            {isCameraOpen ? (
              <div className="relative w-full h-full">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-full" />
                <button type="button" onClick={capturePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full border-4 border-primary shadow-2xl active:scale-90 transition-transform" />
              </div>
            ) : selfie ? (
              <div className="relative w-full h-full">
                <img src={selfie} className="w-full h-full object-cover rounded-full" alt="Selfie" />
                <button type="button" onClick={() => setSelfie(null)} className="absolute top-4 right-8 p-2 bg-red-500 rounded-full text-white shadow-lg">
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
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Full Name" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 text-base focus:ring-2 focus:ring-primary/50 transition-all outline-none" required />
            <div className="flex gap-3">
              {guests.length > 0 && (
                <button type="button" onClick={() => setIsRegistering(false)} className="flex-1 py-4 bg-white/5 text-gray-400 font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
              )}
              <button type="submit" disabled={!selfie} className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all">
                Generate Pass
              </button>
            </div>
          </div>
        </form>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const selfieImg = new Image();

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 800;
      
      // Draw white background
      ctx.fillStyle = "white";
      ctx.roundRect(0, 0, 600, 800, 60);
      ctx.fill();

      // Draw QR Code
      ctx.drawImage(img, 50, 50, 500, 500);
      
      // Draw Selfie in the center
      selfieImg.onload = () => {
        const size = 130; // Size of the selfie in the download
        const x = 300 - size/2;
        const y = 300 - size/2;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(300, 300, size/2, 0, Math.PI * 2);
        ctx.closePath();
        
        // Fill with white first to hide any square corners from the QR hole
        ctx.fillStyle = "white";
        ctx.fill();
        
        ctx.clip();
        ctx.drawImage(selfieImg, x, y, size, size);
        ctx.restore();

        // Draw border for selfie
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(300, 300, size/2, 0, Math.PI * 2);
        ctx.stroke();

        // Add Name and Status
        ctx.fillStyle = "#1e293b";
        ctx.font = "900 52px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(activeGuest.name.toUpperCase(), 300, 640);
        
        ctx.font = "bold 24px Outfit, sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("DIGITAL GUEST PASS ACTIVE", 300, 700);

        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${activeGuest.name}_Pass.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      selfieImg.src = activeGuest.selfie;
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden py-2 animate-in fade-in duration-500">
      <div className="w-full overflow-x-auto hide-scrollbar flex items-center gap-3 px-6 py-2">
        {guests.map((g) => (
          <button key={g.id} onClick={() => setActiveGuest(g)} className={`flex-shrink-0 w-14 h-14 rounded-2xl p-0.5 transition-all duration-300 ${activeGuest?.id === g.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg' : 'opacity-40 scale-90'}`}>
            <img src={g.selfie} className="w-full h-full object-cover rounded-xl" alt={g.name} />
          </button>
        ))}
        <button onClick={() => setIsRegistering(true)} className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      {activeGuest && (
        <div className="flex-1 flex flex-col items-center justify-start pt-8 p-4 animate-in zoom-in-95 duration-300">
          <div className="w-full max-w-[320px] bg-white pt-12 pb-10 px-8 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
            <div className="relative">
              <QRCodeSVG 
                id="qr-code-svg"
                value={qrValue} 
                size={220} 
                level="H" 
                imageSettings={{ height: 54, width: 54, excavate: true }} 
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] pointer-events-none">
                <div className="w-full h-full rounded-full border-[3px] border-white bg-white overflow-hidden shadow-sm flex items-center justify-center">
                  <img src={activeGuest.selfie} className="w-full h-full object-cover rounded-full" alt="logo" />
                </div>
              </div>
            </div>
            
            <div className="text-center pb-2">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">{activeGuest.name}</h3>
              <p className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">
                {activeStatus === 'In' ? 'PASSPORT ACTIVE' : 'Guest Pass Active'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4 mt-6">
            <button 
              onClick={downloadQR}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Pass Image
            </button>
            
            {activeStatus !== 'In' && (
              <button 
                onClick={() => {
                  const updatedWallet = guests.filter(g => g.id !== activeGuest.id);
                  setGuests(updatedWallet);
                  localStorage.setItem('guest_wallet', JSON.stringify(updatedWallet));
                  if (updatedWallet.length > 0) setActiveGuest(updatedWallet[0]);
                  else { setActiveGuest(null); setIsRegistering(true); }
                }}
                className="text-[10px] font-bold text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-all"
              >
                Cancel this pass
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;
