import React from 'react';
import { Shield, Bell } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
          <Shield size={20} />
        </div>
        <h1 className="text-xl font-bold text-white mb-0 !bg-none !-webkit-text-fill-color-inherit">
          EntryLog
        </h1>
      </div>

      <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
        <Bell size={22} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-bg" />
      </button>
    </header>
  );
};

export default Header;
