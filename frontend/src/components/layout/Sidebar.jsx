export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">ERP Suite</div>
      <nav className="sidebar-nav">
        <button type="button" className="sidebar-link active">
          Dashboard
        </button>
        <button type="button" className="sidebar-link" disabled>
          Modules (soon)
        </button>
        <button type="button" className="sidebar-link" disabled>
          Reports (soon)
        </button>
      </nav>
    </aside>
  );
}
