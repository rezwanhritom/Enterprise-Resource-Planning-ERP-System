import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { getAllEmployees } from '../../services/employeeService.js';
import { addItem } from '../../services/inventoryService.js';

const INITIAL_FORM = {
  itemName: '',
  quantity: '',
  threshold: '',
  supplierId: '',
};

export default function AddItemPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [employees, setEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        const records = await getAllEmployees();
        setEmployees(records);
      } catch {
        setEmployees([]);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setStatusMessage('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.itemName.trim()) nextErrors.itemName = 'Item name is required.';
    ['quantity', 'threshold'].forEach((field) => {
      const raw = formData[field];
      if (raw === '') {
        nextErrors[field] = 'This field is required.';
        return;
      }
      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        nextErrors[field] = 'Value must be a non-negative number.';
      }
    });
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      await addItem({
        itemName: formData.itemName.trim(),
        quantity: Number(formData.quantity),
        threshold: Number(formData.threshold),
        supplierId: formData.supplierId || undefined,
      });
      setStatusMessage('Inventory item created successfully.');
      setFormData(INITIAL_FORM);
      setTimeout(() => navigate('/inventory', { replace: true }), 800);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Unable to add inventory item.';
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Add Inventory Item</h2>
          <p className="page-subtitle">
            Register new stock items with threshold controls and supplier context.
          </p>
        </div>
        <Link to="/inventory">
          <Button variant="secondary">Back to Inventory</Button>
        </Link>
      </section>

      <Card className="department-form-card">
        <form className="department-form inventory-form" onSubmit={handleSubmit}>
          <Input
            id="itemName"
            name="itemName"
            label="Item Name"
            placeholder="e.g. Thermal Printer"
            value={formData.itemName}
            onChange={handleChange}
          />
          {errors.itemName ? <p className="form-error">{errors.itemName}</p> : null}

          <div className="inventory-form-grid">
            <Input
              id="quantity"
              name="quantity"
              label="Quantity"
              type="number"
              min="0"
              step="1"
              value={formData.quantity}
              onChange={handleChange}
            />
            <Input
              id="threshold"
              name="threshold"
              label="Threshold"
              type="number"
              min="0"
              step="1"
              value={formData.threshold}
              onChange={handleChange}
            />
          </div>
          {errors.quantity ? <p className="form-error">{errors.quantity}</p> : null}
          {errors.threshold ? <p className="form-error">{errors.threshold}</p> : null}

          <div className="form-field">
            <label htmlFor="supplierId" className="form-label">
              Supplier (optional)
            </label>
            <select
              id="supplierId"
              name="supplierId"
              className="input"
              value={formData.supplierId}
              onChange={handleChange}
              disabled={isLoadingEmployees}
            >
              <option value="">No supplier</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} ({employee.email})
                </option>
              ))}
            </select>
          </div>

          {statusMessage ? (
            <p
              className={
                statusMessage.toLowerCase().includes('success')
                  ? 'form-success'
                  : 'form-error'
              }
            >
              {statusMessage}
            </p>
          ) : null}

          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
