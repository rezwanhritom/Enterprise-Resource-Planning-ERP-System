import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { createDepartment } from '../../services/departmentService.js';

export default function CreateDepartmentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormMessage('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = 'Department name is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setFormMessage('');
      await createDepartment({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      navigate('/departments', { replace: true });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        'Unable to create department. Please try again.';
      setFormMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Create Department</h2>
          <p className="page-subtitle">
            Add a new department to your organization structure.
          </p>
        </div>
      </section>

      <Card className="department-form-card">
        <form className="department-form" onSubmit={handleSubmit}>
          <Input
            id="name"
            name="name"
            label="Department Name"
            placeholder="e.g. Human Resources"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name ? <p className="form-error">{errors.name}</p> : null}

          <div className="form-field">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="input textarea"
              placeholder="Add a short department description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {formMessage ? <p className="form-error">{formMessage}</p> : null}

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/departments')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
