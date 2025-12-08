import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Dice5, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function SplashScreen() {
  const navigate = useNavigate();
  const { generateAnonymous } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGenerateRandomId = async () => {
    setLoading(true);
    const result = await generateAnonymous();
    setLoading(false);
    
    if (result.success) {
      navigate('/feed');
    } else {
      alert(result.message || 'Failed to generate user');
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
        {/* Logo Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 animate-fadeIn">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FreeTalk
            </h1>
            <p className="text-gray-500 mt-2 text-center">
              Connect, Share & Chat with Everyone
            </p>
          </div>

          {/* Features */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">Posts</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500">Chat</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-2">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs text-gray-500">Connect</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGenerateRandomId}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
            >
              <Dice5 className="w-5 h-5" />
              {loading ? 'Generating...' : 'Start Posting Anonymously'}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <User className="w-5 h-5" />
              Login or Create Account
            </button>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-500 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
