import { Navigate, Link } from 'react-router-dom';
import LandingHeader from '../../components/landing/LandingHeader.jsx';
import LandingFooter from '../../components/landing/LandingFooter.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const FEATURES = [
  {
    title: 'People & HR',
    copy: 'Manage employees, departments, attendance, and payroll from one shared record of work.',
  },
  {
    title: 'Inventory & supply',
    copy: 'Track stock levels, suppliers, and procurement requests without jumping between spreadsheets.',
  },
  {
    title: 'Finance clarity',
    copy: 'Log revenue and expenses, watch cash movement, and keep finance teams aligned with operations.',
  },
  {
    title: 'Accountability',
    copy: 'Performance notes, messaging, and audit logs keep decisions visible across roles.',
  },
];

const MODULES = [
  {
    name: 'Dashboard',
    detail: 'Live KPIs for attendance, inventory health, and spending.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    alt: 'Analytics dashboard on a laptop',
  },
  {
    name: 'Workforce',
    detail: 'Employees, departments, attendance, and payroll in one flow.',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    alt: 'Team collaborating around a table',
  },
  {
    name: 'Operations',
    detail: 'Inventory, suppliers, procurement, and finance in sync.',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Warehouse shelves with inventory',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Sign in with your work account',
    copy: 'Role-based access opens only the modules your team needs.',
  },
  {
    step: '02',
    title: 'Run daily operations',
    copy: 'Mark attendance, raise purchase requests, update stock, or review payroll.',
  },
  {
    step: '03',
    title: 'Stay aligned across teams',
    copy: 'Messages, performance notes, and audit history keep everyone accountable.',
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page" id="top">
      <LandingHeader />

      <main>
        <section className="landing-hero" aria-labelledby="landing-hero-heading">
          <div className="landing-hero-media" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=80"
              alt=""
            />
            <div className="landing-hero-veil" />
          </div>

          <div className="landing-hero-content">
            <p className="landing-hero-brand">ERP Suite</p>
            <h1 id="landing-hero-heading" className="landing-hero-title">
              Operations that stay in one place.
            </h1>
            <p className="landing-hero-copy">
              Connect HR, inventory, procurement, and finance so your team can move faster with
              fewer handoffs.
            </p>
            <div className="landing-hero-actions">
              <Link to="/register" className="landing-btn landing-btn-solid">
                Create an account
              </Link>
              <Link to="/login" className="landing-btn landing-btn-ghost">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="landing-section" id="features" aria-labelledby="features-heading">
          <div className="landing-section-intro">
            <h2 id="features-heading" className="landing-section-title">
              Built for the work your company already does.
            </h2>
            <p className="landing-section-copy">
              ERP Suite brings core business modules into a single interface—clear enough for daily
              use, structured enough for managers and admins.
            </p>
          </div>

          <ul className="landing-feature-list">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="landing-feature-item">
                <h3 className="landing-feature-title">{feature.title}</h3>
                <p className="landing-feature-copy">{feature.copy}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="landing-section landing-section-muted" id="modules" aria-labelledby="modules-heading">
          <div className="landing-section-intro">
            <h2 id="modules-heading" className="landing-section-title">
              Modules that cover the full loop.
            </h2>
            <p className="landing-section-copy">
              From the people who run the business to the stock that keeps it moving—everything
              shares the same workspace.
            </p>
          </div>

          <div className="landing-module-grid">
            {MODULES.map((module) => (
              <article key={module.name} className="landing-module">
                <div className="landing-module-media">
                  <img src={module.image} alt={module.alt} loading="lazy" />
                </div>
                <div className="landing-module-body">
                  <h3 className="landing-module-title">{module.name}</h3>
                  <p className="landing-module-copy">{module.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section" id="workflow" aria-labelledby="workflow-heading">
          <div className="landing-section-intro landing-section-intro-narrow">
            <h2 id="workflow-heading" className="landing-section-title">
              A simple path from login to daily work.
            </h2>
            <p className="landing-section-copy">
              No steep learning curve—open the modules you need and keep the rest out of the way.
            </p>
          </div>

          <ol className="landing-steps">
            {STEPS.map((item) => (
              <li key={item.step} className="landing-step">
                <span className="landing-step-index">{item.step}</span>
                <div>
                  <h3 className="landing-step-title">{item.title}</h3>
                  <p className="landing-step-copy">{item.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="landing-cta" aria-labelledby="cta-heading">
          <div className="landing-cta-inner">
            <h2 id="cta-heading" className="landing-cta-title">
              Ready to run operations from one workspace?
            </h2>
            <p className="landing-cta-copy">
              Sign in with your organization account and pick up where your team left off.
            </p>
            <Link to="/register" className="landing-btn landing-btn-solid">
              Register now
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
