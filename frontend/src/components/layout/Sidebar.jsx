import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const PRIMARY_NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/employees', label: 'Employees' },
  { to: '/departments', label: 'Departments' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/payroll', label: 'Payroll' },
  { to: '/inventory', label: 'Inventory', disabled: true },
  { to: '/procurement', label: 'Procurement' },
  { to: '/performance', label: 'Performance' },
  { to: '/finance', label: 'Finance', disabled: true },
];

const SECONDARY_NAV_ITEMS = [
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/profile', label: 'Profile' },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('Admin');
  const canManagePayroll =
    isAdmin || user?.roles?.includes('HR Manager');
  const canManageInventory =
    isAdmin || user?.roles?.includes('Inventory Manager');
  const canAccessFinance =
    isAdmin ||
    user?.roles?.includes('Accountant') ||
    user?.roles?.includes('Finance Manager');
  const payrollRoute = canManagePayroll ? '/payroll' : '/payroll/me';
  const inventoryRoute = canManageInventory ? '/inventory' : '/inventory';
  const financeRoute = canAccessFinance ? '/finance' : '/finance';

  const getLinkClassName = ({ isActive }) =>
    `sidebar-link ${isActive ? 'active' : ''}`.trim();

  const primaryNavItems = PRIMARY_NAV_ITEMS.map((item) => {
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
    return item;
  });

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`.trim()}>
      <div className="sidebar-header">
        <div>
          <p className="sidebar-eyebrow">Enterprise Resource Planning</p>
          <h2 className="sidebar-brand">ERP Suite</h2>
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
        {SECONDARY_NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={getLinkClassName}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
