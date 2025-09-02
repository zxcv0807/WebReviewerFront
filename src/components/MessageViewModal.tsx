import React from 'react';
import { type Message } from '../api/auth';

interface MessageViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  onMarkAsRead: (messageId: number) => void;
  onDelete: (messageId: number) => void;
  onReply: (recipientUsername: string, replySubject: string) => void;
  currentTab: 'inbox' | 'sent';
}

export const MessageViewModal: React.FC<MessageViewModalProps> = ({
  isOpen,
  onClose,
  message,
  onMarkAsRead,
  onDelete,
  onReply,
  currentTab
}) => {
  if (!isOpen || !message) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short'
    });
  };

  const handleMarkAsRead = () => {
    if (!message.is_read && currentTab === 'inbox') {
      onMarkAsRead(message.id);
    }
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 쪽지를 삭제하시겠습니까?')) {
      onDelete(message.id);
      onClose();
    }
  };

  const handleReply = () => {
    if (message && currentTab === 'inbox' && message.sender_username) {
      const replySubject = message.subject.startsWith('RE: ') 
        ? message.subject 
        : `RE: ${message.subject}`;
      onReply(message.sender_username, replySubject);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm backdrop-brightness-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">쪽지 보기</h3>
              <p className="text-sm text-gray-500">
                {currentTab === 'inbox' ? '받은 쪽지' : '보낸 쪽지'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 쪽지 정보 */}
        <div className="p-6 space-y-4">
          {/* 발신자/수신자 정보 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {currentTab === 'inbox' ? '보낸 사람' : '받는 사람'}:
                </span>
                <span className="font-semibold text-blue-600">
                  {currentTab === 'inbox' ? message.sender_username : message.receiver_username}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>보낸 시간: {formatDate(message.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!message.is_read && currentTab === 'inbox' && (
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  안읽음
                </span>
              )}
              {message.is_read && currentTab === 'inbox' && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  읽음
                </span>
              )}
            </div>
          </div>

          {/* 제목 */}
          <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-sm font-medium text-blue-700">제목</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{message.subject}</h2>
          </div>

          {/* 내용 */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">내용</span>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                {message.content}
              </p>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            {currentTab === 'inbox' && message.sender_username && (
              <button
                onClick={handleReply}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                답신
              </button>
            )}
            {!message.is_read && currentTab === 'inbox' && (
              <button
                onClick={handleMarkAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                읽음 처리
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              삭제
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};