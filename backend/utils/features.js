export const FEATURE_KEYS = Object.freeze({
  DASHBOARD: 'dashboard',
  EMPLOYEES: 'employees',
  DEPARTMENTS: 'departments',
  ATTENDANCE: 'attendance',
  LEAVE: 'leave',
  PAYROLL: 'payroll',
  INVENTORY: 'inventory',
  SUPPLIERS: 'suppliers',
  PROCUREMENT: 'procurement',
  FINANCE: 'finance',
  PERFORMANCE: 'performance',
  PEER_REVIEWS: 'peer_reviews',
  ANNOUNCEMENTS: 'announcements',
  MESSAGES: 'messages',
  AUDIT: 'audit',
  COMPANY_SETTINGS: 'company_settings',
});

export const FEATURE_CATALOG = Object.freeze([
  {
    key: FEATURE_KEYS.DASHBOARD,
    label: 'Dashboard',
    description: 'Overview KPIs and charts for your organization.',
    required: true,
  },
  {
    key: FEATURE_KEYS.EMPLOYEES,
    label: 'Employees',
    description: 'Manage employee profiles and directory.',
  },
  {
    key: FEATURE_KEYS.DEPARTMENTS,
    label: 'Departments',
    description: 'Organize teams into departments.',
  },
  {
    key: FEATURE_KEYS.ATTENDANCE,
    label: 'Attendance',
    description: 'Daily check-in and attendance management.',
  },
  {
    key: FEATURE_KEYS.LEAVE,
    label: 'Leave Requests',
    description: 'Employees request leave; managers approve or reject.',
  },
  {
    key: FEATURE_KEYS.PAYROLL,
    label: 'Payroll',
    description: 'Generate and view payroll / income slips.',
  },
  {
    key: FEATURE_KEYS.INVENTORY,
    label: 'Inventory',
    description: 'Track stock levels and inventory items.',
  },
  {
    key: FEATURE_KEYS.SUPPLIERS,
    label: 'Suppliers',
    description: 'Maintain supplier contacts and details.',
  },
  {
    key: FEATURE_KEYS.PROCUREMENT,
    label: 'Procurement',
    description: 'Create and approve purchase requests.',
  },
  {
    key: FEATURE_KEYS.FINANCE,
    label: 'Finance',
    description: 'Record revenue, expenses, and finance summaries.',
  },
  {
    key: FEATURE_KEYS.PERFORMANCE,
    label: 'Performance',
    description: 'Manager performance notes and ratings.',
  },
  {
    key: FEATURE_KEYS.PEER_REVIEWS,
    label: 'Peer Reviews',
    description: 'Anonymous peer ratings for teammates.',
  },
  {
    key: FEATURE_KEYS.ANNOUNCEMENTS,
    label: 'Announcements',
    description: 'Company-wide news and pinned updates.',
  },
  {
    key: FEATURE_KEYS.MESSAGES,
    label: 'Messages',
    description: 'Realtime internal messaging between teammates.',
  },
  {
    key: FEATURE_KEYS.AUDIT,
    label: 'Audit Logs',
    description: 'Review system activity for accountability.',
  },
  {
    key: FEATURE_KEYS.COMPANY_SETTINGS,
    label: 'Company Settings',
    description: 'Admin controls for modules, users, and company profile.',
  },
]);

export const ALLOWED_FEATURES = Object.freeze(
  FEATURE_CATALOG.map((feature) => feature.key)
);

export const REQUIRED_FEATURES = Object.freeze(
  FEATURE_CATALOG.filter((feature) => feature.required).map((feature) => feature.key)
);

export const normalizeEnabledFeatures = (features = []) => {
  const selected = Array.isArray(features) ? features.map(String) : [];
  const unique = [...new Set([...REQUIRED_FEATURES, ...selected])];
  return unique.filter((key) => ALLOWED_FEATURES.includes(key));
};
