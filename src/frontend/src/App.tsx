import { Routes, Route } from 'react-router-dom';
import { HomePage, RegisterPage, LoginPage, ForgotPasswordPage, DashboardPage, ContactPage, UnauthorizedPage, CreateCharacterPage, EditCharacterPage, CharacterDetailPage, GalleryPage, LegalPage } from './pages';
import { ProtectedRoute } from './components/auth';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="User"><DashboardPage /></ProtectedRoute>} />
      <Route path="/characters/create" element={<ProtectedRoute requiredRole="User"><CreateCharacterPage /></ProtectedRoute>} />
      <Route path="/characters/:id/edit" element={<ProtectedRoute requiredRole="User"><EditCharacterPage /></ProtectedRoute>} />
      <Route path="/characters/:id" element={<CharacterDetailPage />} />
      <Route path="/galerie" element={<GalleryPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/mentions-legales" element={<LegalPage slug="mentions-legales" />} />
      <Route path="/cgu" element={<LegalPage slug="cgu" />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </Routes>
  );
}

export default App;
