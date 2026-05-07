export const ROLES = Object.freeze({
  ADMIN: 'Admin',
  HR_MANAGER: 'HR Manager',
  ACCOUNTANT: 'Accountant',
  INVENTORY_MANAGER: 'Inventory Manager',
  EMPLOYEE: 'Employee',
  FINANCE_MANAGER: 'Finance Manager',
  PROCUREMENT_MANAGER: 'Procurement Manager',
  SUPERVISOR: 'Supervisor',
});

export const ALLOWED_ROLES = Object.freeze(Object.values(ROLES));
