import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import { getAllAttendance } from '../../services/attendanceService.js';

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default function AttendanceManagementPage() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAllAttendance = async () => {
      try {
        setError('');
        setIsLoading(true);
        const data = await getAllAttendance();
        setRecords(data);
      } catch (requestError) {
        const responseMessage =
          requestError?.response?.data?.message ||
          'Unable to load attendance management records.';
        setError(responseMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllAttendance();
  }, []);

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Attendance Management</h2>
          <p className="page-subtitle">
            Centralized view of employee attendance for admin and HR.
          </p>
        </div>
      </section>

      <Card className="departments-card">
        {error ? <p className="form-error">{error}</p> : null}

        {isLoading ? (
          <p className="muted-copy">Loading attendance records...</p>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No records available</p>
            <p className="empty-subtitle">Attendance data will appear here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td data-label="Employee" className="cell-strong">
                      {record.userId?.name || '-'}
                    </td>
                    <td data-label="Email">{record.userId?.email || '-'}</td>
                    <td data-label="Date">{formatDate(record.date)}</td>
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
