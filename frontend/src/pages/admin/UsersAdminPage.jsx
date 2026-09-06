import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import {
  createUser,
  getAllUsers,
  updateCompanyUser,
} from '../../services/adminService.js';

const ROLE_OPTIONS = [
  'Employee',
  'HR Manager',
  'Accountant',
  'Inventory Manager',
  'Finance Manager',
  'Procurement Manager',
  'Supervisor',
  'Admin',
];

const EMPTY_CREATE = {
  name: '',
  email: '',
  password: '',
  designation: '',
  baseSalary: '',
  roles: ['Employee'],
};

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const rows = await getAllUsers();
      setUsers(rows);
      setDrafts(
        Object.fromEntries(
          rows.map((user) => [
            user._id,
            {
              roles: user.roles || ['Employee'],
              designation: user.designation || '',
              baseSalary: user.baseSalary ?? 0,
              isActive: Boolean(user.isActive),
            },
          ])
        )
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Unable to load users.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updateDraft = (userId, patch) => {
    setDrafts((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], ...patch },
    }));
    setSuccess('');
  };

  const toggleRole = (userId, role) => {
    const current = drafts[userId]?.roles || [];
    const next = current.includes(role)
      ? current.filter((item) => item !== role)
      : [...current, role];
    updateDraft(userId, { roles: next.length > 0 ? next : ['Employee'] });
  };

  const toggleCreateRole = (role) => {
    setCreateForm((prev) => {
      const next = prev.roles.includes(role)
        ? prev.roles.filter((item) => item !== role)
        : [...prev.roles, role];
      return { ...prev, roles: next.length > 0 ? next : ['Employee'] };
    });
  };

  const handleSaveUser = async (userId) => {
    const draft = drafts[userId];
    if (!draft) return;

    try {
      setBusyId(userId);
      setError('');
      setSuccess('');
      await updateCompanyUser(userId, {
        roles: draft.roles,
        designation: draft.designation,
        baseSalary: Number(draft.baseSalary) || 0,
        isActive: draft.isActive,
      });
      setSuccess('User updated.');
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Unable to update user.'
      );
    } finally {
      setBusyId('');
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password) {
      setError('Name, email, and password are required.');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      setSuccess('');
      const created = await createUser({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        roles: createForm.roles,
        isActive: true,
      });

      if (
        created?._id &&
        (createForm.designation.trim() || createForm.baseSalary !== '')
      ) {
        await updateCompanyUser(created._id, {
          designation: createForm.designation.trim(),
          baseSalary: Number(createForm.baseSalary) || 0,
        });
      }
      setCreateForm(EMPTY_CREATE);
      setSuccess('User created.');
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Unable to create user.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Manage Users</h2>
          <p className="page-subtitle">
            Create accounts and adjust roles, designation, salary, and status.
          </p>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}

      <Card title="Create User" subtitle="Add a new active user to your company.">
        <form className="performance-form" onSubmit={handleCreate}>
          <div className="performance-form-grid">
            <Input
              label="Name"
              id="create-name"
              value={createForm.name}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
            <Input
              label="Email"
              id="create-email"
              type="email"
              value={createForm.email}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
            <Input
              label="Password"
              id="create-password"
              type="password"
              value={createForm.password}
              onChange={(event) =>
                setCreateForm((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
              required
            />
            <Input
              label="Designation"
              id="create-designation"
              value={createForm.designation}
              onChange={(event) =>
                setCreateForm((prev) => ({
                  ...prev,
                  designation: event.target.value,
                }))
              }
            />
            <Input
              label="Base salary"
              id="create-salary"
              type="number"
              min="0"
              value={createForm.baseSalary}
              onChange={(event) =>
                setCreateForm((prev) => ({
                  ...prev,
                  baseSalary: event.target.value,
                }))
              }
            />
          </div>
          <div className="form-field">
            <p className="form-label">Roles</p>
            <div className="role-chip-grid">
              {ROLE_OPTIONS.map((role) => (
                <label key={role} className="role-chip">
                  <input
                    type="checkbox"
                    checked={createForm.roles.includes(role)}
                    onChange={() => toggleCreateRole(role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Company Users">
        {isLoading ? (
          <p className="muted-copy">Loading users...</p>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No users found</p>
            <p className="empty-subtitle">Create a user to get started.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Designation</th>
                  <th>Base salary</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const draft = drafts[user._id] || {
                    roles: ['Employee'],
                    designation: '',
                    baseSalary: 0,
                    isActive: true,
                  };
                  return (
                    <tr key={user._id}>
                      <td data-label="Name" className="cell-strong">
                        {user.name}
                      </td>
                      <td data-label="Email">{user.email}</td>
                      <td data-label="Roles">
                        <div className="role-chip-grid">
                          {ROLE_OPTIONS.map((role) => (
                            <label key={`${user._id}-${role}`} className="role-chip">
                              <input
                                type="checkbox"
                                checked={draft.roles.includes(role)}
                                onChange={() => toggleRole(user._id, role)}
                              />
                              {role}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td data-label="Designation">
                        <input
                          className="input"
                          value={draft.designation}
                          onChange={(event) =>
                            updateDraft(user._id, {
                              designation: event.target.value,
                            })
                          }
                        />
                      </td>
                      <td data-label="Base salary">
                        <input
                          className="input"
                          type="number"
                          min="0"
                          value={draft.baseSalary}
                          onChange={(event) =>
                            updateDraft(user._id, {
                              baseSalary: event.target.value,
                            })
                          }
                        />
                      </td>
                      <td data-label="Active">
                        <label className="role-chip">
                          <input
                            type="checkbox"
                            checked={draft.isActive}
                            onChange={(event) =>
                              updateDraft(user._id, {
                                isActive: event.target.checked,
                              })
                            }
                          />
                          Active
                        </label>
                      </td>
                      <td data-label="Actions">
                        <Button
                          className="btn-small"
                          disabled={busyId === user._id}
                          onClick={() => handleSaveUser(user._id)}
                        >
                          {busyId === user._id ? 'Saving...' : 'Save'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
