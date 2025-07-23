import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BidBuilderLogin from './components/BidBuilderLogin';
import BidBuilder from './components/BidBuilder';

interface LoginCredentials {
  email: string;
  password: string;
}

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
            !isAuthenticated ? (
              <BidBuilderLogin 
                onLogin={handleLogin}
                onLoginSuccess={handleLoginSuccess}
              />
            ) : (
              <Navigate to="/app" replace />
            )
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