import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { createSupplier, getSuppliers } from '../../services/supplierService.js';

export default function SuppliersPage() {
  const { user } = useAuth();
  const canCreateSupplier = useMemo(
    () =>
      user?.roles?.includes('Admin') || user?.roles?.includes('Procurement Manager'),
    [user?.roles]
  );

  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
  });

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Unable to load suppliers.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.contact.trim()) {
      setError('Supplier name and contact are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await createSupplier({
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        address: formData.address.trim(),
      });
      setFormData({ name: '', contact: '', address: '' });
      await loadSuppliers();
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Unable to create supplier.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Suppliers</h2>
          <p className="page-subtitle">
            Maintain approved vendor records for procurement and stock operations.
          </p>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      {canCreateSupplier ? (
        <Card className="filter-card">
          <form className="supplier-inline-form" onSubmit={handleCreate}>
            <Input
              id="name"
              name="name"
              label="Supplier Name"
              placeholder="e.g. Nova Office Supplies"
              value={formData.name}
              onChange={handleChange}
            />
            <Input
              id="contact"
              name="contact"
              label="Contact"
              placeholder="+880 1XXXXXXXXX"
              value={formData.contact}
              onChange={handleChange}
            />
            <Input
              id="address"
              name="address"
              label="Address"
              placeholder="Optional supplier location"
              value={formData.address}
              onChange={handleChange}
            />
            <div className="supplier-inline-form-action">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Supplier'}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="departments-card">
        {isLoading ? (
          <p className="muted-copy">Loading suppliers...</p>
        ) : suppliers.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No suppliers found</p>
            <p className="empty-subtitle">
              Supplier records will appear here once created.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td data-label="Name" className="cell-strong">
                      {supplier.name}
                    </td>
                    <td data-label="Contact">{supplier.contact}</td>
                    <td data-label="Address">{supplier.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
