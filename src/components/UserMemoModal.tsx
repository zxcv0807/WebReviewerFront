import React, { useState, useEffect } from 'react';
import { authAPI, type UserMemo } from '../api/auth';

interface UserMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUsername: string;
}

export const UserMemoModal: React.FC<UserMemoModalProps> = ({
  isOpen,
  onClose,
  targetUsername
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMemo, setLoadingMemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingMemo, setExistingMemo] = useState<UserMemo | null>(null);

  // 기존 메모 불러오기
  const loadExistingMemo = async () => {
    setLoadingMemo(true);
    try {
      const memo = await authAPI.getUserMemo(targetUsername);
      setExistingMemo(memo);
      setContent(memo.memo || '');
    } catch (err) {
      // 메모가 없으면 에러가 발생할 수 있음 (404)
      setExistingMemo(null);
      setContent('');
    } finally {
      setLoadingMemo(false);
    }
  };

  useEffect(() => {
    if (isOpen && targetUsername) {
      loadExistingMemo();
    }
  }, [isOpen, targetUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('메모 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authAPI.saveUserMemo({
        target_username: targetUsername,
        memo: content.trim(),
      });
      
      setSuccess(existingMemo ? '메모가 수정되었습니다.' : '메모가 저장되었습니다.');
      
      // 성공 메시지 표시 후 모달 닫기
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
      
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMessage || '메모 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingMemo) return;
    if (!confirm('이 메모를 삭제하시겠습니까?')) return;
    
    setLoading(true);
    setError(null);

    try {
      await authAPI.deleteUserMemo(targetUsername);
      setSuccess('메모가 삭제되었습니다.');
      
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
      
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMessage || '메모 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
      setSuccess(null);
      setContent('');
      setExistingMemo(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm backdrop-brightness-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {targetUsername}님에 대한 메모
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

        {loadingMemo ? (
          <div className="text-center py-8">
            <div className="text-gray-500">기존 메모 불러오는 중...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모 내용
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError(null);
                }}
                rows={8}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={`${targetUsername}님에 대한 개인 메모를 작성하세요...`}
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                이 메모는 본인만 볼 수 있습니다.
              </p>
            </div>

            {existingMemo && existingMemo.updated_at && (
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <div>수정: {new Date(existingMemo.updated_at).toLocaleString('ko-KR')}</div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '저장 중...' : existingMemo ? '메모 수정' : '메모 저장'}
              </button>
              {existingMemo && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  삭제
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};