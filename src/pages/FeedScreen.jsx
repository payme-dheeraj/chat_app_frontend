import { useState, useEffect } from 'react';
import { Plus, Heart, MessageCircle, Share2, BarChart3, Image, Video, FileText, X, Send } from 'lucide-react';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function FeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postsAPI.list();
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await postsAPI.like(postId);
      if (response.data.success) {
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, is_liked: response.data.liked, likes_count: response.data.likes_count }
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleVote = async (postId, optionId) => {
    try {
      const response = await postsAPI.vote(postId, optionId);
      if (response.data.success) {
        setPosts(posts.map(post => 
          post.id === postId ? response.data.post : post
        ));
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Feed</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                  <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="w-full h-40 bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-500 mb-4">Be the first to share something!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 font-medium hover:underline"
          >
            Create your first post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              onVote={(optionId) => handleVote(post.id, optionId)}
              onComment={() => setShowCommentsModal(post)}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}

      {/* Floating Create Button (Mobile) */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="sm:hidden fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={(newPost) => {
            setPosts([newPost, ...posts]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          post={showCommentsModal}
          onClose={() => setShowCommentsModal(null)}
        />
      )}
    </div>
  );
}

function PostCard({ post, onLike, onVote, onComment, formatTime }) {
  const totalVotes = post.poll_options?.reduce((sum, opt) => sum + opt.votes_count, 0) || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="p-3 sm:p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
          {post.author.display_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{post.author.display_name}</p>
          <p className="text-sm text-gray-500 truncate">@{post.author.username} · {formatTime(post.created_at)}</p>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-3 sm:px-4 pb-3 text-gray-800 text-sm sm:text-base">{post.content}</p>
      )}

      {/* Image */}
      {post.post_type === 'image' && post.image && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <img
            src={post.image}
            alt="Post"
            className="w-full rounded-xl object-cover max-h-80 sm:max-h-96"
          />
        </div>
      )}

      {/* Video */}
      {post.post_type === 'video' && post.video && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <video
            src={post.video}
            controls
            playsInline
            className="w-full rounded-xl max-h-80 sm:max-h-96"
          />
        </div>
      )}

      {/* Poll */}
      {post.post_type === 'poll' && post.poll_options && (
        <div className="px-4 pb-4 space-y-2">
          {post.poll_options.map(option => {
            const percentage = totalVotes > 0 ? Math.round((option.votes_count / totalVotes) * 100) : 0;
            const isVoted = post.user_vote === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => !post.user_vote && onVote(option.id)}
                disabled={!!post.user_vote}
                className={`w-full relative overflow-hidden rounded-xl border-2 transition-all ${
                  isVoted 
                    ? 'border-blue-500 bg-blue-50' 
                    : post.user_vote 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {post.user_vote && (
                  <div
                    className={`absolute inset-y-0 left-0 ${isVoted ? 'bg-blue-200' : 'bg-gray-200'}`}
                    style={{ width: `${percentage}%` }}
                  />
                )}
                <div className="relative px-4 py-3 flex items-center justify-between">
                  <span className={`font-medium ${isVoted ? 'text-blue-700' : 'text-gray-700'}`}>
                    {option.option_text}
                  </span>
                  {post.user_vote && (
                    <span className={`text-sm font-semibold ${isVoted ? 'text-blue-600' : 'text-gray-500'}`}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          <p className="text-sm text-gray-500 text-center pt-1">
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="px-3 sm:px-4 py-3 border-t border-gray-100 flex items-center justify-around sm:justify-start sm:gap-6">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 sm:gap-2 transition-colors active:scale-95 p-2 -m-2 ${
            post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 sm:w-5 sm:h-5 ${post.is_liked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{post.likes_count}</span>
        </button>
        <button
          onClick={onComment}
          className="flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-blue-500 transition-colors active:scale-95 p-2 -m-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post.comments_count}</span>
        </button>
        <button className="flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-green-500 transition-colors active:scale-95 p-2 -m-2">
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
}

function CreatePostModal({ onClose, onPostCreated }) {
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (postType === 'text' && !content.trim()) {
      setError('Please enter some content');
      return;
    }

    if ((postType === 'image' || postType === 'video') && !file) {
      setError(`Please select ${postType === 'image' ? 'an image' : 'a video'}`);
      return;
    }

    if (postType === 'poll') {
      const validOptions = pollOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        setError('Please add at least 2 poll options');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('post_type', postType);
      formData.append('content', content);

      if (postType === 'image' && file) {
        formData.append('image', file);
      } else if (postType === 'video' && file) {
        formData.append('video', file);
      } else if (postType === 'poll') {
        pollOptions.filter(opt => opt.trim()).forEach(opt => {
          formData.append('poll_options', opt);
        });
      }

      const response = await postsAPI.create(formData);
      if (response.data.success) {
        onPostCreated(response.data.post);
      } else {
        setError('Failed to create post');
      }
    } catch (error) {
      setError(error.response?.data?.errors?.poll_options?.[0] || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const postTypes = [
    { id: 'text', icon: FileText, label: 'Text' },
    { id: 'image', icon: Image, label: 'Image' },
    { id: 'video', icon: Video, label: 'Video' },
    { id: 'poll', icon: BarChart3, label: 'Poll' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp sm:animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Post Type Selector */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2">
            {postTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setPostType(type.id);
                    setFile(null);
                    setPreview(null);
                    setError('');
                  }}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                    postType === type.id
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-500'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Caption/Text */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={postType === 'poll' ? 'Ask a question...' : "What's on your mind?"}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />

          {/* Image/Video Upload */}
          {(postType === 'image' || postType === 'video') && (
            <div>
              {preview ? (
                <div className="relative">
                  {postType === 'image' ? (
                    <img src={preview} alt="Preview" className="w-full rounded-xl max-h-64 object-cover" />
                  ) : (
                    <video src={preview} controls className="w-full rounded-xl max-h-64" />
                  )}
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    accept={postType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {postType === 'image' ? (
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  ) : (
                    <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  )}
                  <p className="text-gray-500">
                    Click to upload {postType === 'image' ? 'an image' : 'a video (max 10s)'}
                  </p>
                </label>
              )}
            </div>
          )}

          {/* Poll Options */}
          {postType === 'poll' && (
            <div className="space-y-2">
              {pollOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[index] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => removePollOption(index)}
                      className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 6 && (
                <button
                  onClick={addPollOption}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all"
                >
                  + Add Option
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentsModal({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await postsAPI.getComments(post.id);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    setSending(true);
    try {
      const response = await postsAPI.addComment(post.id, newComment);
      if (response.data.success) {
        setComments([response.data.comment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] flex flex-col animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Comments</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No comments yet. Be the first!</div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {comment.user.display_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <p className="font-semibold text-sm text-gray-900">{comment.user.display_name}</p>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
            />
            <button
              onClick={handleSendComment}
              disabled={sending || !newComment.trim()}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedScreen;
