import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ManagementPage from './pages/ManagementPage';
import DirectoryPage from './pages/DirectoryPage';
import AdminLogin from './components/Admin/AdminLogin';
import AdminPanel from './components/Admin/AdminPanel';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AdminGate() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('tuk_admin_session') === 'active'
  );

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <AdminPanel 
      onLogout={() => {
        localStorage.removeItem('tuk_admin_session');
        setIsAuthenticated(false);
      }} 
    />
  );
}

export default function App() {
  const isAdminHost = window.location.hostname.toLowerCase().startsWith('admin.');

  if (isAdminHost) {
    return (
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<AdminGate />} />
          <Route path="/*" element={<AdminGate />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<LandingPage />} />
        
        {/* Public Information Pages */}
        <Route path="/management" element={<DirectoryPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        
        {/* Hidden Admin Portal */}
        <Route path="/admin-portal-v1" element={<AdminGate />} />
        
        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
