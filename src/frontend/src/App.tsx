import { Routes, Route } from 'react-router-dom';
import { HomePage, RegisterPage, LoginPage, ForgotPasswordPage, DashboardPage, ContactPage, UnauthorizedPage } from './pages';
import { ProtectedRoute } from './components/auth';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="User"><DashboardPage /></ProtectedRoute>} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </Routes>
  );
}

export default App;
