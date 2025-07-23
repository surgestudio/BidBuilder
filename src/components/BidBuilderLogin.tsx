import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginFormProps {
  onLogin?: (credentials: LoginCredentials) => Promise<void>;
  onLoginSuccess?: () => void;
}

const BidBuilderLogin: React.FC<LoginFormProps> = ({ onLogin, onLoginSuccess }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!credentials.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!credentials.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!credentials.password.trim()) {
      setError('Password is required');
      return false;
    }
    
    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (onLogin) {
        // Use the provided login function
        await onLogin(credentials);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Demo credentials check
        if (credentials.email === 'demo@bidbuilder.com' && credentials.password === 'demo123') {
          console.log('Demo login successful');
          alert('Login successful! In a real app with routing, you would be redirected to /bidbuilder');
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        } else {
          throw new Error('Invalid email or password');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold">BB</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BidBuilder</h1>
          <p className="text-gray-600">Pool Sales Quote Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                  placeholder="rep@poolcompany.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center touch-manipulation"
                  disabled={isLoading}
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <div className="flex items-center h-5">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
              </div>
              <div className="ml-3">
                <label htmlFor="remember" className="text-sm text-gray-700 select-none">
                  Keep me signed in
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>
        </div>

        {/* Demo Credentials (Remove in production) */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center mb-4">
          <p className="text-sm font-medium text-yellow-800 mb-1">Demo Credentials</p>
          <p className="text-xs text-yellow-700">
            Email: demo@bidbuilder.com<br />
            Password: demo123
          </p>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <button 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors touch-manipulation"
            style={{ minHeight: '44px' }}
            onClick={() => alert('Forgot password functionality would be implemented here')}
          >
            Forgot Password?
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Need help? Contact your system administrator
          </p>
        </div>

        {/* App Version (for debugging) */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">
            BidBuilder v1.0.0 | Mobile Optimized
          </p>
        </div>
      </div>
    </div>
  );
};

export default BidBuilderLogin;