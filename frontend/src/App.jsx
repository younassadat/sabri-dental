import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";

function Protected({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function Shell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Shell>
              <Dashboard />
            </Shell>
          </Protected>
        }
      />
      <Route
        path="/patients"
        element={
          <Protected>
            <Shell>
              <Patients />
            </Shell>
          </Protected>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <Protected>
            <Shell>
              <PatientDetail />
            </Shell>
          </Protected>
        }
      />
      <Route
        path="/appointments"
        element={
          <Protected>
            <Shell>
              <Appointments />
            </Shell>
          </Protected>
        }
      />
      <Route
        path="/billing"
        element={
          <Protected>
            <Shell>
              <Billing />
            </Shell>
          </Protected>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
