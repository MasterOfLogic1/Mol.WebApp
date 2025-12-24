import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingSocialPanel from './components/FloatingSocialPanel';
import ImagePreloader from './components/ImagePreloader';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Journal from './pages/Journal';
import JournalPost from './pages/JournalPost';
import UserBlog from './pages/UserBlog';
import UserBlogPost from './pages/UserBlogPost';
import Contact from './pages/Contact';
import Team from './pages/Team';
import Register from './pages/Register';
import Login from './pages/Login';
import Verification from './pages/Verification';
import ResetPassword from './pages/ResetPassword';
import NewsletterVerify from './pages/NewsletterVerify';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Admin Route Component
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const location = useLocation();
  const pathname = location.pathname;
  const authRoutes = ['/register', '/login', '/reset-password', '/admin/login'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/register/verification/');
  const isDashboardRoute = pathname.startsWith('/apps') || pathname.startsWith('/admin');

  return (
    <div className="App">
      <ImagePreloader />
      {!isAuthRoute && !isDashboardRoute && <Nav />}
      {!isAuthRoute && !isDashboardRoute && <FloatingSocialPanel />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/journals" element={<Journal />} />
          <Route path="/journals/:slug" element={<JournalPost />} />
          <Route path="/journals/user/:username" element={<UserBlog />} />
          <Route path="/journals/user/:username/:slug" element={<UserBlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/team" element={<Team />} />
          <Route path="/newsletter/verify/:verification_token" element={<NewsletterVerify />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/verification/:token" element={<Verification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Navigate to="/admin/dashboard" replace />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/apps/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
        </Routes>
      {!isAuthRoute && !isDashboardRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

