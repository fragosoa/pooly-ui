import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './layout/Navbar';
import PublicGallery from './pages/PublicGallery';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ResponseSubmission from './pages/ResponseSubmission';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';

// Shared layout wrapper
const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {children}
    </main>
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicGallery />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/submit/:eventId" element={<ResponseSubmission />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="create" element={<CreateEvent />} />
                    <Route path="events/:eventId" element={<EventDetails />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
