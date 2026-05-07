import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { addExpense, addRevenue } from '../../services/financeService.js';

export default function AddFinanceEntryPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setStatusMessage('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!['expense', 'revenue'].includes(formData.type)) {
      nextErrors.type = 'Type must be expense or revenue.';
    }
    const amount = Number(formData.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      nextErrors.amount = 'Amount must be a non-negative number.';
    }
    if (!formData.category.trim()) {
      nextErrors.category = 'Category is required.';
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      const payload = {
        amount: Number(formData.amount),
        category: formData.category.trim(),
        description: formData.description.trim(),
      };
      if (formData.type === 'expense') {
        await addExpense(payload);
      } else {
        await addRevenue(payload);
      }
      setStatusMessage('Finance entry added successfully.');
      setTimeout(() => navigate('/finance', { replace: true }), 900);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Unable to add finance entry.';
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Add Finance Entry</h2>
          <p className="page-subtitle">
            Record operational revenue or expense transactions with clear categorization.
          </p>
        </div>
        <Link to="/finance">
          <Button variant="secondary">Back to Finance</Button>
        </Link>
      </section>

      <Card className="department-form-card">
        <form className="department-form finance-entry-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="type" className="form-label">
              Entry Type
            </label>
            <select
              id="type"
              name="type"
              className="input"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="expense">Expense</option>
              <option value="revenue">Revenue</option>
            </select>
            {errors.type ? <p className="form-error">{errors.type}</p> : null}
          </div>

          <Input
            id="amount"
            name="amount"
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="1200"
            value={formData.amount}
            onChange={handleChange}
          />
          {errors.amount ? <p className="form-error">{errors.amount}</p> : null}

          <Input
            id="category"
            name="category"
            label="Category"
            placeholder="e.g. Office supplies"
            value={formData.category}
            onChange={handleChange}
          />
          {errors.category ? <p className="form-error">{errors.category}</p> : null}

          <div className="form-field">
            <label htmlFor="description" className="form-label">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              className="input textarea"
              placeholder="Additional context..."
              value={formData.description}
              onChange={handleChange}
            />
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
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
