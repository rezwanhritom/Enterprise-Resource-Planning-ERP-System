import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../ui/Button.jsx';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/departments': 'Departments',
  '/departments/create': 'Create Department',
  '/attendance': 'Attendance',
  '/attendance/manage': 'Manage Attendance',
  '/payroll': 'Payroll Dashboard',
  '/payroll/generate': 'Generate Payroll',
  '/payroll/me': 'My Payroll',
  '/inventory': 'Inventory',
  '/inventory/add': 'Add Inventory Item',
  '/procurement': 'Procurement Workflow',
  '/procurement/create': 'Create Procurement Request',
  '/performance': 'Performance Notes',
  '/suppliers': 'Suppliers',
  '/messages': 'Messages',
  '/audit': 'Audit Logs',
  '/finance': 'Finance Dashboard',
  '/finance/add': 'Add Finance Entry',
  '/profile': 'Profile',
  '/profile/edit': 'Edit Profile',
};

export default function Navbar({ onOpenSidebar = () => {} }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = useMemo(() => {
    if (PAGE_TITLES[location.pathname]) return PAGE_TITLES[location.pathname];
    if (location.pathname.startsWith('/attendance')) return 'Attendance';
    return 'Workspace';
  }, [location.pathname]);

  const pageEyebrow = useMemo(() => {
    if (location.pathname === '/dashboard') return 'Overview';
    return 'ERP Module';
  }, [location.pathname]);

  const initials = useMemo(() => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-main">
        <button
          type="button"
          className="navbar-mobile-trigger"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          Menu
        </button>
        <div>
          <p className="navbar-eyebrow">{pageEyebrow}</p>
          <h1 className="navbar-title">{pageTitle}</h1>
        </div>
      </div>
      <div className="navbar-actions">
        <button
          type="button"
          className="notification-placeholder"
          disabled
          aria-label="Notifications coming soon"
          title="Notifications coming soon"
        >
          Alerts
        </button>
        <div className="navbar-user">
          <span className="navbar-avatar">{initials}</span>
          <span className="navbar-user-name">{user?.name || 'User'}</span>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
