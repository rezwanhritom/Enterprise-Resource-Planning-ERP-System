import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute.jsx';
import LandingPage from './pages/landing/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterChoicePage from './pages/auth/RegisterChoicePage.jsx';
import RegisterCompanyPage from './pages/auth/RegisterCompanyPage.jsx';
import RegisterJoinPage from './pages/auth/RegisterJoinPage.jsx';
import JoinRequestsPage from './pages/admin/JoinRequestsPage.jsx';
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
import InventoryPage from './pages/inventory/InventoryPage.jsx';
import AddItemPage from './pages/inventory/AddItemPage.jsx';
import ProcurementPage from './pages/procurement/ProcurementPage.jsx';
import CreateRequestPage from './pages/procurement/CreateRequestPage.jsx';
import SuppliersPage from './pages/suppliers/SuppliersPage.jsx';
import FinanceDashboardPage from './pages/finance/FinanceDashboardPage.jsx';
import AddFinanceEntryPage from './pages/finance/AddFinanceEntryPage.jsx';
import PerformancePage from './pages/performance/PerformancePage.jsx';
import MessagesPage from './pages/messages/MessagesPage.jsx';
import AuditLogsPage from './pages/audit/AuditLogsPage.jsx';
import LeavePage from './pages/leave/LeavePage.jsx';
import PeerReviewsPage from './pages/peerReviews/PeerReviewsPage.jsx';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage.jsx';
import CompanySettingsPage from './pages/admin/CompanySettingsPage.jsx';
import UsersAdminPage from './pages/admin/UsersAdminPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterChoicePage />} />
        <Route path="/register/company" element={<RegisterCompanyPage />} />
        <Route path="/register/join" element={<RegisterJoinPage />} />
        <Route
          path="/join-requests"
          element={
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <JoinRequestsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/company-settings"
          element={
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <CompanySettingsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <UsersAdminPage />
            </RoleProtectedRoute>
          }
        />
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
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <DepartmentsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/departments/create"
          element={
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <CreateDepartmentPage />
            </RoleProtectedRoute>
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
          path="/leave"
          element={
            <ProtectedRoute>
              <LeavePage />
            </ProtectedRoute>
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
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/add"
          element={
            <RoleProtectedRoute allowedRoles={['Admin', 'Inventory Manager']}>
              <AddItemPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/procurement"
          element={
            <ProtectedRoute>
              <ProcurementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/procurement/create"
          element={
            <ProtectedRoute>
              <CreateRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <SuppliersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance"
          element={
            <ProtectedRoute>
              <PerformancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/peer-reviews"
          element={
            <ProtectedRoute>
              <PeerReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <AuditLogsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <RoleProtectedRoute
              allowedRoles={['Admin', 'Accountant', 'Finance Manager']}
            >
              <FinanceDashboardPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/finance/add"
          element={
            <RoleProtectedRoute
              allowedRoles={['Admin', 'Accountant', 'Finance Manager']}
            >
              <AddFinanceEntryPage />
            </RoleProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
