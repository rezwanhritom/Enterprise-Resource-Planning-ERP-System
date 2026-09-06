import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { FEATURE_CATALOG } from '../../constants/features.js';
import {
  getCompanySettings,
  updateCompanySettings,
} from '../../services/adminService.js';
import api from '../../services/api.js';

export default function CompanySettingsPage() {
  const [featureCatalog, setFeatureCatalog] = useState(FEATURE_CATALOG);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    description: '',
    enabledFeatures: FEATURE_CATALOG.map((item) => item.key),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [featuresResponse, company] = await Promise.all([
          api.get('/auth/features'),
          getCompanySettings(),
        ]);
        const catalog = featuresResponse?.data?.data;
        if (Array.isArray(catalog) && catalog.length > 0) {
          setFeatureCatalog(catalog);
        }
        setFormData({
          name: company?.name || '',
          industry: company?.industry || '',
          website: company?.website || '',
          description: company?.description || '',
          enabledFeatures: Array.isArray(company?.enabledFeatures)
            ? company.enabledFeatures
            : FEATURE_CATALOG.map((item) => item.key),
        });
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            'Unable to load company settings.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const toggleFeature = (key, required = false) => {
    if (required) return;
    setFormData((prev) => ({
      ...prev,
      enabledFeatures: prev.enabledFeatures.includes(key)
        ? prev.enabledFeatures.filter((item) => item !== key)
        : [...prev.enabledFeatures, key],
    }));
    setSuccess('');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      setError('Company name is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');
      const updated = await updateCompanySettings({
        name: formData.name.trim(),
        industry: formData.industry.trim(),
        website: formData.website.trim(),
        description: formData.description.trim(),
        enabledFeatures: formData.enabledFeatures,
      });
      setFormData((prev) => ({
        ...prev,
        name: updated?.name || prev.name,
        industry: updated?.industry || '',
        website: updated?.website || '',
        description: updated?.description || '',
        enabledFeatures: updated?.enabledFeatures || prev.enabledFeatures,
      }));
      setSuccess('Company settings saved.');
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Unable to save company settings.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Company Settings</h2>
          <p className="page-subtitle">
            Update your company profile and enabled ERP modules.
          </p>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}

      <Card title="Profile & Modules">
        {isLoading ? (
          <p className="muted-copy">Loading company settings...</p>
        ) : (
          <form className="performance-form" onSubmit={handleSave}>
            <div className="performance-form-grid">
              <Input
                label="Company name"
                id="name"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
              <Input
                label="Industry"
                id="industry"
                value={formData.industry}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    industry: event.target.value,
                  }))
                }
              />
              <Input
                label="Website"
                id="website"
                value={formData.website}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    website: event.target.value,
                  }))
                }
                placeholder="https://example.com"
              />
            </div>
            <div className="form-field">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                className="input textarea"
                rows={3}
                value={formData.description}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            <div className="form-field">
              <p className="form-label">Enabled features</p>
              <div className="role-chip-grid">
                {featureCatalog.map((feature) => {
                  const checked = formData.enabledFeatures.includes(feature.key);
                  return (
                    <label key={feature.key} className="role-chip">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={Boolean(feature.required)}
                        onChange={() =>
                          toggleFeature(feature.key, feature.required)
                        }
                      />
                      {feature.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-actions">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </DashboardLayout>
  );
}
