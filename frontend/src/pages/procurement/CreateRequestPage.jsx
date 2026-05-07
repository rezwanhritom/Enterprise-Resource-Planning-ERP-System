import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { getDepartments } from '../../services/departmentService.js';
import { createRequest } from '../../services/procurementService.js';

const EMPTY_ITEM = { itemName: '', quantity: '' };

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState('');
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [errors, setErrors] = useState({});
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const data = await getDepartments();
        setDepartments(data);
      } catch {
        setDepartments([]);
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
    setStatusMessage('');
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const removeItemRow = (index) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const validate = () => {
    const nextErrors = {};
    if (!department) nextErrors.department = 'Department is required.';
    if (items.length === 0) nextErrors.items = 'Add at least one item.';

    items.forEach((item, index) => {
      if (!item.itemName.trim()) {
        nextErrors[`itemName-${index}`] = 'Item name is required.';
      }
      const quantity = Number(item.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        nextErrors[`quantity-${index}`] = 'Quantity must be greater than zero.';
      }
    });

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      setStatusMessage('');
      await createRequest({
        department,
        items: items.map((item) => ({
          itemName: item.itemName.trim(),
          quantity: Number(item.quantity),
        })),
      });
      setStatusMessage('Procurement request submitted successfully.');
      setTimeout(() => navigate('/procurement', { replace: true }), 900);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        'Unable to submit procurement request.';
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Create Procurement Request</h2>
          <p className="page-subtitle">
            Submit item requirements for department-level procurement workflow.
          </p>
        </div>
        <Link to="/procurement">
          <Button variant="secondary">Back to Requests</Button>
        </Link>
      </section>

      <Card className="department-form-card">
        <form className="department-form procurement-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="department" className="form-label">
              Department
            </label>
            <select
              id="department"
              name="department"
              className="input"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              disabled={isLoadingDepartments}
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department ? <p className="form-error">{errors.department}</p> : null}
          </div>

          <div className="procurement-items-header">
            <h3 className="status-heading">Requested Items</h3>
            <Button variant="secondary" className="btn-small" onClick={addItemRow}>
              Add Item
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={`item-row-${index}`} className="procurement-item-row">
              <Input
                id={`itemName-${index}`}
                label="Item Name"
                placeholder="e.g. Laser printer cartridge"
                value={item.itemName}
                onChange={(event) => updateItem(index, 'itemName', event.target.value)}
              />
              <Input
                id={`quantity-${index}`}
                label="Quantity"
                type="number"
                min="1"
                step="1"
                value={item.quantity}
                onChange={(event) => updateItem(index, 'quantity', event.target.value)}
              />
              <div className="procurement-item-remove">
                <Button
                  variant="secondary"
                  className="btn-small btn-danger-ghost"
                  disabled={items.length === 1}
                  onClick={() => removeItemRow(index)}
                >
                  Remove
                </Button>
              </div>
              {errors[`itemName-${index}`] ? (
                <p className="form-error">{errors[`itemName-${index}`]}</p>
              ) : null}
              {errors[`quantity-${index}`] ? (
                <p className="form-error">{errors[`quantity-${index}`]}</p>
              ) : null}
            </div>
          ))}

          {errors.items ? <p className="form-error">{errors.items}</p> : null}

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
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
