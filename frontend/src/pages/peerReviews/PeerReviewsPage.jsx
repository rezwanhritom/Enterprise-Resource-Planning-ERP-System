import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import {
  getMyPeerReviews,
  getPeerReviewTargets,
  submitPeerReview,
} from '../../services/peerReviewService.js';

const RATING_OPTIONS = [1, 2, 3, 4, 5];

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default function PeerReviewsPage() {
  const [targets, setTargets] = useState([]);
  const [summary, setSummary] = useState({
    average: 0,
    count: 0,
    reviews: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    rating: '4',
    feedback: '',
    teamwork: '4',
    communication: '4',
    reliability: '4',
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [targetRows, reviewSummary] = await Promise.all([
        getPeerReviewTargets(),
        getMyPeerReviews(),
      ]);
      setTargets(targetRows);
      setSummary(reviewSummary);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Unable to load peer reviews.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.subjectId) {
      setFormMessage('Please select a teammate to review.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormMessage('');
      setError('');
      await submitPeerReview({
        subjectId: formData.subjectId,
        rating: Number(formData.rating),
        feedback: formData.feedback.trim(),
        isAnonymous: true,
        categories: {
          teamwork: Number(formData.teamwork),
          communication: Number(formData.communication),
          reliability: Number(formData.reliability),
        },
      });
      setFormData((prev) => ({
        ...prev,
        subjectId: '',
        feedback: '',
        rating: '4',
      }));
      setFormMessage('Anonymous peer review saved.');
      await loadData();
    } catch (requestError) {
      setFormMessage(
        requestError?.response?.data?.message ||
          'Unable to submit peer review.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Peer Reviews</h2>
          <p className="page-subtitle">
            Share anonymous feedback and see how teammates rate your work.
          </p>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <Card
        title="Submit Anonymous Review"
        subtitle="Reviews are anonymous to the subject by default."
      >
        <form className="performance-form" onSubmit={handleSubmit}>
          <div className="performance-form-grid">
            <div className="form-field">
              <label htmlFor="subjectId" className="form-label">
                Teammate
              </label>
              <select
                id="subjectId"
                className="input"
                value={formData.subjectId}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    subjectId: event.target.value,
                  }))
                }
              >
                <option value="">Select teammate</option>
                {targets.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} ({employee.designation || employee.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="rating" className="form-label">
                Overall rating
              </label>
              <select
                id="rating"
                className="input"
                value={formData.rating}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    rating: event.target.value,
                  }))
                }
              >
                {RATING_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value} / 5
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="performance-form-grid">
            {['teamwork', 'communication', 'reliability'].map((key) => (
              <div className="form-field" key={key}>
                <label htmlFor={key} className="form-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <select
                  id={key}
                  className="input"
                  value={formData[key]}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      [key]: event.target.value,
                    }))
                  }
                >
                  {RATING_OPTIONS.map((value) => (
                    <option key={`${key}-${value}`} value={value}>
                      {value} / 5
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="feedback" className="form-label">
              Feedback
            </label>
            <textarea
              id="feedback"
              className="input textarea"
              rows={3}
              value={formData.feedback}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  feedback: event.target.value,
                }))
              }
              placeholder="Optional constructive comments"
            />
          </div>

          {formMessage ? (
            <p
              className={
                formMessage.includes('saved') ? 'form-success' : 'form-error'
              }
            >
              {formMessage}
            </p>
          ) : null}

          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="My Review Summary">
        {isLoading ? (
          <p className="muted-copy">Loading your reviews...</p>
        ) : (
          <>
            <p className="muted-copy">
              Average rating:{' '}
              <strong>
                {summary.average || 0}/5
              </strong>{' '}
              across {summary.count || 0} review
              {(summary.count || 0) === 1 ? '' : 's'}
            </p>
            {(summary.reviews || []).length === 0 ? (
              <div className="empty-state">
                <p className="empty-title">No reviews yet</p>
                <p className="empty-subtitle">
                  Anonymous peer feedback will appear here when teammates review
                  you.
                </p>
              </div>
            ) : (
              <div className="performance-history-list">
                {(summary.reviews || []).map((review) => (
                  <article key={review._id} className="performance-note-card">
                    <div className="performance-note-header">
                      <div className="performance-note-meta">
                        <p className="performance-note-title">Anonymous peer</p>
                        <p className="performance-note-subtitle">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <span className="performance-rating-chip">
                        {review.rating}/5
                      </span>
                    </div>
                    <p className="performance-note-body">
                      {review.feedback || 'No written feedback provided.'}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}
