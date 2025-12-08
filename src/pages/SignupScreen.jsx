import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, User, Lock, Phone, ArrowLeft, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function SignupScreen() {
  const navigate = useNavigate();
  const { signup, getRecaptchaKey } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    mobile_number: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [captchaSiteKey, setCaptchaSiteKey] = useState('');
  const recaptchaRef = useRef(null);

  useEffect(() => {
    // Load reCAPTCHA site key from backend
    const loadRecaptchaKey = async () => {
      const data = await getRecaptchaKey();
      setCaptchaEnabled(data.enabled);
      setCaptchaSiteKey(data.site_key);
      
      if (data.enabled && data.site_key) {
        // Load reCAPTCHA script
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.grecaptcha && recaptchaRef.current) {
            window.grecaptcha.ready(() => {
              window.grecaptcha.render(recaptchaRef.current, {
                sitekey: data.site_key,
                callback: (token) => setCaptchaToken(token),
                'expired-callback': () => setCaptchaToken(''),
              });
            });
          }
        };
        document.head.appendChild(script);
      }
    };
    loadRecaptchaKey();
  }, [getRecaptchaKey]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.mobile_number) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.mobile_number.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    // Check CAPTCHA if enabled
    if (captchaEnabled && !captchaToken) {
      setError('Please complete the CAPTCHA verification');
      return;
    }

    setLoading(true);
    // Use captcha token or 'dev-mode' for development
    const token = captchaEnabled ? captchaToken : 'dev-mode-no-captcha';
    const result = await signup(formData.username, formData.password, formData.mobile_number, token);
    setLoading(false);

    if (result.success) {
      navigate('/feed');
    } else {
      // Reset captcha on error
      if (window.grecaptcha && captchaEnabled) {
        window.grecaptcha.reset();
        setCaptchaToken('');
      }
      
      if (result.errors) {
        const errorMessages = Object.values(result.errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(result.message || 'Signup failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Signup Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 animate-fadeIn">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1 text-center">
              Sign up with your details
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Dev mode notice */}
          {!captchaEnabled && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <strong>Dev Mode:</strong> CAPTCHA is disabled. Set RECAPTCHA keys in .env to enable.
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a unique username"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* reCAPTCHA */}
            {captchaEnabled && (
              <div className="flex flex-col items-center">
                <div ref={recaptchaRef} className="g-recaptcha"></div>
                {captchaToken && (
                  <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (captchaEnabled && !captchaToken)}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupScreen;
