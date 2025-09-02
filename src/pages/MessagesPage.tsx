import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { authAPI, type Message, type MessageListResponse } from '../api/auth';
import { MessageViewModal } from '../components/MessageViewModal';
import { SendMessageModal } from '../components/SendMessageModal';

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyRecipient, setReplyRecipient] = useState('');
  const [replySubject, setReplySubject] = useState('');

  const loadMessages = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      let response: MessageListResponse;
      if (activeTab === 'inbox') {
        response = await authAPI.getInboxMessages(page);
      } else {
        response = await authAPI.getSentMessages(page);
      }
      
      setMessages(response.messages);
      setCurrentPage(response.page);
      setTotalPages(Math.ceil(response.total / response.limit));
      setSelectedMessages(new Set());
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMessage || '쪽지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMessages(1);
    }
  }, [activeTab, isAuthenticated]);

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await authAPI.markMessageAsRead(messageId);
      const now = new Date().toISOString();
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true, read_at: now } : msg
      ));
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, is_read: true, read_at: now } : null);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMessage || '읽음 처리에 실패했습니다.');
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await authAPI.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(null);
        setIsModalOpen(false);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMessage || '쪽지 삭제에 실패했습니다.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.size === 0) return;
    if (!confirm(`선택한 ${selectedMessages.size}개의 쪽지를 삭제하시겠습니까?`)) return;
    
    try {
      await Promise.all([...selectedMessages].map(id => authAPI.deleteMessage(id)));
      setMessages(prev => prev.filter(msg => !selectedMessages.has(msg.id)));
      setSelectedMessages(new Set());
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMessage || '쪽지 삭제에 실패했습니다.');
    }
  };

  const toggleMessageSelection = (messageId: number) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(messageId)) {
      newSelection.delete(messageId);
    } else {
      newSelection.add(messageId);
    }
    setSelectedMessages(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map(msg => msg.id)));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    
    // 받은 쪽지함에서 안읽은 메시지를 클릭하면 자동으로 읽음 처리
    if (activeTab === 'inbox' && !message.is_read) {
      handleMarkAsRead(message.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  const handleReply = (recipientUsername: string, replySubject: string) => {
    setReplyRecipient(recipientUsername);
    setReplySubject(replySubject);
    setIsReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setIsReplyModalOpen(false);
    setReplyRecipient('');
    setReplySubject('');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600">쪽지함에 접근하려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">쪽지함</h1>
          </div>

          {/* 탭 메뉴 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'inbox'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                받은 쪽지함
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'sent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                보낸 쪽지함
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* 쪽지 목록 */}
          <div className="p-6">
            {messages.length > 0 && (
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedMessages.size === messages.length}
                    onChange={toggleAllSelection}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">
                    전체 선택 ({selectedMessages.size}/{messages.length})
                  </span>
                </div>
                {selectedMessages.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    선택 삭제
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">로딩 중...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  {activeTab === 'inbox' ? '받은 쪽지가 없습니다.' : '보낸 쪽지가 없습니다.'}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                      !message.is_read && activeTab === 'inbox'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200'
                    }`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedMessages.has(message.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleMessageSelection(message.id);
                          }}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-20 flex-1 min-w-0">
                              <span className="font-medium text-gray-900 flex-shrink-0">
                                {activeTab === 'inbox' ? message.sender_username : message.receiver_username}
                              </span>
                              <span className="font-medium text-gray-800 truncate flex-1">
                                {message.subject}
                              </span>
                              {!message.is_read && activeTab === 'inbox' && (
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded flex-shrink-0">
                                  안읽음
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500 flex-shrink-0 ml-3">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => loadMessages(page)}
                    className={`px-3 py-1 rounded ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 메시지 보기 모달 */}
        <MessageViewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          message={selectedMessage}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDeleteMessage}
          onReply={handleReply}
          currentTab={activeTab}
        />

        {/* 답신 모달 */}
        <SendMessageModal
          isOpen={isReplyModalOpen}
          onClose={handleCloseReplyModal}
          recipientUsername={replyRecipient}
          replySubject={replySubject}
        />
      </div>
    </div>
  );
};