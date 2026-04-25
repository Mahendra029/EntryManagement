import React, { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import EntryFlow from './components/EntryFlow';
import ExitFlow from './components/ExitFlow';
import AdminDashboard from './components/AdminDashboard';
import Scanner from './components/Scanner';
import QRGenerator from './components/QRGenerator';

function App() {
  const [activeView, setActiveView] = useState('pass');

  const renderView = () => {
    switch (activeView) {
      case 'pass':
        return <QRGenerator />;
      case 'entry':
        return <EntryFlow />;
      case 'scan':
        return <Scanner />;
      case 'exit':
        return <ExitFlow />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <QRGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div className="w-full max-w-md bg-bg min-h-screen shadow-2xl relative flex flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto px-5 pt-6 pb-32">
          {renderView()}
        </main>

        <BottomNav activeView={activeView} setActiveView={setActiveView} />
      </div>
    </div>
  );
}

export default App;
