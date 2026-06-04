import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import JarvisOverlay from '../jarvis/JarvisOverlay';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-color)] relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 relative">
          <Outlet />
        </main>
        
        {/* Global Jarvis Voice Overlay */}
        <JarvisOverlay />
      </div>
    </div>
  );
};

export default AppLayout;
