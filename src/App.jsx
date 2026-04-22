import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './layout/Navbar';
import PublicGallery from './pages/PublicGallery';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PublicSurvey from './pages/PublicSurvey';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import Settings from './pages/Settings';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyNotice from './pages/PrivacyNotice';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <LanguageProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Encuesta pública - sin navbar para experiencia limpia */}
          <Route path="/encuesta/:publicId" element={<PublicSurvey />} />

          {/* Rutas con navbar */}
          <Route path="/" element={<><Navbar /><PublicGallery /></>} />
          <Route path="/login" element={<><Navbar /><Login /></>} />
          <Route path="/register" element={<><Navbar /><Register /></>} />
          <Route path="/admin" element={<><Navbar /><ProtectedRoute><AdminDashboard /></ProtectedRoute></>} />
          <Route path="/admin/create" element={<><Navbar /><ProtectedRoute><CreateEvent /></ProtectedRoute></>} />
          <Route path="/admin/events/:eventId" element={<><Navbar /><ProtectedRoute><EventDetails /></ProtectedRoute></>} />
          <Route path="/admin/settings" element={<><Navbar /><ProtectedRoute><Settings /></ProtectedRoute></>} />
          <Route path="/terms_of_use" element={<><Navbar /><TermsOfUse /></>} />
          <Route path="/privacy_notice" element={<><Navbar /><PrivacyNotice /></>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
