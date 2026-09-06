import { Link } from 'react-router-dom';

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Modules', href: '#modules' },
      { label: 'Workflow', href: '#workflow' },
    ],
  },
  {
    title: 'Workspace',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Register', to: '/register' },
      { label: 'Register a company', to: '/register/company' },
      { label: 'Join a company', to: '/register/join' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#top' },
      { label: 'Support', href: 'mailto:support@erpsuite.local' },
    ],
  },
];

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-brand">
          <div className="landing-brand landing-brand-footer">
            <span className="landing-brand-mark" aria-hidden="true" />
            <span className="landing-brand-text">ERP Suite</span>
          </div>
          <p className="landing-footer-tagline">
            One workspace for people, inventory, finance, and day-to-day operations.
          </p>
        </div>

        <div className="landing-footer-columns">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="landing-footer-column">
              <h3 className="landing-footer-heading">{column.title}</h3>
              <ul className="landing-footer-list">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to}>{link.label}</Link>
                    ) : (
                      <a href={link.href}>{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-footer-bottom">
        <p>© {year} ERP Suite. Built for modern operations teams.</p>
      </div>
    </footer>
  );
}
