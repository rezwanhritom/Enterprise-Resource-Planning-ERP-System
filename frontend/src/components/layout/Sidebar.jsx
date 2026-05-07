import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const getLinkClassName = ({ isActive }) =>
    `sidebar-link ${isActive ? 'active' : ''}`.trim();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">ERP Suite</div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={getLinkClassName}>
          Dashboard
        </NavLink>
        <NavLink to="/profile" className={getLinkClassName}>
          Profile
        </NavLink>
        <NavLink to="/attendance" className={getLinkClassName}>
          Attendance
        </NavLink>
        <NavLink to="/employees" className={getLinkClassName}>
          Employees
        </NavLink>
        <NavLink to="/departments" className={getLinkClassName}>
          Departments
        </NavLink>
      </nav>
    </aside>
  );
}
