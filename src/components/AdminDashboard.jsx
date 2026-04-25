import React, { useState, useEffect } from 'react';
import { guestApi } from '../services/api';
import { Users, Clock, History, Search, Filter, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, inCount: 0, outCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [logsData, statsData] = await Promise.all([
        guestApi.getFullLogs(),
        guestApi.getStats()
      ]);
      setLogs(Array.isArray(logsData) ? logsData : []);
      setStats(statsData || { total: 0, inCount: 0, outCount: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <button className="p-2 bg-white/5 rounded-xl text-slate-400">
           <Filter size={18} />
        </button>
      </div>

      {/* Stats - Horizontal Scroll for Mobile */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
        <div className="min-w-[140px] flex-1 stat-card !p-4 !rounded-[1.5rem] border-l-primary/50 snap-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Total</p>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="min-w-[140px] flex-1 stat-card !p-4 !rounded-[1.5rem] border-l-green-500/50 snap-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Inside</p>
          <div className="text-2xl font-bold text-green-500">{stats.inCount}</div>
        </div>
        <div className="min-w-[140px] flex-1 stat-card !p-4 !rounded-[1.5rem] border-l-secondary/50 snap-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Out</p>
          <div className="text-2xl font-bold text-secondary">{stats.outCount}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 border-b border-white/5 pb-4">
           <div className="flex items-center gap-2">
             <History size={16} className="text-primary" />
             <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">Recent Logs</span>
           </div>
           <div className="relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
             <input 
              type="text" 
              className="bg-white/5 border-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-primary w-32"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        <div className="space-y-3">
          {loading ? (
             <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>
          ) : filteredLogs.map(log => (
            <div key={log.id} className="flex items-center gap-4 p-1">
              <img src={log.photo} className="w-11 h-11 rounded-xl object-cover grayscale-[0.5]" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight">{log.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {log.entryTime}
                  {log.exitTime && ` • Out ${log.exitTime}`}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                log.status === 'IN' ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-500'
              }`}>
                {log.status}
              </div>
            </div>
          ))}
          {!loading && filteredLogs.length === 0 && (
             <p className="text-center py-10 text-slate-600 text-xs font-medium">No logs recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
