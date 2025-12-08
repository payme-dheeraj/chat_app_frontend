import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import SignupScreen from './pages/SignupScreen';
import FeedScreen from './pages/FeedScreen';
import ChatScreen from './pages/ChatScreen';
import ProfileScreen from './pages/ProfileScreen';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Route that requires registered user (not anonymous)
function RegisteredRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // Redirect anonymous users to feed
  if (user.user_type === 'anonymous') {
    return <Navigate to="/feed" replace />;
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  // Allow anonymous users to access login/signup pages
  if (user && user.user_type !== 'anonymous') {
    return <Navigate to="/feed" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <SplashScreen />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <LoginScreen />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <SignupScreen />
        </PublicRoute>
      } />
      <Route path="/feed" element={
        <ProtectedRoute>
          <Layout>
            <FeedScreen />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <RegisteredRoute>
          <Layout>
            <ChatScreen />
          </Layout>
        </RegisteredRoute>
      } />
      <Route path="/profile" element={
        <RegisteredRoute>
          <Layout>
            <ProfileScreen />
          </Layout>
        </RegisteredRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
