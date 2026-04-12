import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
