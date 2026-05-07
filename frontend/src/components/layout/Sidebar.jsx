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
  { to: '/finance', label: 'Finance', disabled: true },
];

const SECONDARY_NAV_ITEMS = [
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/profile', label: 'Profile' },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user } = useAuth();
  const canManagePayroll =
    user?.roles?.includes('Admin') || user?.roles?.includes('HR Manager');
  const canManageInventory =
    user?.roles?.includes('Admin') || user?.roles?.includes('Inventory Manager');
  const canAccessFinance =
    user?.roles?.includes('Admin') ||
    user?.roles?.includes('Accountant') ||
    user?.roles?.includes('Finance Manager');
  const payrollRoute = canManagePayroll ? '/payroll' : '/payroll/me';
  const inventoryRoute = canManageInventory ? '/inventory' : '/inventory';
  const financeRoute = canAccessFinance ? '/finance' : '/finance';

  const getLinkClassName = ({ isActive }) =>
    `sidebar-link ${isActive ? 'active' : ''}`.trim();

  const primaryNavItems = PRIMARY_NAV_ITEMS.map((item) =>
    item.label === 'Payroll'
      ? { ...item, to: payrollRoute }
      : item.label === 'Inventory'
        ? { ...item, to: inventoryRoute, disabled: false }
        : item.label === 'Finance'
          ? { ...item, to: financeRoute, disabled: !canAccessFinance }
        : item
  );

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
