import React, { useState, useEffect } from 'react';
import { guestApi } from '../services/api';
import { Search, LogOut, Loader2, CheckCircle, User, Clock, MapPin } from 'lucide-react';

const ExitFlow = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkingOut, setCheckingOut] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const data = await guestApi.getInGuests();
      setGuests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (id) => {
    setCheckingOut(id);
    try {
      const response = await guestApi.checkOut(id);
      if (response && response.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          fetchGuests();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingOut(null);
    }
  };

  const filteredGuests = guests.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white px-1">Checking out?</h2>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search your name..."
            className="input-field pl-12 h-14 !rounded-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-slate-500 font-medium">Fetching records...</p>
        </div>
      ) : filteredGuests.length > 0 ? (
        <div className="space-y-4">
          {filteredGuests.map(guest => (
            <div key={guest.id} className="glass-card !p-4 !rounded-[2rem] flex items-center gap-4 group active:scale-95 transition-all">
              <div className="relative flex-shrink-0">
                <img
                  src={guest.photo}
                  alt={guest.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/5"
                />
              </div>

              <div className="flex-1 overflow-hidden">
                <p className="text-white font-bold truncate">{guest.name}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wide">
                  <Clock size={10} />
                  <span>In at {guest.entryTime}</span>
                </div>
              </div>

              <button
                className={`w-12 h-12 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all ${checkingOut === guest.id ? 'opacity-50' : ''}`}
                onClick={() => handleCheckOut(guest.id)}
                disabled={checkingOut === guest.id}
              >
                {checkingOut === guest.id ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <LogOut size={20} />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <User className="text-slate-800" size={32} />
          </div>
          <p className="text-slate-500">No active guests found</p>
        </div>
      )}

      {success && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-4 bg-green-500 text-white rounded-2xl shadow-xl flex items-center justify-center gap-3 animate-fade-in z-50">
          <CheckCircle size={20} />
          <span className="font-bold text-sm">Checked out successfully!</span>
        </div>
      )}
    </div>
  );
};

export default ExitFlow;
