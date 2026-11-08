
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import './App.css';

function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function DashboardPlaceholder({ title }) {
  const { user, logout } = useAuth();

  return (
    <div className="container py-5">
      <div className="card p-4">
        <h2>{title}</h2>
        <p>Welcome, {user?.name}!</p>
        <p>Your MediCare dashboard will be built next.</p>
        <button
          className="btn btn-primary-custom"
          style={{ width: '120px' }}
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  return <Navigate to="/patient/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />

       <Route
  path="/patient/dashboard"
  element={
    <ProtectedRoute allowedRoles={['patient']}>
      <PatientDashboard />
    </ProtectedRoute>
  }
/>

        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DashboardPlaceholder title="Doctor Dashboard" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardPlaceholder title="Admin Dashboard" />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
