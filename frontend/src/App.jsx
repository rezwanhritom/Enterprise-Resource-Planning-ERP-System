import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import DepartmentsPage from './pages/departments/DepartmentsPage.jsx';
import CreateDepartmentPage from './pages/departments/CreateDepartmentPage.jsx';
import ProfilePage from './pages/employees/ProfilePage.jsx';
import EditProfilePage from './pages/employees/EditProfilePage.jsx';
import EmployeesPage from './pages/employees/EmployeesPage.jsx';
import AttendancePage from './pages/attendance/AttendancePage.jsx';
import AttendanceManagementPage from './pages/attendance/AttendanceManagementPage.jsx';
import PayrollDashboardPage from './pages/payroll/PayrollDashboardPage.jsx';
import GeneratePayrollPage from './pages/payroll/GeneratePayrollPage.jsx';
import MyPayrollPage from './pages/payroll/MyPayrollPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments/create"
          element={
            <ProtectedRoute>
              <CreateDepartmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <RoleProtectedRoute allowedRoles={['Admin', 'HR Manager']}>
              <EmployeesPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/manage"
          element={
            <RoleProtectedRoute allowedRoles={['Admin', 'HR Manager']}>
              <AttendanceManagementPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <RoleProtectedRoute allowedRoles={['Admin', 'HR Manager']}>
              <PayrollDashboardPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/payroll/generate"
          element={
            <RoleProtectedRoute allowedRoles={['Admin', 'HR Manager']}>
              <GeneratePayrollPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/payroll/me"
          element={
            <ProtectedRoute>
              <MyPayrollPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
