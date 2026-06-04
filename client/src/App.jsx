import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import HabitTrackerPage from './features/habits/HabitTrackerPage';
import WeeklyPlannerPage from './features/planner/WeeklyPlannerPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import AchievementsPage from './features/analytics/AchievementsPage';
import NotesPage from './features/notes/NotesPage';
import FinancePage from './features/finance/FinancePage';
import SettingsPage from './features/settings/SettingsPage';
import WeeklyPlansPage from './features/plans/WeeklyPlansPage';
import ToastContainer from './components/layout/ToastContainer';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center bg-[var(--bg-color)] text-[var(--text-primary)]">Loading PPOS...</div>;

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="habits" element={<HabitTrackerPage />} />
          <Route path="planner" element={<WeeklyPlannerPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="plans" element={<WeeklyPlansPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Other routes will go here */}
        </Route>
      </Routes>
      <ToastContainer />
    </>
  );
};

export default AppContent;
