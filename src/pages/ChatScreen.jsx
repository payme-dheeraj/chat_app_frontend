import { useState, useEffect, useRef } from 'react';
import { Search, Send, ArrowLeft, Plus, MessageCircle, Image, Smile, MoreVertical } from 'lucide-react';
import { chatAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ChatScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      connectWebSocket(selectedConversation.id);
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await chatAPI.listConversations();
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await chatAPI.getMessages(conversationId);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const connectWebSocket = (conversationId) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat/${conversationId}/`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages(prev => [...prev, {
          id: data.message.id,
          sender: {
            id: data.message.sender_id,
            username: data.message.sender_username,
            display_name: data.message.sender_username,
          },
          message_type: data.message.message_type,
          content: data.message.content,
          created_at: data.message.created_at,
        }]);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage;
    setNewMessage('');
    setSendingMessage(true);

    try {
      // Try WebSocket first
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'text',
          content: messageContent,
          sender_id: user.id,
        }));
      } else {
        // Fallback to HTTP
        const response = await chatAPI.sendMessage(selectedConversation.id, {
          message_type: 'text',
          content: messageContent,
        });
        
        if (response.data.success) {
          setMessages(prev => [...prev, response.data.message]);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageContent); // Restore message on failure
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartConversation = async (otherUser) => {
    try {
      const response = await chatAPI.startConversation(otherUser.id);
      if (response.data.success) {
        const conversation = response.data.conversation;
        
        if (!response.data.existing) {
          setConversations(prev => [conversation, ...prev]);
        }
        
        setSelectedConversation(conversation);
        setShowNewChatModal(false);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p.id !== user.id) || conversation.participants[0];
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Mobile: Show either list or chat
  if (isMobileView) {
    if (selectedConversation) {
      return (
        <MobileChatView
          conversation={selectedConversation}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSend={handleSendMessage}
          onBack={() => setSelectedConversation(null)}
          user={user}
          getOtherParticipant={getOtherParticipant}
          formatTime={formatTime}
          messagesEndRef={messagesEndRef}
          sendingMessage={sendingMessage}
        />
      );
    }

    return (
      <MobileConversationList
        conversations={conversations}
        loading={loading}
        onSelect={setSelectedConversation}
        onNewChat={() => setShowNewChatModal(true)}
        getOtherParticipant={getOtherParticipant}
        formatTime={formatTime}
        showNewChatModal={showNewChatModal}
        setShowNewChatModal={setShowNewChatModal}
        onStartConversation={handleStartConversation}
      />
    );
  }

  // Desktop: Side-by-side view
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-120px)] flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="w-24 h-4 bg-gray-200 rounded" />
                      <div className="w-32 h-3 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No conversations yet</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-3 text-blue-600 font-medium hover:underline"
                >
                  Start a new chat
                </button>
              </div>
            ) : (
              conversations.map(conversation => {
                const other = getOtherParticipant(conversation);
                const isSelected = selectedConversation?.id === conversation.id;
                
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {other.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{other.display_name}</p>
                        {conversation.last_message && (
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.last_message?.content || 'No messages yet'}
                      </p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {conversation.unread_count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {getOtherParticipant(selectedConversation).display_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {getOtherParticipant(selectedConversation).display_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{getOtherParticipant(selectedConversation).username}
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => {
                  const isOwn = message.sender.id === user.id;
                  const showDate = index === 0 || 
                    formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);
                  
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                          <div className={`px-4 py-2 rounded-2xl ${
                            isOwn 
                              ? 'bg-blue-500 text-white rounded-br-md' 
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                          }`}>
                            <p>{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : ''}`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                    <Image className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onStartConversation={handleStartConversation}
        />
      )}
    </div>
  );
}

function MobileConversationList({ 
  conversations, loading, onSelect, onNewChat, getOtherParticipant, formatTime,
  showNewChatModal, setShowNewChatModal, onStartConversation 
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <button
            onClick={onNewChat}
            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-14 h-14 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                  <div className="w-32 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No conversations yet</p>
            <button
              onClick={onNewChat}
              className="text-blue-600 font-medium hover:underline"
            >
              Start a new chat
            </button>
          </div>
        ) : (
          conversations.map(conversation => {
            const other = getOtherParticipant(conversation);
            
            return (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className="w-full p-4 flex items-center gap-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {other.display_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">{other.display_name}</p>
                    {conversation.last_message && (
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.last_message?.content || 'No messages yet'}
                  </p>
                </div>
                {conversation.unread_count > 0 && (
                  <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {conversation.unread_count}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onStartConversation={onStartConversation}
        />
      )}
    </div>
  );
}

function MobileChatView({ 
  conversation, messages, newMessage, setNewMessage, onSend, onBack, 
  user, getOtherParticipant, formatTime, messagesEndRef, sendingMessage 
}) {
  const other = getOtherParticipant(conversation);

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-40">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
          {other.display_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{other.display_name}</p>
          <p className="text-sm text-gray-500">@{other.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map(message => {
          const isOwn = message.sender.id === user.id;
          
          return (
            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%]`}>
                <div className={`px-4 py-2 rounded-2xl ${
                  isOwn 
                    ? 'bg-blue-500 text-white rounded-br-md' 
                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                }`}>
                  <p>{message.content}</p>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : ''}`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={onSend}
            disabled={sendingMessage || !newMessage.trim()}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function NewChatModal({ onClose, onStartConversation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchUsers = async () => {
    setSearching(true);
    try {
      const response = await authAPI.searchUsers(searchQuery);
      if (response.data.success) {
        setSearchResults(response.data.users);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-fadeIn">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">New Chat</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searching ? (
            <div className="p-8 text-center text-gray-500">Searching...</div>
          ) : searchQuery.length < 2 ? (
            <div className="p-8 text-center text-gray-500">
              Type at least 2 characters to search
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {searchResults.map(user => (
                <button
                  key={user.id}
                  onClick={() => onStartConversation(user)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.display_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">{user.display_name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatScreen;
