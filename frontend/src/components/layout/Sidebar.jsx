import { NavLink } from 'react-router-dom';

const PRIMARY_NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/employees', label: 'Employees' },
  { to: '/departments', label: 'Departments' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/payroll', label: 'Payroll', disabled: true },
  { to: '/inventory', label: 'Inventory', disabled: true },
  { to: '/procurement', label: 'Procurement', disabled: true },
  { to: '/finance', label: 'Finance', disabled: true },
];

const SECONDARY_NAV_ITEMS = [{ to: '/profile', label: 'Profile' }];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const getLinkClassName = ({ isActive }) =>
    `sidebar-link ${isActive ? 'active' : ''}`.trim();

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
        {PRIMARY_NAV_ITEMS.map((item) =>
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
