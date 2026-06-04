import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import JarvisOverlay from '../jarvis/JarvisOverlay';

const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-color)]">
      <Sidebar />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden p-6 relative">
          <Outlet />
        </main>
        
        {/* Global Jarvis Voice Overlay */}
        <JarvisOverlay />
      </div>
    </div>
  );
};

export default AppLayout;
