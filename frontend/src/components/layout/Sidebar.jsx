import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const PRIMARY_NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', feature: 'dashboard' },
  { to: '/employees', label: 'Employees', feature: 'employees' },
  { to: '/departments', label: 'Departments', feature: 'departments' },
  { to: '/attendance', label: 'Attendance', feature: 'attendance' },
  { to: '/leave', label: 'Leave', feature: 'leave' },
  { to: '/payroll', label: 'Payroll', feature: 'payroll' },
  { to: '/inventory', label: 'Inventory', feature: 'inventory' },
  { to: '/procurement', label: 'Procurement', feature: 'procurement' },
  { to: '/performance', label: 'Performance', feature: 'performance' },
  { to: '/peer-reviews', label: 'Peer Reviews', feature: 'peer_reviews' },
  { to: '/announcements', label: 'Announcements', feature: 'announcements' },
  { to: '/messages', label: 'Messages', feature: 'messages' },
  { to: '/audit', label: 'Audit Logs', feature: 'audit' },
  { to: '/finance', label: 'Finance', feature: 'finance' },
];

const SECONDARY_NAV_ITEMS = [
  { to: '/suppliers', label: 'Suppliers', feature: 'suppliers' },
  { to: '/profile', label: 'Profile' },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('Admin');
  const enabledFeatures = user?.company?.enabledFeatures;
  const canManagePayroll =
    isAdmin || user?.roles?.includes('HR Manager');
  const canManageInventory =
    isAdmin || user?.roles?.includes('Inventory Manager');
  const canAccessFinance =
    isAdmin ||
    user?.roles?.includes('Accountant') ||
    user?.roles?.includes('Finance Manager');
  const payrollRoute = canManagePayroll ? '/payroll' : '/payroll/me';
  const inventoryRoute = '/inventory';
  const financeRoute = '/finance';

  const hasFeature = (featureKey) => {
    if (!featureKey) return true;
    if (!Array.isArray(enabledFeatures) || enabledFeatures.length === 0) {
      return true;
    }
    return enabledFeatures.includes(featureKey);
  };

  const getLinkClassName = ({ isActive }) =>
    `sidebar-link ${isActive ? 'active' : ''}`.trim();

  const primaryNavItems = PRIMARY_NAV_ITEMS.map((item) => {
    if (!hasFeature(item.feature)) return null;

    if (item.label === 'Payroll') return { ...item, to: payrollRoute };
    if (item.label === 'Departments') return { ...item, disabled: !isAdmin };
    if (item.label === 'Employees') {
      return {
        ...item,
        disabled: !(isAdmin || user?.roles?.includes('HR Manager')),
      };
    }
    if (item.label === 'Inventory') {
      return { ...item, to: inventoryRoute, disabled: false };
    }
    if (item.label === 'Finance') {
      return { ...item, to: financeRoute, disabled: !canAccessFinance };
    }
    if (item.label === 'Audit Logs') {
      return isAdmin ? item : null;
    }
    return item;
  }).filter(Boolean);

  const secondaryNavItems = SECONDARY_NAV_ITEMS.filter((item) =>
    hasFeature(item.feature)
  );

  const showCompanySettings = isAdmin;
  const showManageUsers = isAdmin;

  const companyName = user?.company?.name || 'ERP Suite';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`.trim()}>
      <div className="sidebar-header">
        <div>
          <p className="sidebar-eyebrow">Enterprise Resource Planning</p>
          <h2 className="sidebar-brand">{companyName}</h2>
        </div>
        <button
          type="button"
          className="sidebar-mobile-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          Close
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {primaryNavItems.map((item) =>
          item.disabled ? (
            <span key={item.to} className="sidebar-link sidebar-link-disabled">
              {item.label}
              <span className="sidebar-chip">Soon</span>
            </span>
          ) : (
            <NavLink key={item.to} to={item.to} className={getLinkClassName}>
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <nav className="sidebar-nav sidebar-nav-secondary" aria-label="Secondary">
        {isAdmin ? (
          <NavLink to="/join-requests" className={getLinkClassName}>
            Join requests
          </NavLink>
        ) : null}
        {showCompanySettings ? (
          <NavLink to="/company-settings" className={getLinkClassName}>
            Company Settings
          </NavLink>
        ) : null}
        {showManageUsers ? (
          <NavLink to="/admin/users" className={getLinkClassName}>
            Manage Users
          </NavLink>
        ) : null}
        {secondaryNavItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={getLinkClassName}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
