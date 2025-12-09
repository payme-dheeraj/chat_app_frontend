import { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit2, Lock, LogOut, Camera, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { postsAPI, authAPI } from '../services/api';

function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
  });

  useEffect(() => {
    fetchMyPosts();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const fetchMyPosts = async () => {
    try {
      const response = await postsAPI.myPosts();
      if (response.data.success) {
        setMyPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setEditMode(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
        {/* Cover */}
        <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />
        
        {/* Avatar & Info */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-10 sm:-mt-12">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white shadow-lg">
                {user?.display_name?.charAt(0).toUpperCase()}
              </div>
              {editMode && (
                <button className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors active:scale-95">
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editMode ? (
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="text-xl sm:text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{user?.display_name}</h1>
              )}
              <p className="text-gray-500 text-sm sm:text-base truncate">@{user?.username}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full sm:w-auto">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors active:scale-95"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Save</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors active:scale-95"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mt-4">
            {editMode ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Write something about yourself..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            ) : (
              <p className="text-gray-600">{user?.bio || 'No bio yet'}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 sm:gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center flex-1 sm:flex-none">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{myPosts.length}</p>
              <p className="text-xs sm:text-sm text-gray-500">Posts</p>
            </div>
            <div className="text-center flex-1 sm:flex-none">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {user?.user_type === 'registered' ? 'Verified' : 'Anonymous'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Account Type</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Account Details</h2>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
            <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Username</p>
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">@{user?.username}</p>
            </div>
          </div>

          {user?.mobile_number && (
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">Mobile Number</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{user.mobile_number}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
            <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Account Type</p>
              <p className="font-medium text-gray-900 capitalize text-sm sm:text-base">{user?.user_type}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Settings</h2>
        
        <div className="space-y-2">
          {user?.user_type === 'registered' && (
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors text-left active:scale-[0.98]"
            >
              <Lock className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-700 text-sm sm:text-base">Change Password</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-red-50 transition-colors text-left text-red-600 active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm sm:text-base">Logout</span>
          </button>
        </div>
      </div>

      {/* My Posts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">My Posts</h2>
        
        {loading ? (
          <div className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">Loading...</div>
        ) : myPosts.length === 0 ? (
          <div className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">No posts yet</div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {myPosts.map(post => (
              <div key={post.id} className="aspect-square bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden">
                {post.post_type === 'image' && post.image ? (
                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                ) : post.post_type === 'video' && post.video ? (
                  <video src={post.video} className="w-full h-full object-cover" playsInline />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-1.5 sm:p-2 text-[10px] sm:text-xs text-gray-500 text-center leading-tight">
                    {post.content?.slice(0, 40) || post.post_type}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (formData.new_password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.changePassword(formData.old_password, formData.new_password);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(onClose, 2000);
      } else {
        setError(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md animate-fadeIn">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
              Password changed successfully!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={formData.old_password}
              onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileScreen;
