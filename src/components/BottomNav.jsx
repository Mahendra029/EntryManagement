import React from 'react';

const BottomNav = ({ activeView, setActiveView }) => {
  const tabs = [
    { id: 'pass', label: 'My Pass', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    )},
    { id: 'admin', label: 'History', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
    )},
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-bg via-bg to-transparent pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <nav className="glass-card flex justify-around p-2 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 flex flex-col items-center p-2 rounded-xl transition-all duration-300 relative group ${
                activeView === tab.id 
                  ? 'text-primary' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                activeView === tab.id ? 'bg-primary/10' : 'group-hover:bg-white/5'
              }`}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{tab.label}</span>
              
              {activeView === tab.id && (
                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default BottomNav;
