import { Routes, Route, Navigate } from 'react-router-dom';
import Account from './pages/Account.jsx';
import { useAuth } from './auth.jsx';
import { Layout, Protected } from './components.jsx';
import { Login, Register } from './pages/Auth.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import { StudentDrives, MyApplications } from './pages/StudentPlacement.jsx';
import StudentTests from './pages/StudentTests.jsx';
import Exam from './pages/Exam.jsx';
import AttemptResult from './pages/AttemptResult.jsx';
import Practice from './pages/Practice.jsx';
import Notifications from './pages/Notifications.jsx';
import Students from './pages/Students.jsx';
import ManageTests from './pages/ManageTests.jsx';
import TestEditor from './pages/TestEditor.jsx';
import TestResults from './pages/TestResults.jsx';
import QuestionBank from './pages/QuestionBank.jsx';
import { Companies, ManageDrives, ManageApplications } from './pages/Placement.jsx';
import { Members, AuditLogs } from './pages/Admin.jsx';

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

      {/* Dedicated, sidebar-free exam interface */}
      <Route element={<Protected allow={(u) => u.role === 'student'} />}>
        <Route path="/exam/:testId" element={<Exam />} />
      </Route>

      <Route element={<Protected />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="account" element={<Account />} />
          <Route element={<Protected allow={(u) => u.role === 'student'} />}>
            <Route path="profile" element={<Profile />} />
            <Route path="drives" element={<StudentDrives />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="tests" element={<StudentTests />} />
            <Route path="attempts/:id/result" element={<AttemptResult />} />
            <Route path="practice" element={<Practice />} />
          </Route>
          <Route element={<Protected allow={(u) => u.role === 'tpo_admin' || (['tpo_member', 'faculty'].includes(u.role) && u.coordinator?.active)} />}>
            <Route path="students" element={<Students />} />
            <Route path="manage/tests" element={<ManageTests />} />
            <Route path="manage/tests/new" element={<TestEditor />} />
            <Route path="manage/tests/:id/edit" element={<TestEditor />} />
            <Route path="manage/tests/:id/results" element={<TestResults />} />
            <Route path="manage/questions" element={<QuestionBank />} />
          </Route>
          <Route element={<Protected allow={(u) => u.role === 'tpo_admin'} />}>
            <Route path="manage/companies" element={<Companies />} />
            <Route path="manage/drives" element={<ManageDrives />} />
            <Route path="manage/applications" element={<ManageApplications />} />
            <Route path="admin/members" element={<Members />} />
            <Route path="admin/audit" element={<AuditLogs />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
