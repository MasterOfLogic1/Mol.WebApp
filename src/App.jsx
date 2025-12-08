import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingSocialPanel from './components/FloatingSocialPanel';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import UserBlog from './pages/UserBlog';
import UserBlogPost from './pages/UserBlogPost';
import Contact from './pages/Contact';
import Team from './pages/Team';
import Register from './pages/Register';
import Login from './pages/Login';
import Verification from './pages/Verification';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
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
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const location = useLocation();
  const pathname = location.pathname;
  const authRoutes = ['/register', '/login', '/reset-password'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/register/verification/');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  return (
    <div className="App">
      {!isAuthRoute && !isDashboardRoute && <Nav />}
      {!isAuthRoute && !isDashboardRoute && <FloatingSocialPanel />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/user/:username" element={<UserBlog />} />
          <Route path="/blog/user/:username/:slug" element={<UserBlogPost />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/team" element={<Team />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/verification/:token" element={<Verification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
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

