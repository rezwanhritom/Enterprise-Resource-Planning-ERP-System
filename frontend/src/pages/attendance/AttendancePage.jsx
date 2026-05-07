import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { getMyAttendance, markAttendance } from '../../services/attendanceService.js';
import { useAuth } from '../../context/AuthContext.jsx';

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const normalizeDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canManage = useMemo(
    () => user?.roles?.includes('Admin') || user?.roles?.includes('HR Manager'),
    [user?.roles]
  );

  const todayTimestamp = normalizeDay(new Date());
  const todayRecord = records.find((item) => normalizeDay(item.date) === todayTimestamp);

  const loadAttendance = async () => {
    try {
      setError('');
      setIsLoading(true);
      const data = await getMyAttendance();
      setRecords(data);
    } catch (requestError) {
      const responseMessage =
        requestError?.response?.data?.message ||
        'Unable to load attendance history.';
      setError(responseMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleMarkAttendance = async () => {
    try {
      setIsMarking(true);
      setError('');
      setMessage('');
      const createdRecord = await markAttendance();
      setRecords((prev) => [createdRecord, ...prev]);
      setMessage('Attendance marked for today.');
    } catch (requestError) {
      const responseMessage =
        requestError?.response?.data?.message || 'Unable to mark attendance.';
      setError(responseMessage);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Attendance</h2>
          <p className="page-subtitle">
            Track your daily attendance records and current day status.
          </p>
        </div>
        <div className="page-actions">
          {canManage ? (
            <Link to="/attendance/manage">
              <Button variant="secondary">Manage Records</Button>
            </Link>
          ) : null}
          <Button
            onClick={handleMarkAttendance}
            disabled={Boolean(todayRecord) || isMarking}
          >
            {isMarking
              ? 'Marking...'
              : todayRecord
                ? 'Attendance Marked'
                : 'Mark Attendance'}
          </Button>
        </div>
      </section>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <Card className="attendance-status-card">
        <p className="status-label">Today</p>
        <div className="status-row">
          <h3 className="status-heading">
            {todayRecord ? 'Attendance Submitted' : 'Pending Attendance'}
          </h3>
          <span
            className={`status-badge status-${todayRecord?.status || 'pending'}`}
          >
            {todayRecord?.status || 'pending'}
          </span>
        </div>
      </Card>

      <Card className="departments-card" title="Attendance History">
        {isLoading ? (
          <p className="muted-copy">Loading attendance history...</p>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No attendance records found</p>
            <p className="empty-subtitle">
              Mark your attendance to start building history.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td data-label="Date" className="cell-strong">
                      {formatDate(record.date)}
                    </td>
                    <td data-label="Status">
                      <span className={`status-badge status-${record.status}`}>
                        {record.status}
                      </span>
                    </td>
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
