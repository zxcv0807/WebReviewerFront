import React, { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientUsername?: string;
  replySubject?: string;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  recipientUsername = '',
  replySubject = ''
}) => {
  const [formData, setFormData] = useState({
    receiver_username: recipientUsername,
    subject: replySubject,
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // props가 변경될 때마다 formData 업데이트
  useEffect(() => {
    if (isOpen) {
      setFormData({
        receiver_username: recipientUsername,
        subject: replySubject,
        content: '',
      });
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, recipientUsername, replySubject]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.receiver_username.trim()) {
      setError('받는 사람을 입력해주세요.');
      return;
    }
    if (!formData.subject.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authAPI.sendMessage({
        receiver_username: formData.receiver_username.trim(),
        subject: formData.subject.trim(),
        content: formData.content.trim(),
      });
      
      setSuccess('쪽지가 성공적으로 발송되었습니다.');
      setFormData({
        receiver_username: recipientUsername,
        subject: replySubject,
        content: '',
      });
      
      // 성공 메시지 표시 후 모달 닫기
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
      
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMessage || '쪽지 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
      setSuccess(null);
      setFormData({
        receiver_username: recipientUsername,
        subject: replySubject,
        content: '',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm backdrop-brightness-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {replySubject ? '쪽지 답신' : '쪽지 보내기'}
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              받는 사람
            </label>
            <input
              type="text"
              name="receiver_username"
              value={formData.receiver_username}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="사용자명을 입력하세요"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={replySubject ? "답신 제목" : "쪽지 제목을 입력하세요"}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={6}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="쪽지 내용을 입력하세요"
              disabled={loading}
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '발송 중...' : '쪽지 보내기'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};