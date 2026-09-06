import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#modules', label: 'Modules' },
  { href: '#workflow', label: 'How it works' },
];

export default function LandingHeader() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handlePrimary = () => {
    navigate(isAuthenticated ? '/dashboard' : '/register');
  };

  return (
    <header className={`landing-header ${scrolled ? 'is-scrolled' : ''}`.trim()}>
      <div className="landing-header-inner">
        <a href="#top" className="landing-brand" onClick={() => setMenuOpen(false)}>
          <span className="landing-brand-mark" aria-hidden="true" />
          <span className="landing-brand-text">ERP Suite</span>
        </a>

        <nav className="landing-nav" aria-label="Landing">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="landing-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="landing-header-actions">
          {!isAuthenticated ? (
            <Link to="/login" className="landing-link-quiet">
              Sign in
            </Link>
          ) : null}
          <button type="button" className="landing-btn landing-btn-solid" onClick={handlePrimary}>
            {isAuthenticated ? 'Open workspace' : 'Register'}
          </button>
          <button
            type="button"
            className="landing-menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`landing-mobile-panel ${menuOpen ? 'is-open' : ''}`.trim()}>
        <nav className="landing-mobile-nav" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="landing-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link to="/login" className="landing-mobile-link" onClick={() => setMenuOpen(false)}>
            Sign in
          </Link>
          <Link to="/register" className="landing-mobile-link" onClick={() => setMenuOpen(false)}>
            Register
          </Link>
          <button
            type="button"
            className="landing-btn landing-btn-solid landing-btn-block"
            onClick={() => {
              setMenuOpen(false);
              handlePrimary();
            }}
          >
            {isAuthenticated ? 'Open workspace' : 'Register'}
          </button>
        </nav>
      </div>
    </header>
  );
}
