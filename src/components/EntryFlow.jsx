import React, { useState } from 'react';
import CameraCapture from './CameraCapture';
import { guestApi } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { User, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';

const EntryFlow = () => {
  const [name, setName] = useState('');
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkedInId, setCheckedInId] = useState(null);

  const handleCheckIn = async () => {
    if (!name || !selfie) {
      setError('Name and selfie are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 3: Configure Columns (register triggers Entry Time = NOW and Status = In)
      const response = await guestApi.register(name, selfie);
      if (response && response.status === 'success') {
        setCheckedInId(response.id);
      } else {
        setError(response?.message || 'Check-in failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSelfie(null);
    setCheckedInId(null);
    setError(null);
  };

  if (checkedInId) {
    return (
      <div className="flex flex-col items-center text-center animate-fade-in py-4">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Check-in Complete</h1>
        <p className="text-slate-400 mb-10 px-4">Welcome, <span className="text-white font-semibold">{name}</span>. Your entry has been recorded.</p>
        
        <div className="bg-white p-6 rounded-[2.5rem] inline-block mb-10 shadow-2xl scale-110">
          <QRCodeSVG value={checkedInId} size={180} />
          <p className="text-slate-900 mt-4 font-bold text-[10px] tracking-[0.3em] opacity-40 uppercase">GUEST ID</p>
          <p className="text-slate-900 font-bold text-xs">{checkedInId}</p>
        </div>

        <button className="btn-primary w-full max-w-[280px] rounded-2xl py-4 flex items-center justify-center gap-2" onClick={resetForm}>
          <span>Done</span>
          <CheckCircle2 size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Guest Entry</h2>
        <p className="text-slate-500 text-sm">Please provide your details for registration.</p>
      </div>

      <div className="glass-card !p-6 !rounded-3xl animate-fade-in border-primary/10">
        <div className="space-y-6">
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               Selfie Verification
             </label>
             <div className="!max-w-none">
               <CameraCapture image={selfie} onCapture={setSelfie} />
             </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               Guest Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                className="input-field pl-12 h-14 !rounded-2xl"
                placeholder="Enter Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl flex items-center gap-3 animate-fade-in">
              <AlertCircle size={18} />
              <span className="text-sm font-semibold">{error}</span>
            </div>
          )}

          <button 
            className="btn-primary w-full h-15 !rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95" 
            onClick={handleCheckIn} 
            disabled={loading || !name || !selfie}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Recording Entry...</span>
              </>
            ) : (
              <span>Complete Check-In</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryFlow;
