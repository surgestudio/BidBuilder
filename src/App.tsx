import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import BidBuilderLogin from './components/BidBuilderLogin';
import BidBuilder from './components/BidBuilder';
import BidBuilderCreateAccountPage from './components/BidBuilderCreateAccountPage';

interface LoginCredentials {
  email: string;
  password: string;
}

// Wrapper components to access useNavigate hook
const LoginWrapper: React.FC<{
  isAuthenticated: boolean;
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onLoginSuccess: () => void;
}> = ({ isAuthenticated, onLogin, onLoginSuccess }) => {
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <BidBuilderLogin 
      onLogin={onLogin}
      onLoginSuccess={onLoginSuccess}
      onCreateAccount={() => navigate('/create')}
    />
  );
};

const CreateAccountWrapper: React.FC<{
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}> = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <BidBuilderCreateAccountPage 
      onNavigateToLogin={() => navigate('/login')}
      onAccountCreated={() => {
        setIsAuthenticated(true);
        // Navigate to app after setting authentication
        setTimeout(() => navigate('/app'), 100);
      }}
    />
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    // Demo authentication logic
    if (credentials.email === 'demo@bidbuilder.com' && credentials.password === 'demo123') {
      setIsAuthenticated(true);
      return Promise.resolve();
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const handleLoginSuccess = () => {
    // Additional logic after successful login if needed
    console.log('User successfully logged in');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={
            <LoginWrapper 
              isAuthenticated={isAuthenticated}
              onLogin={handleLogin}
              onLoginSuccess={handleLoginSuccess}
            />
          } 
        />
        
        {/* Create Account Route - No authentication required */}
        <Route 
          path="/create" 
          element={
            <CreateAccountWrapper 
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
          } 
        />
        
        {/* Main App Route */}
        <Route 
          path="/app" 
          element={
            isAuthenticated ? (
              <BidBuilder onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Default Route - Redirect to login */}
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />} 
        />
        
        {/* Catch all other routes */}
        <Route 
          path="*" 
          element={<Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;