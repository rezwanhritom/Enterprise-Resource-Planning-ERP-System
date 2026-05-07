import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="dashboard-shell">
      <button
        type="button"
        className={`sidebar-backdrop ${isSidebarOpen ? 'visible' : ''}`.trim()}
        aria-label="Close sidebar"
        onClick={() => setIsSidebarOpen(false)}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="dashboard-main">
        <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
