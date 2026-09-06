import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
} from '../../services/announcementService.js';

const formatDateTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const canManage = useMemo(
    () => user?.roles?.includes('Admin') || user?.roles?.includes('HR Manager'),
    [user?.roles]
  );

  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    pinned: false,
  });

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      setError('');
      const rows = await listAnnouncements();
      setAnnouncements(rows);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Unable to load announcements.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) {
      setFormMessage('Title and body are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormMessage('');
      setError('');
      await createAnnouncement({
        title: formData.title.trim(),
        body: formData.body.trim(),
        pinned: formData.pinned,
      });
      setFormData({ title: '', body: '', pinned: false });
      setFormMessage('Announcement posted.');
      await loadAnnouncements();
    } catch (requestError) {
      setFormMessage(
        requestError?.response?.data?.message ||
          'Unable to create announcement.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setBusyId(id);
      setError('');
      await deleteAnnouncement(id);
      await loadAnnouncements();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Unable to delete announcement.'
      );
    } finally {
      setBusyId('');
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Announcements</h2>
          <p className="page-subtitle">
            Company-wide updates and pinned notices for your team.
          </p>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      {canManage ? (
        <Card
          title="Create Announcement"
          subtitle="Post a company-wide update for all employees."
        >
          <form className="performance-form" onSubmit={handleCreate}>
            <Input
              label="Title"
              id="title"
              value={formData.title}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Announcement title"
              required
            />
            <div className="form-field">
              <label htmlFor="body" className="form-label">
                Body
              </label>
              <textarea
                id="body"
                className="input textarea"
                rows={4}
                value={formData.body}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, body: event.target.value }))
                }
                placeholder="Write the announcement details"
                required
              />
            </div>
            <label className="role-chip">
              <input
                type="checkbox"
                checked={formData.pinned}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    pinned: event.target.checked,
                  }))
                }
              />
              Pin to top
            </label>
            {formMessage ? (
              <p
                className={
                  formMessage.includes('posted')
                    ? 'form-success'
                    : 'form-error'
                }
              >
                {formMessage}
              </p>
            ) : null}
            <div className="form-actions">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post Announcement'}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card title="Company Announcements">
        {isLoading ? (
          <p className="muted-copy">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No announcements yet</p>
            <p className="empty-subtitle">
              Company news and pinned updates will appear here.
            </p>
          </div>
        ) : (
          <div className="performance-history-list">
            {announcements.map((item) => (
              <article key={item._id} className="performance-note-card">
                <div className="performance-note-header">
                  <div className="performance-note-meta">
                    <p className="performance-note-title">
                      {item.pinned ? '[Pinned] ' : ''}
                      {item.title}
                    </p>
                    <p className="performance-note-subtitle">
                      By {item.createdBy?.name || 'Admin'} ·{' '}
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                  {canManage ? (
                    <Button
                      variant="secondary"
                      className="btn-small btn-danger-ghost"
                      disabled={busyId === item._id}
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </Button>
                  ) : null}
                </div>
                <p className="performance-note-body">{item.body}</p>
              </article>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
